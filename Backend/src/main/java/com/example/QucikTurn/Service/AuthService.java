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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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
            // FIXED: Added null for the role field in error case
            return new AuthResponse(false, "Email already registered", null, null, 0, null);
        }

        User user = new User();
        user.setNama(request.nama());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        // SECURITY FIX P0: Whitelist allowed roles to prevent privilege escalation
        // Only MAHASISWA and UMKM are allowed during self-registration
        // ADMIN role can only be assigned by existing admins through admin panel
        Role requestedRole = request.role();
        if (requestedRole == null) {
            requestedRole = Role.MAHASISWA; // Default role
        } else if (requestedRole != Role.MAHASISWA && requestedRole != Role.UMKM) {
            // Prevent mass assignment attack - only whitelist MAHASISWA and UMKM
            log.warn("Attempted privilege escalation: user tried to register as {} with email: {}",
                    requestedRole, maskEmail(request.email()));
            requestedRole = Role.MAHASISWA; // Downgrade to safe default
        }
        user.setRole(requestedRole);
        userRepository.save(user);

        var claims = new HashMap<String, Object>();
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(user.getEmail(), claims);

        // FIXED: Added user.getRole().name() to the response
        return new AuthResponse(true, "Registration successful", token, "Bearer", (int) jwtService.getExpires(),
                user.getRole().name());
    }

    // -------- LOGIN --------
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (Exception e) {
            // FIXED: Added null for the role field in error case
            return new AuthResponse(false, "Invalid email or password", null, null, 0, null);
        }

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        var claims = new HashMap<String, Object>();
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(user.getEmail(), claims);

        // FIXED: Added user.getRole().name() to the response
        return new AuthResponse(true, "Login successful", token, "Bearer", (int) jwtService.getExpires(),
                user.getRole().name());
    }

    // -------- STEP 1: FORGOT PASSWORD (Kirim verification code ke email) --------
    public void processForgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);

        if (user == null) {
            // SECURITY: Don't reveal if user exists, log masked email for debugging
            log.info("Password reset requested for: {}", maskEmail(req.getEmail()));
            return;
        }

        try {
            // Delete any existing token for this user
            tokenRepo.findByUser(user).ifPresent(tokenRepo::delete);

            // Create and save new token
            PasswordResetToken token = new PasswordResetToken(user);
            tokenRepo.save(token);

            // Send email with verification code
            log.info("Sending verification code to: {}", maskEmail(user.getEmail()));
            emailService.sendVerificationCodeEmail(user.getEmail(), token.getVerificationCode());
            log.info("Verification code sent successfully to: {}", maskEmail(user.getEmail()));

        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", maskEmail(user.getEmail()), e);
            throw new RuntimeException("Gagal mengirim email. Silakan coba lagi nanti.");
        }
    }

    /**
     * SECURITY: Mask email for logging (e.g., "sam***@gmail.com")
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 3) {
            return local.charAt(0) + "***@" + domain;
        }
        return local.substring(0, 3) + "***@" + domain;
    }

    // -------- STEP 2: VERIFY CODE (Validasi code, return reset token) --------
    @Transactional
    public VerifyCodeResponse verifyResetCode(VerifyCodeRequest req) {
        PasswordResetToken token = tokenRepo.findByVerificationCode(req.getCode())
                .orElseThrow(() -> new RuntimeException("Kode verifikasi tidak valid!"));

        if (token.isCodeExpired()) {
            throw new RuntimeException("Kode verifikasi sudah kadaluarsa. Silakan request ulang.");
        }

        if (token.isCodeVerified()) {
            throw new RuntimeException("Kode sudah pernah digunakan. Silakan request ulang.");
        }

        token.markCodeVerified();
        tokenRepo.save(token);

        return new VerifyCodeResponse(token.getResetToken(), token.getUser().getEmail());
    }

    // -------- STEP 3: RESET PASSWORD (Ganti password dengan reset token) --------
    @Transactional
    public void processResetPassword(ResetPasswordRequest req) {
        PasswordResetToken token = tokenRepo.findByResetToken(req.getResetToken())
                .orElseThrow(() -> new RuntimeException("Reset token tidak valid!"));

        if (!token.isCodeVerified()) {
            throw new RuntimeException("Kode belum diverifikasi. Silakan verifikasi kode terlebih dahulu.");
        }

        if (token.isResetTokenExpired()) {
            throw new RuntimeException("Reset token sudah kadaluarsa. Silakan request ulang dari awal.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        tokenRepo.delete(token);
    }

    // -------- OAUTH2 SELECT ROLE (For new Google users) --------
    @Transactional
    public AuthResponse selectRole(String jwtToken, com.example.QucikTurn.dto.auth.SelectRoleRequest req) {
        // Extract email from JWT token
        String email = jwtService.username(jwtToken);

        if (email == null) {
            throw new RuntimeException("Token tidak valid!");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan!"));

        // Only allow role selection for newly created users (within 5 minutes)
        // This prevents abuse of role changing
        java.time.LocalDateTime fiveMinutesAgo = java.time.LocalDateTime.now().minusMinutes(5);
        if (user.getCreatedAt() == null || user.getCreatedAt().isBefore(fiveMinutesAgo)) {
            throw new RuntimeException("Role hanya bisa dipilih saat pertama kali mendaftar.");
        }

        // Validate and set role
        String roleStr = req.getRole().toUpperCase();
        Role selectedRole;

        switch (roleStr) {
            case "CLIENT":
            case "UMKM":
                selectedRole = Role.UMKM;
                break;
            case "TALENT":
            case "MAHASISWA":
                selectedRole = Role.MAHASISWA;
                break;
            default:
                throw new RuntimeException("Role tidak valid! Pilih CLIENT atau TALENT.");
        }

        user.setRole(selectedRole);
        userRepository.save(user);

        log.info("User {} selected role: {}", maskEmail(email), selectedRole.name());

        // Generate new JWT with updated role
        var claims = new HashMap<String, Object>();
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());

        String newToken = jwtService.generateToken(user.getEmail(), claims);

        return new AuthResponse(true, "Role berhasil dipilih!", newToken, "Bearer",
                (int) jwtService.getExpires(), user.getRole().name());
    }
}