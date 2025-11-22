package com.example.QucikTurn.dto.auth;

import jakarta.validation.constraints.*;

public record LoginRequest(
        @NotBlank @Email @Size(max=190) String email,
        @NotBlank @Size(min=8, max=100) String password
) {}
