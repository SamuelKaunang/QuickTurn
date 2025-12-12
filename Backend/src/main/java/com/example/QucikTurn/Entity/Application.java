package com.example.QucikTurn.Entity;

import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    private User student; // Variabel ini yang dipanggil "getStudent()" di Service

    @Column(name = "proposal_text", nullable = false, columnDefinition = "TEXT")
    private String proposal; // Variabel ini yang dipanggil "getProposal()" di Service

    @Column(name = "bid_amount", nullable = false)
    private BigDecimal bidAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Finishing mechanism fields
    @Column(name = "finishing_submitted_at")
    private LocalDateTime finishingSubmittedAt;
    
    @Column(name = "finishing_link")
    private String finishingLink;
    
    @Column(name = "is_finished_by_student")
    private Boolean isFinishedByStudent = false;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public String getProposal() { return proposal; }
    public void setProposal(String proposal) { this.proposal = proposal; }

    public BigDecimal getBidAmount() { return bidAmount; }
    public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getFinishingSubmittedAt() { return finishingSubmittedAt; }
    public void setFinishingSubmittedAt(LocalDateTime finishingSubmittedAt) { this.finishingSubmittedAt = finishingSubmittedAt; }
    public String getFinishingLink() { return finishingLink; }
    public void setFinishingLink(String finishingLink) { this.finishingLink = finishingLink; }
    public Boolean getIsFinishedByStudent() { return isFinishedByStudent; }
    public void setIsFinishedByStudent(Boolean isFinishedByStudent) { this.isFinishedByStudent = isFinishedByStudent; }
}
