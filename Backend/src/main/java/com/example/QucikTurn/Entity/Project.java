package com.example.QucikTurn.Entity;

import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Entity.enums.ProjectComplexity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner; // UMKM yang memposting

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal budget;

    @Column(nullable = false)
    private LocalDate deadline; // Tipe data konsisten dengan DTO

    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.OPEN;

    // NEW FIELDS
    @Column(length = 500)
    private String requiredSkills; // Comma-separated skills like "Figma, Photoshop, Corel"

    @Column(length = 50)
    private String estimatedDuration; // e.g., "3 days", "1 week", "2 weeks"

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ProjectComplexity complexity = ProjectComplexity.INTERMEDIATE; // BEGINNER, INTERMEDIATE, EXPERT

    @Column(nullable = false)
    private Integer applicantCount = 0; // Track number of applicants for social proof

    // BRIEF & ATTACHMENT - Only visible to accepted talents
    @Column(columnDefinition = "TEXT")
    private String briefText; // Detailed project brief/instructions for accepted talent

    @Column(length = 1000)
    private String attachmentUrl; // URL to file attachment (e.g., PDFs, design files)

    @Column(length = 255)
    private String attachmentName; // Original filename for display

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Finishing mechanism fields
    @Column(name = "finishing_submitted_at")
    private LocalDateTime finishingSubmittedAt;

    @Column(name = "finishing_link")
    private String finishingLink;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "finished_by_umkm_id")
    private Long finishedByUmkmId;

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // --- Getters & Setters ---
    public Long getId() {
        return id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // New fields getters/setters
    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(String estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public ProjectComplexity getComplexity() {
        return complexity;
    }

    public void setComplexity(ProjectComplexity complexity) {
        this.complexity = complexity;
    }

    public Integer getApplicantCount() {
        return applicantCount;
    }

    public void setApplicantCount(Integer applicantCount) {
        this.applicantCount = applicantCount;
    }

    public void incrementApplicantCount() {
        this.applicantCount = (this.applicantCount == null ? 0 : this.applicantCount) + 1;
    }

    // Finishing mechanism
    public LocalDateTime getFinishingSubmittedAt() {
        return finishingSubmittedAt;
    }

    public void setFinishingSubmittedAt(LocalDateTime finishingSubmittedAt) {
        this.finishingSubmittedAt = finishingSubmittedAt;
    }

    public String getFinishingLink() {
        return finishingLink;
    }

    public void setFinishingLink(String finishingLink) {
        this.finishingLink = finishingLink;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public Long getFinishedByUmkmId() {
        return finishedByUmkmId;
    }

    public void setFinishedByUmkmId(Long finishedByUmkmId) {
        this.finishedByUmkmId = finishedByUmkmId;
    }

    // Brief & Attachment getters/setters
    public String getBriefText() {
        return briefText;
    }

    public void setBriefText(String briefText) {
        this.briefText = briefText;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }
}
