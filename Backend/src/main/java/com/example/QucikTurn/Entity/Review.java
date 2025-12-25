package com.example.QucikTurn.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating; // 1 to 5

    @Column(columnDefinition = "TEXT")
    private String comment;

    private LocalDateTime createdAt;

    // Who wrote the review?
    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    // Who is being reviewed? (The Student or The UMKM)
    @ManyToOne
    @JoinColumn(name = "reviewed_user_id")
    private User reviewedUser;

    // Which project is this for?
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // Constructor
    public Review() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }

    public User getReviewedUser() { return reviewedUser; }
    public void setReviewedUser(User reviewedUser) { this.reviewedUser = reviewedUser; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
}