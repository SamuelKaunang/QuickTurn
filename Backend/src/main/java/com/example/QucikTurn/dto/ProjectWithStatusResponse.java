package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProjectWithStatusResponse(
    Long id,
    String title,
    String description,
    String category,
    BigDecimal budget,
    LocalDate deadline,
    String status,       // The project's status (OPEN, CLOSED)
    User owner,          // We need this so frontend can access owner.nama & owner.averageRating
    String myApplicationStatus, // ✅ The key new field: "PENDING", "REJECTED", "APPROVED", or null
    LocalDateTime finishingSubmittedAt,
    LocalDateTime finishedAt
) {}