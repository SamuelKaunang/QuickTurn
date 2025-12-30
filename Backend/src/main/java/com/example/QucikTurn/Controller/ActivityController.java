package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.Activity;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ActivityService;
import com.example.QucikTurn.dto.ActivityDTO;
import com.example.QucikTurn.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    /**
     * Get recent activities for the authenticated user
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getRecentActivities(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "10") int limit) {

        List<Activity> activities = activityService.getRecentActivities(user.getId(), limit);
        List<ActivityDTO> dtos = activities.stream()
                .map(ActivityDTO::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Activities retrieved", dtos));
    }

    /**
     * Get all activities for the authenticated user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getAllActivities(
            @AuthenticationPrincipal User user) {

        List<Activity> activities = activityService.getAllActivities(user.getId());
        List<ActivityDTO> dtos = activities.stream()
                .map(ActivityDTO::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Activities retrieved", dtos));
    }
}
