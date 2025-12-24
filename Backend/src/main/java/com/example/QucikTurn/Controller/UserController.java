package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.UserService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.UpdateProfileRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userSvc;

    public UserController(UserService userSvc) {
        this.userSvc = userSvc;
    }

    // --- GET MY PROFILE ---
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getMyProfile(@AuthenticationPrincipal User user) {
        // Fetch fresh data from DB to ensure we have latest bio/skills
        User freshUser = userSvc.getUserById(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Profile data", freshUser));
    }

    // --- UPDATE PROFILE (FR-03) ---
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest req
    ) {
        User updated = userSvc.updateProfile(user.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}