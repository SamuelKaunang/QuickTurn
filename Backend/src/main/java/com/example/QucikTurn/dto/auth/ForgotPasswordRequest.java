package com.example.QucikTurn.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {
    @Email(message = "Format email salah woy")
    @NotBlank(message = "Email gak boleh kosong")
    private String email;

    // Getter Setter
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}