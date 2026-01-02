package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ReportStatus;
import com.example.QucikTurn.Service.AzureBlobService;
import com.example.QucikTurn.Service.ReportService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.CreateReportRequest;
import com.example.QucikTurn.dto.ReportResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Controller for user reports and admin moderation.
 * All users can submit reports.
 * Only ADMIN can view and manage all reports.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final AzureBlobService azureBlobService;

    public ReportController(ReportService reportService, AzureBlobService azureBlobService) {
        this.reportService = reportService;
        this.azureBlobService = azureBlobService;
    }

    /**
     * Submit a new report (all authenticated users)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReportRequest request) {
        try {
            ReportResponse report = reportService.createReport(user, request);
            return ResponseEntity.ok(
                    ApiResponse.ok("Laporan berhasil dikirim. Tim kami akan meninjau dalam 1-3 hari kerja.", report));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * Upload evidence for a report
     */
    @PostMapping("/{reportId}/evidence")
    public ResponseEntity<ApiResponse<ReportResponse>> uploadEvidence(
            @PathVariable Long reportId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            // Validate file type (images only for evidence)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("Hanya file gambar yang diperbolehkan sebagai bukti."));
            }

            // Validate file size (max 10MB for evidence)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("Ukuran file maksimal 10MB."));
            }

            // Upload to Azure Blob Storage
            String url = azureBlobService.uploadFile(file, "reports");

            // Update report with evidence URL
            ReportResponse updated = reportService.updateReportEvidence(
                    reportId, url, file.getOriginalFilename());

            return ResponseEntity.ok(ApiResponse.ok("Bukti berhasil diunggah", updated));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.fail("Gagal mengunggah file: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * Get my reports (current user)
     */
    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(
            @AuthenticationPrincipal User user) {
        List<ReportResponse> reports = reportService.getMyReports(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Laporan saya", reports));
    }

    /**
     * Get single report by ID
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal User user) {
        try {
            ReportResponse report = reportService.getReportById(reportId);

            // Check ownership or admin
            boolean isOwner = report.reporterId().equals(user.getId());
            boolean isAdmin = user.getRole().name().equals("ADMIN");

            if (!isOwner && !isAdmin) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.fail("Anda tidak memiliki akses ke laporan ini."));
            }

            return ResponseEntity.ok(ApiResponse.ok("Detail laporan", report));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Get all reports (admin only)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getAllReports() {
        List<ReportResponse> reports = reportService.getAllReports();
        return ResponseEntity.ok(ApiResponse.ok("Semua laporan", reports));
    }

    /**
     * Get reports by status (admin only)
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getReportsByStatus(
            @PathVariable String status) {
        try {
            ReportStatus reportStatus = ReportStatus.valueOf(status.toUpperCase());
            List<ReportResponse> reports = reportService.getReportsByStatus(reportStatus);
            return ResponseEntity.ok(ApiResponse.ok("Laporan dengan status " + status, reports));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Status tidak valid"));
        }
    }

    /**
     * Update report status (admin only)
     */
    @PutMapping("/admin/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReportResponse>> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User admin) {
        try {
            String statusStr = request.get("status");
            String adminNotes = request.get("adminNotes");

            if (statusStr == null) {
                return ResponseEntity.badRequest().body(ApiResponse.fail("Status harus diisi"));
            }

            ReportStatus status = ReportStatus.valueOf(statusStr.toUpperCase());
            ReportResponse updated = reportService.updateReportStatus(reportId, status, adminNotes, admin);

            return ResponseEntity.ok(ApiResponse.ok("Status laporan diperbarui", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Status tidak valid"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * Get pending reports count (admin only)
     */
    @GetMapping("/admin/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPendingCount() {
        long count = reportService.getPendingReportsCount();
        return ResponseEntity.ok(ApiResponse.ok("Jumlah laporan pending", Map.of("count", count)));
    }
}
