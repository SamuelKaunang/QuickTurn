package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ProjectComplexity;
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
                String status, // The project's status (OPEN, CLOSED)
                User owner, // We need this so frontend can access owner.nama & owner.averageRating
                String myApplicationStatus, // The key new field: "PENDING", "REJECTED", "APPROVED", or null
                LocalDateTime finishingSubmittedAt,
                LocalDateTime finishedAt,
                String latestSubmissionStatus, // PENDING, APPROVED, REJECTED, or null
                String latestSubmissionFeedback, // Latest submission feedback from client

                // NEW FIELDS
                String requiredSkills, // Comma-separated skills
                String estimatedDuration, // Duration string (e.g., "1 week")
                ProjectComplexity complexity, // BEGINNER, INTERMEDIATE, EXPERT
                Integer applicantCount // Number of applicants (social proof)
) {
}
