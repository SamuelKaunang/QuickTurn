package com.example.QucikTurn.dto.auth;

public class VerifyCodeResponse {
    private String resetToken; // Token untuk step reset password
    private String email; // Email user (auto-populated dari system)

    public VerifyCodeResponse() {
    }

    public VerifyCodeResponse(String resetToken, String email) {
        this.resetToken = resetToken;
        this.email = email;
    }

    // Getter Setter
    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
