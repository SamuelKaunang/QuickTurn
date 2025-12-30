package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.Activity;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public record ActivityDTO(
        Long id,
        String type,
        String description,
        String relatedEntityType,
        Long relatedEntityId,
        LocalDateTime createdAt,
        String timeAgo) {
    public static ActivityDTO from(Activity activity) {
        return new ActivityDTO(
                activity.getId(),
                activity.getType(),
                activity.getDescription(),
                activity.getRelatedEntityType(),
                activity.getRelatedEntityId(),
                activity.getCreatedAt(),
                formatTimeAgo(activity.getCreatedAt()));
    }

    private static String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null)
            return "";

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);

        if (minutes < 1) {
            return "Just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
        } else if (hours < 24) {
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        } else if (days < 7) {
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        } else if (days < 30) {
            long weeks = days / 7;
            return weeks + " week" + (weeks > 1 ? "s" : "") + " ago";
        } else {
            long months = days / 30;
            return months + " month" + (months > 1 ? "s" : "") + " ago";
        }
    }
}
