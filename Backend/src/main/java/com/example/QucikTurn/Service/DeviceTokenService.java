package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.DeviceToken;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Repository.DeviceTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages FCM device-token persistence.
 * <p>
 * Each mobile device registers its FCM token after login so the backend can
 * later send push notifications via Firebase Cloud Messaging.
 */
@Service
public class DeviceTokenService {

    private final DeviceTokenRepository repo;

    public DeviceTokenService(DeviceTokenRepository repo) {
        this.repo = repo;
    }

    /**
     * Register (or re-register) a device token for the given user.
     * If the exact token already exists for this user we skip the insert.
     */
    @Transactional
    public void registerToken(User user, String token) {
        if (token == null || token.isBlank()) return;

        repo.findByUserIdAndToken(user.getId(), token)
                .ifPresentOrElse(
                        existing -> { /* already stored – nothing to do */ },
                        () -> repo.save(new DeviceToken(user, token))
                );
    }

    /**
     * Return all raw FCM token strings for a user so we can broadcast to
     * every device the user owns.
     */
    public List<String> getTokensForUser(Long userId) {
        return repo.findByUserId(userId)
                .stream()
                .map(DeviceToken::getToken)
                .collect(Collectors.toList());
    }

    /**
     * Remove all tokens for a user (call on logout / account deletion).
     */
    @Transactional
    public void removeAllTokens(Long userId) {
        repo.deleteByUserId(userId);
    }
}
