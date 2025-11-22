package com.example.QucikTurn.Controller;

import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.auth.AuthResponse;
import com.example.QucikTurn.dto.auth.LoginRequest;
import com.example.QucikTurn.dto.auth.RegisterRequest;
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
}
