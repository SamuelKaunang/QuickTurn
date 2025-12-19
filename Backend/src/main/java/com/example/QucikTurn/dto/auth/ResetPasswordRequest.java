package com.example.QucikTurn.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank(message = "Reset token gak boleh kosong")
    private String resetToken;

    @NotBlank(message = "Password baru gak boleh kosong")
    @Size(min = 6, message = "Password minimal 6 karakter dong")
    private String newPassword;

    // Getter Setter
    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}