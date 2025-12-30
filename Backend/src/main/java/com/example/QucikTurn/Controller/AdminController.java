package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.UserService;
import com.example.QucikTurn.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final com.example.QucikTurn.Service.ProjectService projectService;
    private final com.example.QucikTurn.Service.ActivityService activityService;

    public AdminController(UserService userService, 
                           com.example.QucikTurn.Service.ProjectService projectService,
                           com.example.QucikTurn.Service.ActivityService activityService) {
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
    public ResponseEntity<ApiResponse<List<com.example.QucikTurn.Entity.Project>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.ok("All projects", projectService.getAllProjects()));
    }

    @GetMapping("/projects/{projectId}/logs")
    public ResponseEntity<ApiResponse<List<com.example.QucikTurn.Entity.Activity>>> getProjectLogs(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok("Project logs", activityService.getActivitiesByProject(projectId)));
    }
}
