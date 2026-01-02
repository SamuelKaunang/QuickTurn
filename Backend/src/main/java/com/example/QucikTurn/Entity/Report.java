package com.example.QucikTurn.Entity;

import com.example.QucikTurn.Entity.enums.ReportStatus;
import com.example.QucikTurn.Entity.enums.ReportType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for user reports/feedback to admin moderation.
 * Both MAHASISWA and UMKM can submit reports about:
 * - Bugs/technical issues
 * - Contract/project problems
 * - User complaints
 * - Payment issues
 * - Other feedback
 */
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportType type;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    // Optional: Related project for contract issues
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_project_id")
    private Project relatedProject;

    // Optional: Reported user for user complaints
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    // Evidence/screenshot URL (stored in Azure Blob)
    @Column(length = 1000)
    private String evidenceUrl;

    @Column(length = 255)
    private String evidenceFilename;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    // Admin response/notes
    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by_id")
    private User handledBy;

    @Column(name = "handled_at")
    private LocalDateTime handledAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Report() {
    }

    public Report(User reporter, ReportType type, String subject, String description) {
        this.reporter = reporter;
        this.type = type;
        this.subject = subject;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public User getReporter() {
        return reporter;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public ReportType getType() {
        return type;
    }

    public void setType(ReportType type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Project getRelatedProject() {
        return relatedProject;
    }

    public void setRelatedProject(Project relatedProject) {
        this.relatedProject = relatedProject;
    }

    public User getReportedUser() {
        return reportedUser;
    }

    public void setReportedUser(User reportedUser) {
        this.reportedUser = reportedUser;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public void setEvidenceUrl(String evidenceUrl) {
        this.evidenceUrl = evidenceUrl;
    }

    public String getEvidenceFilename() {
        return evidenceFilename;
    }

    public void setEvidenceFilename(String evidenceFilename) {
        this.evidenceFilename = evidenceFilename;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public User getHandledBy() {
        return handledBy;
    }

    public void setHandledBy(User handledBy) {
        this.handledBy = handledBy;
    }

    public LocalDateTime getHandledAt() {
        return handledAt;
    }

    public void setHandledAt(LocalDateTime handledAt) {
        this.handledAt = handledAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
