package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Service.UserService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.PublicProfileResponse;
import com.example.QucikTurn.dto.UpdateProfileRequest;
import com.example.QucikTurn.dto.UserSearchResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
            @RequestBody UpdateProfileRequest req) {
        User updated = userSvc.updateProfile(user.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    // --- SEARCH USERS ---
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> searchUsers(
            @RequestParam String query,
            @RequestParam(required = false) String role) {
        List<UserSearchResponse> results;

        if (role != null && !role.isEmpty()) {
            try {
                Role roleEnum = Role.valueOf(role.toUpperCase());
                results = userSvc.searchUsersByRole(query, roleEnum);
            } catch (IllegalArgumentException e) {
                results = userSvc.searchUsers(query);
            }
        } else {
            results = userSvc.searchUsers(query);
        }

        return ResponseEntity.ok(ApiResponse.ok("Search results", results));
    }

    // --- GET PUBLIC PROFILE BY ID ---
    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<PublicProfileResponse>> getPublicProfileById(
            @PathVariable Long userId) {
        PublicProfileResponse profile = userSvc.getPublicProfileById(userId);
        return ResponseEntity.ok(ApiResponse.ok("Public profile", profile));
    }

    // --- GET PUBLIC PROFILE BY USERNAME ---
    @GetMapping("/profile/username/{username}")
    public ResponseEntity<ApiResponse<PublicProfileResponse>> getPublicProfileByUsername(
            @PathVariable String username) {
        PublicProfileResponse profile = userSvc.getPublicProfileByUsername(username);
        return ResponseEntity.ok(ApiResponse.ok("Public profile", profile));
    }

    // --- UPDATE USERNAME ---
    @PutMapping("/username")
    public ResponseEntity<ApiResponse<User>> updateUsername(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String newUsername = request.get("username");
        if (newUsername == null || newUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username cannot be empty"));
        }

        // Validate username format (alphanumeric, underscores, 3-30 chars)
        if (!newUsername.matches("^[a-zA-Z0-9_]{3,30}$")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username must be 3-30 characters, alphanumeric and underscores only"));
        }

        try {
            User updated = userSvc.updateUsername(user.getId(), newUsername.toLowerCase());
            return ResponseEntity.ok(ApiResponse.ok("Username updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // --- UPDATE BIDANG/CATEGORY ---
    @PutMapping("/bidang")
    public ResponseEntity<ApiResponse<User>> updateBidang(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String bidang = request.get("bidang");
        User updated = userSvc.updateBidang(user.getId(), bidang);
        return ResponseEntity.ok(ApiResponse.ok("Bidang updated successfully", updated));
    }
}