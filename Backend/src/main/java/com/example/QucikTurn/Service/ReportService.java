package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.Report;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ReportStatus;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.ReportRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.CreateReportRequest;
import com.example.QucikTurn.dto.ReportResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for handling user reports and admin moderation.
 */
@Service
@SuppressWarnings("null")
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public ReportService(ReportRepository reportRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    /**
     * Create a new report
     */
    @Transactional
    public ReportResponse createReport(User reporter, CreateReportRequest request) {
        Report report = new Report(reporter, request.type(), request.subject(), request.description());

        // Set related project if provided
        if (request.relatedProjectId() != null) {
            Project project = projectRepository.findById(request.relatedProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            report.setRelatedProject(project);
        }

        // Set reported user if provided
        if (request.reportedUserId() != null) {
            User reportedUser = userRepository.findById(request.reportedUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            report.setReportedUser(reportedUser);
        }

        Report saved = reportRepository.save(report);
        log.info("Report created: ID={}, Type={}, Reporter={}",
                saved.getId(), saved.getType(), reporter.getEmail());

        return ReportResponse.from(saved);
    }

    /**
     * Update report with evidence file URL
     */
    @Transactional
    public ReportResponse updateReportEvidence(Long reportId, String evidenceUrl, String evidenceFilename) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setEvidenceUrl(evidenceUrl);
        report.setEvidenceFilename(evidenceFilename);

        return ReportResponse.from(reportRepository.save(report));
    }

    /**
     * Get reports by current user
     */
    public List<ReportResponse> getMyReports(Long userId) {
        return reportRepository.findByReporterId(userId).stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get all reports (admin only)
     */
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get reports by status (admin only)
     */
    public List<ReportResponse> getReportsByStatus(ReportStatus status) {
        return reportRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get single report by ID
     */
    public ReportResponse getReportById(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return ReportResponse.from(report);
    }

    /**
     * Update report status (admin only)
     */
    @Transactional
    public ReportResponse updateReportStatus(Long reportId, ReportStatus status, String adminNotes, User admin) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        if (adminNotes != null && !adminNotes.isEmpty()) {
            report.setAdminNotes(adminNotes);
        }
        report.setHandledBy(admin);
        report.setHandledAt(LocalDateTime.now());

        log.info("Report {} status updated to {} by admin {}", reportId, status, admin.getEmail());

        return ReportResponse.from(reportRepository.save(report));
    }

    /**
     * Get count of pending reports (for admin dashboard)
     */
    public long getPendingReportsCount() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }
}
