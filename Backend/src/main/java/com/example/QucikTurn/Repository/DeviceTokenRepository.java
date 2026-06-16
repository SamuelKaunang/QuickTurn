package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    /** All tokens belonging to a user (one per device). */
    List<DeviceToken> findByUserId(Long userId);

    /** Find an existing token row to avoid duplicates. */
    Optional<DeviceToken> findByUserIdAndToken(Long userId, String token);

    /** Remove all tokens for a user (e.g. on logout or account deletion). */
    void deleteByUserId(Long userId);
}
