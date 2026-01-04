package com.example.QucikTurn.Entity.enums;

/**
 * Types of notifications in the system
 */
public enum NotificationType {
    // Application-related
    APPLICATION_RECEIVED, // Client receives when talent applies
    APPLICATION_ACCEPTED, // Talent receives when accepted
    APPLICATION_REJECTED, // Talent receives when rejected

    // Project-related
    PROJECT_STARTED, // Both parties when project starts
    PROJECT_COMPLETED, // Both parties when completed
    PROJECT_DEADLINE_REMINDER, // Reminder before deadline

    // Work submission-related
    WORK_SUBMITTED, // Client receives when talent submits
    WORK_ACCEPTED, // Talent receives when work accepted
    WORK_REVISION_REQUESTED, // Talent receives when revision requested

    // Review-related
    REVIEW_RECEIVED, // User receives a review

    // Chat-related
    NEW_MESSAGE, // New chat message

    // System
    SYSTEM_ANNOUNCEMENT, // System-wide announcements
    ACCOUNT_UPDATE // Account-related updates
}
