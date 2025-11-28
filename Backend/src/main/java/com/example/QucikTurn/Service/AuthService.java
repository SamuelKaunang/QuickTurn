package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.PasswordResetToken; // Import Entity Token
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.PasswordResetTokenRepository; // Import Repo Token
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Security.JwtService;
import com.example.QucikTurn.dto.auth.AuthResponse;
import com.example.QucikTurn.dto.auth.ForgotPasswordRequest; // Import DTO baru
import com.example.QucikTurn.dto.auth.LoginRequest;
import com.example.QucikTurn.dto.auth.RegisterRequest;
import com.example.QucikTurn.dto.auth.ResetPasswordRequest; // Import DTO baru
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Biar aman pas delete token

import java.util.HashMap;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepo; // New Dependency
    private final EmailService emailService;              // New Dependency
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // Update Constructor buat Inject dependency baru
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

    // -------- REGISTER (Gak Berubah) --------
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

        String token = jwtService.generateToken(user.getUsername(), claims);
        return new AuthResponse(true, "Registration successful", token, "Bearer", (int) jwtService.getExpires());
    }

    // -------- LOGIN (Gak Berubah) --------
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

        String token = jwtService.generateToken(user.getUsername(), claims);
        return new AuthResponse(true, "Login successful", token, "Bearer", (int) jwtService.getExpires());
    }

    // -------- NEW: FORGOT PASSWORD --------
    public void processForgotPassword(ForgotPasswordRequest req) {
        // 1. Cari user, kalau gak ada throw error (nanti ditangkap controller)
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email tidak ditemukan di sistem kami."));

        // 2. Generate token random
        String tokenString = UUID.randomUUID().toString();

        // 3. Simpan ke DB (Hapus token lama user ini kalau ada, opsional tapi rapi)
        tokenRepo.findByUser(user).ifPresent(tokenRepo::delete);

        PasswordResetToken token = new PasswordResetToken(user, tokenString);
        tokenRepo.save(token);

        // 4. Kirim Email (Pastikan method ini ada di EmailService)
        emailService.sendResetTokenEmail(user.getEmail(), tokenString);
    }

    // -------- NEW: RESET PASSWORD --------
    @Transactional // Pake transactional biar kalau gagal save, delete tokennya batal
    public void processResetPassword(ResetPasswordRequest req) {
        // 1. Cari token
        PasswordResetToken token = tokenRepo.findByToken(req.getToken())
                .orElseThrow(() -> new RuntimeException("Token invalid atau tidak ditemukan!"));

        // 2. Cek expired
        if (token.isExpired()) {
            throw new RuntimeException("Token sudah kadaluarsa. Silakan request ulang.");
        }

        // 3. Ganti Password User
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // 4. Hapus token biar gak dipake lagi
        tokenRepo.delete(token);
    }
}