package com.example.QucikTurn.Service;

import com.example.QucikTurn.dto.auth.AuthResponse;
import com.example.QucikTurn.dto.auth.LoginRequest;
import com.example.QucikTurn.dto.auth.RegisterRequest;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
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

        // Buat token
        var claims = new HashMap<String, Object>();
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(user.getUsername(), claims);
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

        String token = jwtService.generateToken(user.getUsername(), claims);
        return new AuthResponse(true, "Login successful", token, "Bearer", (int) jwtService.getExpires());
    }
}
