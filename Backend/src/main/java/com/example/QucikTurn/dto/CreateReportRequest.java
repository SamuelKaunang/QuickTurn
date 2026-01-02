package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.enums.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for submitting a user report.
 */
public record CreateReportRequest(
        @NotNull(message = "Jenis laporan harus dipilih") ReportType type,

        @NotBlank(message = "Subjek laporan tidak boleh kosong") @Size(max = 200, message = "Subjek maksimal 200 karakter") String subject,

        @NotBlank(message = "Deskripsi laporan tidak boleh kosong") @Size(max = 5000, message = "Deskripsi maksimal 5000 karakter") String description,

        // Optional: Related project ID for contract issues
        Long relatedProjectId,

        // Optional: Reported user ID for user complaints
        Long reportedUserId) {
}
