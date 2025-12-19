package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.PasswordResetToken;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.PasswordResetTokenRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Security.JwtService;
import com.example.QucikTurn.dto.auth.AuthResponse;
import com.example.QucikTurn.dto.auth.ForgotPasswordRequest;
import com.example.QucikTurn.dto.auth.LoginRequest;
import com.example.QucikTurn.dto.auth.RegisterRequest;
import com.example.QucikTurn.dto.auth.ResetPasswordRequest;
import com.example.QucikTurn.dto.auth.VerifyCodeRequest;
import com.example.QucikTurn.dto.auth.VerifyCodeResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
            PasswordResetTokenRepository tokenRepo,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // -------- REGISTER --------
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            return new AuthResponse(false, "Email already registered", null, null, 0);
        }

        User user = new User();
        user.setNama(request.nama());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role() == null ? Role.MAHASISWA : request.role());
        userRepository.save(user);

        var claims = new HashMap<String, Object>();
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(user.getEmail(), claims);
        return new AuthResponse(true, "Registration successful", token, "Bearer", (int) jwtService.getExpires());
    }

    // -------- LOGIN --------
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (Exception e) {
            return new AuthResponse(false, "Invalid email or password", null, null, 0);
        }

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        var claims = new HashMap<String, Object>();
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(user.getEmail(), claims);
        return new AuthResponse(true, "Login successful", token, "Bearer", (int) jwtService.getExpires());
    }

    // -------- STEP 1: FORGOT PASSWORD (Kirim verification code ke email) --------
    public void processForgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmail(req.getEmail()).ifPresent(user -> {
            // Hapus token lama kalau ada
            tokenRepo.findByUser(user).ifPresent(tokenRepo::delete);

            // Buat token baru dengan verification code
            PasswordResetToken token = new PasswordResetToken(user);
            tokenRepo.save(token);

            // Kirim email dengan verification code
            emailService.sendVerificationCodeEmail(user.getEmail(), token.getVerificationCode());
        });
        // Tidak throw error kalau email tidak ditemukan (prevent user enumeration)
    }

    // -------- STEP 2: VERIFY CODE (Validasi code, return reset token) --------
    @Transactional
    public VerifyCodeResponse verifyResetCode(VerifyCodeRequest req) {
        // Cari token berdasarkan verification code
        PasswordResetToken token = tokenRepo.findByVerificationCode(req.getCode())
                .orElseThrow(() -> new RuntimeException("Kode verifikasi tidak valid!"));

        // Cek apakah code sudah expired
        if (token.isCodeExpired()) {
            throw new RuntimeException("Kode verifikasi sudah kadaluarsa. Silakan request ulang.");
        }

        // Cek apakah sudah pernah diverifikasi
        if (token.isCodeVerified()) {
            throw new RuntimeException("Kode sudah pernah digunakan. Silakan request ulang.");
        }

        // Mark as verified dan generate reset token
        token.markCodeVerified();
        tokenRepo.save(token);

        // Return reset token dan email (auto-populated)
        return new VerifyCodeResponse(token.getResetToken(), token.getUser().getEmail());
    }

    // -------- STEP 3: RESET PASSWORD (Ganti password dengan reset token) --------
    @Transactional
    public void processResetPassword(ResetPasswordRequest req) {
        // Cari token berdasarkan reset token
        PasswordResetToken token = tokenRepo.findByResetToken(req.getResetToken())
                .orElseThrow(() -> new RuntimeException("Reset token tidak valid!"));

        // Pastikan code sudah diverifikasi
        if (!token.isCodeVerified()) {
            throw new RuntimeException("Kode belum diverifikasi. Silakan verifikasi kode terlebih dahulu.");
        }

        // Cek apakah reset token sudah expired
        if (token.isResetTokenExpired()) {
            throw new RuntimeException("Reset token sudah kadaluarsa. Silakan request ulang dari awal.");
        }

        // Ganti password user
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // Hapus token biar gak bisa dipake lagi
        tokenRepo.delete(token);
    }
}
