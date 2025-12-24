package com.example.QucikTurn.dto.auth;

public record AuthResponse(
        boolean success,
        String message,
        String accessToken,
        String tokenType,
        long expiresIn,
        String role // <--- NEW FIELD
) {
    // Helper for success response
    public static AuthResponse ok(String token, long exp, String role) {
        return new AuthResponse(true, "Login successful", token, "Bearer", exp, role);
    }

    // Helper for failure response
    public static AuthResponse bad(String msg) {
        return new AuthResponse(false, msg, null, null, 0, null);
    }
}