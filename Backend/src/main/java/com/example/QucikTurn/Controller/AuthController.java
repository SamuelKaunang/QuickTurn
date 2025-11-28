package com.example.QucikTurn.Controller;

import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.auth.AuthResponse;
import com.example.QucikTurn.dto.auth.ForgotPasswordRequest; // Import
import com.example.QucikTurn.dto.auth.LoginRequest;
import com.example.QucikTurn.dto.auth.RegisterRequest;
import com.example.QucikTurn.dto.auth.ResetPasswordRequest; // Import
import com.example.QucikTurn.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService svc;
    public AuthController(AuthService svc){ this.svc = svc; }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req){
        var res = svc.register(req);
        return ResponseEntity.status(res.success()?201:400).body(ApiResponse.ok("Register ok", res));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req){
        var res = svc.login(req);
        return ResponseEntity.status(res.success()?200:401).body(
                res.success()? ApiResponse.ok("Login ok", res) : ApiResponse.fail(res.message()));
    }

    // -------- NEW ENDPOINT: FORGOT PASSWORD --------
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            svc.processForgotPassword(req);
            // Kita return 200 OK walaupun email gak ada (security practice),
            // tapi karena ini project kuliah/personal, return error message juga gapapa biar gampang debug.
            // Di sini gue bikin return success message.
            return ResponseEntity.ok(ApiResponse.ok("Link reset password telah dikirim ke email kamu.", null));
        } catch (RuntimeException e) {
            // Tangkap error dari service (misal email gak ketemu)
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // -------- NEW ENDPOINT: RESET PASSWORD --------
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        try {
            svc.processResetPassword(req);
            return ResponseEntity.ok(ApiResponse.ok("Password berhasil diubah! Silakan login ulang.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}