package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for UMKM's projects including applicant count
 */
public record UmkmProjectResponse(
        Long id,
        String title,
        String description,
        String category,
        BigDecimal budget,
        LocalDate deadline,
        String status,
        User owner,
        LocalDateTime finishingSubmittedAt,
        LocalDateTime finishedAt,
        Integer applicantCount // Total number of applicants for this project
) {
}
