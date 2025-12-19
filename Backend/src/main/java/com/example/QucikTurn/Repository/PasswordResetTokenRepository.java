package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.PasswordResetToken;
import com.example.QucikTurn.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // Cari berdasarkan verification code (untuk step verify-code)
    Optional<PasswordResetToken> findByVerificationCode(String verificationCode);

    // Cari berdasarkan reset token (untuk step reset-password)
    Optional<PasswordResetToken> findByResetToken(String resetToken);

    // Cari berdasarkan User (untuk hapus token lama sebelum buat baru)
    Optional<PasswordResetToken> findByUser(User user);

    // Bersih-bersih token yang sudah expired
    @Modifying
    @Query("delete from PasswordResetToken t where t.codeExpiryDate <= ?1")
    void deleteAllExpiredSince(LocalDateTime now);
}