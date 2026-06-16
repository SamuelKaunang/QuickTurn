package com.example.QucikTurn.Service;

import com.example.QucikTurn.Config.FirebaseConfig;
import com.example.QucikTurn.Entity.Notification;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.NotificationType;
import com.example.QucikTurn.Repository.NotificationRepository;
import com.example.QucikTurn.dto.NotificationDTO;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DeviceTokenService deviceTokenService;
    private final FirebaseConfig firebaseConfig;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate,
                               DeviceTokenService deviceTokenService,
                               FirebaseConfig firebaseConfig) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.deviceTokenService = deviceTokenService;
        this.firebaseConfig = firebaseConfig;
    }

    /**
     * Create and send a notification to a user
     */
    @Transactional
    public NotificationDTO createNotification(User user, NotificationType type,
            String title, String message) {
        Notification notification = new Notification(user, type, title, message);
        notification = notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO(notification);
        sendRealTimeNotification(user.getId(), dto);

        return dto;
    }

    /**
     * Create and send a notification with related entity info
     */
    @Transactional
    public NotificationDTO createNotification(User user, NotificationType type,
            String title, String message,
            String relatedEntityType, Long relatedEntityId,
            String actionUrl) {
        Notification notification = new Notification(user, type, title, message,
                relatedEntityType, relatedEntityId, actionUrl);
        notification = notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO(notification);
        sendRealTimeNotification(user.getId(), dto);

        return dto;
    }

    /**
     * Send real-time notification via WebSocket and Push Notification via FCM
     */
    private void sendRealTimeNotification(Long userId, NotificationDTO notification) {
        try {
            // Send to user-specific queue
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);

            // Also send unread count update
            long unreadCount = getUnreadCount(userId);
            messagingTemplate.convertAndSend("/topic/notifications/" + userId + "/count", unreadCount);
        } catch (Exception e) {
            // Log but don't fail - notification is still saved in DB
            System.err.println("Failed to send real-time notification: " + e.getMessage());
        }

        // Trigger FCM push notification asynchronously/safely
        try {
            if (firebaseConfig.isFirebaseEnabled()) {
                List<String> tokens = deviceTokenService.getTokensForUser(userId);
                if (tokens != null && !tokens.isEmpty()) {
                    com.google.firebase.messaging.Notification fcmNotification = 
                            com.google.firebase.messaging.Notification.builder()
                                    .setTitle(notification.getTitle())
                                    .setBody(notification.getMessage())
                                    .build();

                    for (String token : tokens) {
                        try {
                            Message msg = Message.builder()
                                    .setToken(token)
                                    .setNotification(fcmNotification)
                                    .putData("type", notification.getType() != null ? notification.getType().name() : "")
                                    .putData("relatedEntityType", notification.getRelatedEntityType() != null ? notification.getRelatedEntityType() : "")
                                    .putData("relatedEntityId", notification.getRelatedEntityId() != null ? notification.getRelatedEntityId().toString() : "")
                                    .putData("actionUrl", notification.getActionUrl() != null ? notification.getActionUrl() : "")
                                    .build();

                            FirebaseMessaging.getInstance().sendAsync(msg);
                        } catch (Exception e) {
                            System.err.println("Failed to send FCM token to " + token + ": " + e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to broadcast FCM notifications: " + e.getMessage());
        }
    }

    /**
     * Get paginated notifications for a user
     */
    public Page<NotificationDTO> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationDTO::new);
    }

    /**
     * Get unread notifications for a user
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Get unread count for a user
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark a single notification as read
     */
    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(userId))
                .map(n -> {
                    n.markAsRead();
                    notificationRepository.save(n);

                    // Send updated count
                    long unreadCount = getUnreadCount(userId);
                    messagingTemplate.convertAndSend("/topic/notifications/" + userId + "/count", unreadCount);

                    return true;
                })
                .orElse(false);
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        int updated = notificationRepository.markAllAsReadByUserId(userId);

        // Send updated count (0)
        messagingTemplate.convertAndSend("/topic/notifications/" + userId + "/count", 0L);

        return updated;
    }

    /**
     * Cleanup old read notifications (to be called by scheduler)
     */
    @Transactional
    public int cleanupOldNotifications(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        return notificationRepository.deleteOldReadNotifications(cutoffDate);
    }

    // ============ Helper methods for common notification scenarios ============

    /**
     * Notify client when a talent applies to their project
     */
    public void notifyApplicationReceived(User client, String talentName, String projectTitle, Long projectId) {
        createNotification(
                client,
                NotificationType.APPLICATION_RECEIVED,
                "New Application Received",
                talentName + " has applied to your project: " + projectTitle,
                "PROJECT", projectId,
                "/dashboardu");
    }

    /**
     * Notify talent when their application is accepted
     */
    public void notifyApplicationAccepted(User talent, String projectTitle, Long projectId) {
        createNotification(
                talent,
                NotificationType.APPLICATION_ACCEPTED,
                "Application Accepted! 🎉",
                "Congratulations! Your application for \"" + projectTitle + "\" has been accepted.",
                "PROJECT", projectId,
                "/dashboardm");
    }

    /**
     * Notify talent when their application is rejected
     */
    public void notifyApplicationRejected(User talent, String projectTitle, Long projectId) {
        createNotification(
                talent,
                NotificationType.APPLICATION_REJECTED,
                "Application Update",
                "Your application for \"" + projectTitle + "\" was not selected this time.",
                "PROJECT", projectId,
                "/dashboardm");
    }

    /**
     * Notify client when work is submitted
     */
    public void notifyWorkSubmitted(User client, String talentName, String projectTitle, Long submissionId) {
        createNotification(
                client,
                NotificationType.WORK_SUBMITTED,
                "Work Submitted",
                talentName + " has submitted work for \"" + projectTitle + "\". Please review.",
                "SUBMISSION", submissionId,
                "/dashboardu");
    }

    /**
     * Notify talent when work is accepted
     */
    public void notifyWorkAccepted(User talent, String projectTitle, Long projectId) {
        createNotification(
                talent,
                NotificationType.WORK_ACCEPTED,
                "Work Accepted! 🎉",
                "Your work for \"" + projectTitle + "\" has been accepted. Great job!",
                "PROJECT", projectId,
                "/dashboardm");
    }

    /**
     * Notify user when they receive a review
     */
    public void notifyReviewReceived(User user, String reviewerName, int rating) {
        createNotification(
                user,
                NotificationType.REVIEW_RECEIVED,
                "New Review Received",
                reviewerName + " gave you a " + rating + "-star review. Check your profile!",
                "REVIEW", null,
                "/profile-" + (user.getRole().name().equals("MAHASISWA") ? "mahasiswa" : "umkm"));
    }

    /**
     * Notify user when they receive a new chat message
     */
    public void notifyNewMessage(User recipient, String senderName, String content, Long senderId) {
        createNotification(
                recipient,
                NotificationType.NEW_MESSAGE,
                "Pesan Baru dari " + senderName,
                content.length() > 60 ? content.substring(0, 57) + "..." : content,
                "CHAT", senderId,
                "/chat/" + senderId);
    }
}

