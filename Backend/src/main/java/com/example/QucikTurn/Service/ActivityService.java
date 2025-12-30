package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Activity;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Repository.ActivityRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    /**
     * Log a new activity for a user
     */
    @Transactional
    public Activity logActivity(User user, String type, String description) {
        Activity activity = new Activity(user, type, description);
        return activityRepository.save(activity);
    }

    /**
     * Log a new activity with related entity
     */
    @Transactional
    public Activity logActivity(User user, String type, String description, String relatedEntityType,
            Long relatedEntityId) {
        Activity activity = new Activity(user, type, description, relatedEntityType, relatedEntityId);
        return activityRepository.save(activity);
    }

    /**
     * Get recent activities for a user (default 10)
     */
    public List<Activity> getRecentActivities(Long userId, int limit) {
        return activityRepository.findRecentByUserId(userId, PageRequest.of(0, limit));
    }

    /**
     * Get all activities for a user
     */
    public List<Activity> getAllActivities(Long userId) {
        return activityRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Activity type constants
    public static final String TYPE_APPLIED = "APPLIED";
    public static final String TYPE_ACCEPTED = "ACCEPTED";
    public static final String TYPE_REJECTED = "REJECTED";
    public static final String TYPE_SUBMITTED = "SUBMITTED";
    public static final String TYPE_WORK_ACCEPTED = "WORK_ACCEPTED";
    public static final String TYPE_WORK_REJECTED = "WORK_REJECTED";
    public static final String TYPE_PROJECT_POSTED = "PROJECT_POSTED";
    public static final String TYPE_CONTRACT_SIGNED = "CONTRACT_SIGNED";
    public static final String TYPE_PROJECT_COMPLETED = "PROJECT_COMPLETED";
}
