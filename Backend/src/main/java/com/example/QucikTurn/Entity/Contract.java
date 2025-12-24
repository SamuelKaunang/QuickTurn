package com.example.QucikTurn.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "umkm_id", nullable = false)
    private User umkm;

    @Column(columnDefinition = "TEXT", nullable = false) // Stores the long contract text
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    
    public User getUmkm() { return umkm; }
    public void setUmkm(User umkm) { this.umkm = umkm; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
}