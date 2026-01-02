package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.Report;
import com.example.QucikTurn.Entity.enums.ReportStatus;
import com.example.QucikTurn.Entity.enums.ReportType;
import java.time.LocalDateTime;

/**
 * Response DTO for report data.
 */
public record ReportResponse(
        Long id,
        ReportType type,
        String subject,
        String description,
        String evidenceUrl,
        String evidenceFilename,
        ReportStatus status,
        String adminNotes,
        Long relatedProjectId,
        String relatedProjectTitle,
        Long reportedUserId,
        String reportedUserName,
        Long reporterId,
        String reporterName,
        String reporterEmail,
        LocalDateTime createdAt,
        LocalDateTime handledAt) {
    public static ReportResponse from(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getType(),
                report.getSubject(),
                report.getDescription(),
                report.getEvidenceUrl(),
                report.getEvidenceFilename(),
                report.getStatus(),
                report.getAdminNotes(),
                report.getRelatedProject() != null ? report.getRelatedProject().getId() : null,
                report.getRelatedProject() != null ? report.getRelatedProject().getTitle() : null,
                report.getReportedUser() != null ? report.getReportedUser().getId() : null,
                report.getReportedUser() != null ? report.getReportedUser().getNama() : null,
                report.getReporter().getId(),
                report.getReporter().getNama(),
                report.getReporter().getEmail(),
                report.getCreatedAt(),
                report.getHandledAt());
    }
}
