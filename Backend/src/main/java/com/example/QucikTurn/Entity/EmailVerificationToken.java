package com.example.QucikTurn.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for storing email verification tokens.
 * Uses a UUID token in a clickable link instead of 6-digit codes.
 */
@Entity
@Table(name = "email_verification_token")
public class EmailVerificationToken {

    // Token expires after 24 hours
    private static final int TOKEN_EXPIRATION_HOURS = 24;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique verification token (UUID)
    @Column(nullable = false, unique = true)
    private String token;

    // User to verify
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    // Expiry timestamp
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // When the verification was completed
    private LocalDateTime verifiedAt;

    // --- CONSTRUCTORS ---

    public EmailVerificationToken() {
    }

    public EmailVerificationToken(User user) {
        this.user = user;
        this.token = UUID.randomUUID().toString();
        this.expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);
    }

    // --- HELPER METHODS ---

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }

    public void markVerified() {
        this.verifiedAt = LocalDateTime.now();
    }

    // --- GETTERS & SETTERS ---

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
