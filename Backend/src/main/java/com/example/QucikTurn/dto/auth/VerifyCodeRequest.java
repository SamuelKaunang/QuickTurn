package com.example.QucikTurn.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VerifyCodeRequest {
    @NotBlank(message = "Code gak boleh kosong")
    @Size(min = 6, max = 6, message = "Code harus 6 digit")
    private String code;

    // Getter Setter
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
