package com.example.QucikTurn.Entity;

import com.example.QucikTurn.Entity.enums.ProjectStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="projects")
public class Project {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="owner_id", nullable=false)
    private User owner; // UMKM yang memposting

    @Column(nullable=false)
    private String title;

    @Column(nullable=false, columnDefinition="TEXT")
    private String description;

    @Column(nullable=false)
    private String category;

    @Column(nullable=false)
    private BigDecimal budget;

    @Column(nullable=false)
    private LocalDate deadline; // Tipe data konsisten dengan DTO

    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.OPEN;

    @Column(nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable=false)
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
    void onUpdate(){ this.updatedAt = LocalDateTime.now(); }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getFinishingSubmittedAt() { return finishingSubmittedAt; }
    public void setFinishingSubmittedAt(LocalDateTime finishingSubmittedAt) { this.finishingSubmittedAt = finishingSubmittedAt; }
    public String getFinishingLink() { return finishingLink; }
    public void setFinishingLink(String finishingLink) { this.finishingLink = finishingLink; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
    public Long getFinishedByUmkmId() { return finishedByUmkmId; }
    public void setFinishedByUmkmId(Long finishedByUmkmId) { this.finishedByUmkmId = finishedByUmkmId; }
}
