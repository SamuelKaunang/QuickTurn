package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.enums.ProjectComplexity;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateProjectRequest(
        @NotBlank(message = "Judul tidak boleh kosong") String title,

        @NotBlank(message = "Deskripsi tidak boleh kosong") String description,

        @NotBlank(message = "Kategori tidak boleh kosong") String category,

        @NotNull(message = "Budget harus diisi") @Min(value = 0, message = "Budget tidak boleh minus") BigDecimal budget,

        @NotNull(message = "Deadline harus diisi") @Future(message = "Deadline harus di masa depan") LocalDate deadline,

        // NEW FIELDS
        String requiredSkills, // Comma-separated skills (e.g., "Figma, Photoshop")
        String estimatedDuration, // Duration string (e.g., "1 week", "3 days")
        ProjectComplexity complexity, // BEGINNER, INTERMEDIATE, EXPERT
        String briefText // Detailed instructions for accepted talent (private)
) {
}
