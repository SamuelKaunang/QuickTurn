package com.example.QucikTurn.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_token")
public class PasswordResetToken {

    // Kita set waktu kadaluarsa token, standar industri biasanya 15-30 menit.
    // Di sini gue set 15 menit biar aman.
    private static final int EXPIRATION = 15;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ini kodenya, nanti isinya string acak (UUID)
    @Column(nullable = false, unique = true)
    private String token;

    // Ini yang nyambungin Token ke User lo.
    // OneToOne karena satu user idealnya cuma punya satu token aktif reset password.
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // --- CONSTRUCTORS ---

    // Empty constructor buat Hibernate/JPA (Wajib ada)
    public PasswordResetToken() {}

    // Constructor utama yang bakal lo pake di Service nanti
    public PasswordResetToken(User user, String token) {
        this.user = user;
        this.token = token;
        // Otomatis set waktu expired: Waktu sekarang + 15 menit
        this.expiryDate = LocalDateTime.now().plusMinutes(EXPIRATION);
    }

    // --- HELPER METHOD (Biar logic gak numpuk di Service) ---

    // Cek apakah token udah basi atau belum
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }

    // --- GETTERS & SETTERS ---

    public Long getId() { return id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}