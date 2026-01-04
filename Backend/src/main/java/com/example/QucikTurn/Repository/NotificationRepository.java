package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a user, ordered by creation date (newest first)
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Find unread notifications for a user
     */
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    /**
     * Count unread notifications for a user
     */
    long countByUserIdAndReadFalse(Long userId);

    /**
     * Mark all notifications as read for a user
     */
    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.read = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);

    /**
     * Delete old read notifications (cleanup job)
     * Keeps notifications for 30 days after being read
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.read = true AND n.readAt < :cutoffDate")
    int deleteOldReadNotifications(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);

    /**
     * Find notifications by related entity
     */
    List<Notification> findByRelatedEntityTypeAndRelatedEntityId(String relatedEntityType, Long relatedEntityId);
}
