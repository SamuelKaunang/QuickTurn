package com.example.QucikTurn.dto.auth;

public record AuthResponse(
        boolean success,
        String message,
        String accessToken,
        String tokenType,
        long expiresIn
) {
    public static AuthResponse ok(String token, long exp){
        return new AuthResponse(true, "Login successful", token, "Bearer", exp);
    }
    public static AuthResponse bad(String msg){
        return new AuthResponse(false, msg, null, null, 0);
    }
}
