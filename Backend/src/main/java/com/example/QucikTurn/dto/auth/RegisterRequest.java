package com.example.QucikTurn.dto.auth;

import com.example.QucikTurn.Entity.enums.Role;
import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank @Size(max=150) String nama,
        @NotBlank @Email @Size(max=190) String email,
        @NotBlank @Size(min=8, max=100) String password,
        Role role
) {}
