package com.example.QucikTurn.Entity;

import jakarta.persistence.*;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_token")
public class PasswordResetToken {

    // Waktu kadaluarsa verification code: 5 menit
    private static final int CODE_EXPIRATION = 5;
    // Waktu kadaluarsa reset token (setelah code verified): 5 menit
    private static final int RESET_TOKEN_EXPIRATION = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 6-digit verification code yang dikirim ke email
    @Column(nullable = false, unique = true)
    private String verificationCode;

    // Reset token (UUID) yang dikasih setelah code verified
    @Column(unique = true)
    private String resetToken;

    // Flag untuk cek apakah code sudah diverifikasi
    @Column(nullable = false)
    private boolean codeVerified = false;

    // Relasi ke User
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    // Waktu expired untuk verification code
    @Column(nullable = false)
    private LocalDateTime codeExpiryDate;

    // Waktu expired untuk reset token (di-set setelah code verified)
    private LocalDateTime resetTokenExpiryDate;

    // --- CONSTRUCTORS ---

    public PasswordResetToken() {
    }

    public PasswordResetToken(User user) {
        this.user = user;
        this.verificationCode = generateVerificationCode();
        this.codeExpiryDate = LocalDateTime.now().plusMinutes(CODE_EXPIRATION);
        this.codeVerified = false;
    }

    // --- HELPER METHODS ---

    // Generate 6-digit random code
    private static String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(1000000); // 0 to 999999
        return String.format("%06d", code);
    }

    // Cek apakah verification code sudah expired
    public boolean isCodeExpired() {
        return LocalDateTime.now().isAfter(this.codeExpiryDate);
    }

    // Cek apakah reset token sudah expired
    public boolean isResetTokenExpired() {
        if (this.resetTokenExpiryDate == null)
            return true;
        return LocalDateTime.now().isAfter(this.resetTokenExpiryDate);
    }

    // Generate reset token setelah code verified
    public void markCodeVerified() {
        this.codeVerified = true;
        this.resetToken = UUID.randomUUID().toString();
        this.resetTokenExpiryDate = LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRATION);
    }

    // --- GETTERS & SETTERS ---

    public Long getId() {
        return id;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public boolean isCodeVerified() {
        return codeVerified;
    }

    public void setCodeVerified(boolean codeVerified) {
        this.codeVerified = codeVerified;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCodeExpiryDate() {
        return codeExpiryDate;
    }

    public void setCodeExpiryDate(LocalDateTime codeExpiryDate) {
        this.codeExpiryDate = codeExpiryDate;
    }

    public LocalDateTime getResetTokenExpiryDate() {
        return resetTokenExpiryDate;
    }

    public void setResetTokenExpiryDate(LocalDateTime resetTokenExpiryDate) {
        this.resetTokenExpiryDate = resetTokenExpiryDate;
    }
}