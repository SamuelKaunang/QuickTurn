package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.Activity;
import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ActivityService;
import com.example.QucikTurn.Service.ProjectService;
import com.example.QucikTurn.Service.UserService;
import com.example.QucikTurn.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final ProjectService projectService;
    private final ActivityService activityService;

    public AdminController(UserService userService,
            ProjectService projectService,
            ActivityService activityService) {
        this.userService = userService;
        this.projectService = projectService;
        this.activityService = activityService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok("All users", userService.getAllUsers()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }

    // --- NEW: PROJECT MONITORING ---

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.ok("All projects", projectService.getAllProjects()));
    }

    @GetMapping("/projects/{projectId}/logs")
    public ResponseEntity<ApiResponse<List<Activity>>> getProjectLogs(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok("Project logs", activityService.getActivitiesByProject(projectId)));
    }

    // --- USER BAN MANAGEMENT ---

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<User>> banUser(@PathVariable Long id) {
        User user = userService.banUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User banned successfully", user));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<ApiResponse<User>> unbanUser(@PathVariable Long id) {
        User user = userService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User unbanned successfully", user));
    }

    @PutMapping("/users/{id}/toggle-ban")
    public ResponseEntity<ApiResponse<User>> toggleBan(@PathVariable Long id) {
        User user = userService.toggleBanStatus(id);
        String message = user.isEnabled() ? "User unbanned successfully" : "User banned successfully";
        return ResponseEntity.ok(ApiResponse.ok(message, user));
    }
}
