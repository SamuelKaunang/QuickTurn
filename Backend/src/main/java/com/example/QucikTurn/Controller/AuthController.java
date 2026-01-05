package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.auth.AuthResponse;
import com.example.QucikTurn.dto.auth.ForgotPasswordRequest;
import com.example.QucikTurn.dto.auth.LoginRequest;
import com.example.QucikTurn.dto.auth.RegisterRequest;
import com.example.QucikTurn.dto.auth.ResetPasswordRequest;
import com.example.QucikTurn.dto.auth.VerifyCodeRequest;
import com.example.QucikTurn.dto.auth.VerifyCodeResponse;
import com.example.QucikTurn.Service.AuthService;
import com.example.QucikTurn.Service.EmailVerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService svc;
    private final EmailVerificationService emailVerificationService;

    public AuthController(AuthService svc, EmailVerificationService emailVerificationService) {
        this.svc = svc;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        var res = svc.register(req);
        return ResponseEntity.status(res.success() ? 201 : 400).body(ApiResponse.ok("Register ok", res));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        var res = svc.login(req);
        return ResponseEntity.status(res.success() ? 200 : 401).body(
                res.success() ? ApiResponse.ok("Login ok", res) : ApiResponse.fail(res.message()));
    }

    // -------- STEP 1: FORGOT PASSWORD (Kirim verification code) --------
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            svc.processForgotPassword(req);
            return ResponseEntity.ok(ApiResponse.ok("Jika email terdaftar, kode verifikasi telah dikirim.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // -------- STEP 2: VERIFY CODE (Validasi code, return reset token) --------
    @PostMapping("/verify-reset-code")
    public ResponseEntity<ApiResponse<VerifyCodeResponse>> verifyResetCode(@Valid @RequestBody VerifyCodeRequest req) {
        try {
            VerifyCodeResponse response = svc.verifyResetCode(req);
            return ResponseEntity.ok(ApiResponse.ok("Kode verifikasi valid!", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // -------- STEP 3: RESET PASSWORD (Ganti password) --------
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        try {
            svc.processResetPassword(req);
            return ResponseEntity.ok(ApiResponse.ok("Password berhasil diubah! Silakan login ulang.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // -------- OAUTH2 SELECT ROLE (For new Google users) --------
    @PostMapping("/select-role")
    public ResponseEntity<ApiResponse<AuthResponse>> selectRole(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody com.example.QucikTurn.dto.auth.SelectRoleRequest req) {
        try {
            // Extract token from "Bearer <token>"
            String token = authHeader.replace("Bearer ", "");
            AuthResponse response = svc.selectRole(token, req);
            return ResponseEntity.ok(ApiResponse.ok("Role berhasil dipilih!", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ============================================================
    // EMAIL VERIFICATION ENDPOINTS
    // ============================================================

    /**
     * Verify email using token from email link.
     * This is called when user clicks the verification link.
     */
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyEmail(@RequestParam String token) {
        try {
            User user = emailVerificationService.verifyEmail(token);
            return ResponseEntity.ok(ApiResponse.ok("Email berhasil diverifikasi!", Map.of(
                    "verified", true,
                    "email", user.getEmail(),
                    "name", user.getNama())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * Send/resend verification email to the authenticated user.
     * Call this when user needs a new verification link.
     */
    @PostMapping("/send-verification")
    public ResponseEntity<ApiResponse<String>> sendVerificationEmail(@AuthenticationPrincipal User user) {
        try {
            if (user.isEmailVerified()) {
                return ResponseEntity.ok(ApiResponse.ok("Email sudah terverifikasi.", null));
            }
            emailVerificationService.sendVerificationEmail(user);
            return ResponseEntity.ok(ApiResponse.ok("Email verifikasi telah dikirim. Silakan cek inbox Anda.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * Check if current user's email is verified.
     * Frontend can poll this to update UI.
     */
    @GetMapping("/verification-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVerificationStatus(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Status verifikasi", Map.of(
                "emailVerified", user.isEmailVerified(),
                "email", user.getEmail())));
    }
}
