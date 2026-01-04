package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.Notification;
import com.example.QucikTurn.Entity.enums.NotificationType;
import java.time.LocalDateTime;

/**
 * DTO for Notification responses
 */
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String timeAgo; // Human-readable time like "2 hours ago"

    public NotificationDTO() {
    }

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.read = notification.isRead();
        this.relatedEntityType = notification.getRelatedEntityType();
        this.relatedEntityId = notification.getRelatedEntityId();
        this.actionUrl = notification.getActionUrl();
        this.createdAt = notification.getCreatedAt();
        this.readAt = notification.getReadAt();
        this.timeAgo = calculateTimeAgo(notification.getCreatedAt());
    }

    private String calculateTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null)
            return "";

        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();

        if (minutes < 1)
            return "Just now";
        if (minutes < 60)
            return minutes + " min ago";

        long hours = minutes / 60;
        if (hours < 24)
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";

        long days = hours / 24;
        if (days < 7)
            return days + " day" + (days > 1 ? "s" : "") + " ago";

        long weeks = days / 7;
        if (weeks < 4)
            return weeks + " week" + (weeks > 1 ? "s" : "") + " ago";

        long months = days / 30;
        return months + " month" + (months > 1 ? "s" : "") + " ago";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getRelatedEntityType() {
        return relatedEntityType;
    }

    public void setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
    }

    public Long getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(Long relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public String getTimeAgo() {
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }
}
