package com.example.QucikTurn.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ApplicantResponse(
        Long applicationId,
        Long userId,
        String userName,
        String userEmail,
        String proposal,
        BigDecimal bidAmount,
        String status, // PENDING, APPROVED, REJECTED
        LocalDateTime appliedAt
) {}