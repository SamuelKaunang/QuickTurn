package com.example.QucikTurn.Controller;

import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.auth.AuthResponse;
import com.example.QucikTurn.dto.auth.ForgotPasswordRequest;
import com.example.QucikTurn.dto.auth.LoginRequest;
import com.example.QucikTurn.dto.auth.RegisterRequest;
import com.example.QucikTurn.dto.auth.ResetPasswordRequest;
import com.example.QucikTurn.dto.auth.VerifyCodeRequest;
import com.example.QucikTurn.dto.auth.VerifyCodeResponse;
import com.example.QucikTurn.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService svc;

    public AuthController(AuthService svc) {
        this.svc = svc;
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
}
