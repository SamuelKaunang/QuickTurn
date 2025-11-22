package com.example.QucikTurn.dto;

import java.math.BigDecimal;

// DTO untuk menampilkan siapa yang melamar + isi proposalnya
public record ProjectApplicantResponse(
        Long applicationId,
        Long studentId,
        String studentName,
        String studentEmail,
        String proposalText,
        BigDecimal bidAmount,
        String status // PENDING, APPROVED, REJECTED
) {}