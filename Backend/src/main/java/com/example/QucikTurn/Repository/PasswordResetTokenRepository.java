package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.PasswordResetToken;
import com.example.QucikTurn.Entity.User; // Import entity User lo
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Date;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // 1. Method utama: Cari token berdasarkan string tokennya
    // Return Optional biar kita bisa cek null dengan elegan (ifPresent, dll)
    Optional<PasswordResetToken> findByToken(String token);

    // 2. (Optional tapi Bagus) Cari token berdasarkan User
    // Berguna kalau lo mau cek "User ini udah request reset password belum sih?"
    Optional<PasswordResetToken> findByUser(User user);

    // 3. (Pro Tip) Bersih-bersih token sampah
    // Query ini buat ngehapus semua token yang udah expired biar database gak penuh sampah
    // Lo bisa panggil ini pake Scheduler nanti (fitur tambahan aja)
    @Modifying
    @Query("delete from PasswordResetToken t where t.expiryDate <= ?1")
    void deleteAllExpiredSince(Date now);
}