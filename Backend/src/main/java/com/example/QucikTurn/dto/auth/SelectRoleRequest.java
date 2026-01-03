package com.example.QucikTurn.dto.auth;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for setting user role after OAuth2 login.
 * New OAuth users have null role and must select either CLIENT (UMKM) or TALENT
 * (MAHASISWA).
 */
public class SelectRoleRequest {

    @NotNull(message = "Role is required")
    private String role; // "CLIENT" or "TALENT"

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
