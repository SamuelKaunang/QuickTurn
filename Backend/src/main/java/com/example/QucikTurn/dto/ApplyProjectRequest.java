package com.example.QucikTurn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public record ApplyProjectRequest(
        @NotBlank(message = "Proposal tidak boleh kosong")
        String proposal,
        
        @NotNull(message = "Bid amount harus diisi")
        @Min(value = 0, message = "Bid amount tidak boleh negatif")
        BigDecimal bidAmount
) {
}