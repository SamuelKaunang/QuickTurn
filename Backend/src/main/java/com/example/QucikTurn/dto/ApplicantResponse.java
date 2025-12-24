package com.example.QucikTurn.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ApplicantResponse(
    Long id,              // This matches 'app.id' in frontend
    Long studentId,
    String studentName,
    String studentEmail,
    String proposal,
    BigDecimal bidAmount,
    String status,
    LocalDateTime appliedAt
) {}