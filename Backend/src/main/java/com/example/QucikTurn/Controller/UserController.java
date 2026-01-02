package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Service.AccountDeletionService;
import com.example.QucikTurn.Service.UserService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.DeleteAccountRequest;
import com.example.QucikTurn.dto.PublicProfileResponse;
import com.example.QucikTurn.dto.UpdateProfileRequest;
import com.example.QucikTurn.dto.UserProfileResponse;
import com.example.QucikTurn.dto.UserSearchResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userSvc;
    private final AccountDeletionService accountDeletionService;

    public UserController(UserService userSvc, AccountDeletionService accountDeletionService) {
        this.userSvc = userSvc;
        this.accountDeletionService = accountDeletionService;
    }

    // --- GET MY PROFILE ---
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(@AuthenticationPrincipal User user) {
        // Fetch fresh data from DB to ensure we have latest bio/skills
        User freshUser = userSvc.getUserById(user.getId());
        // Return DTO without sensitive data
        return ResponseEntity.ok(ApiResponse.ok("Profile data", UserProfileResponse.fromUser(freshUser)));
    }

    // --- UPDATE PROFILE (FR-03) ---
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest req) {
        User updated = userSvc.updateProfile(user.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", UserProfileResponse.fromUser(updated)));
    }

    // --- SEARCH USERS ---
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> searchUsers(
            @AuthenticationPrincipal User currentUser,
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

        // Filter out the current user from search results
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        if (currentUserId != null) {
            results = results.stream()
                    .filter(u -> !u.id().equals(currentUserId))
                    .collect(java.util.stream.Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.ok("Search results", results));
    }

    // --- GET PUBLIC PROFILE BY ID ---
    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<PublicProfileResponse>> getPublicProfileById(
            @PathVariable Long userId) {
        // Check if user is deleted
        User targetUser = userSvc.getUserById(userId);
        if (targetUser.isDeleted()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Akun ini sudah tidak aktif lagi."));
        }
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
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUsername(
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
            return ResponseEntity
                    .ok(ApiResponse.ok("Username updated successfully", UserProfileResponse.fromUser(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // --- UPDATE BIDANG/CATEGORY ---
    @PutMapping("/bidang")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateBidang(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String bidang = request.get("bidang");
        User updated = userSvc.updateBidang(user.getId(), bidang);
        return ResponseEntity.ok(ApiResponse.ok("Bidang updated successfully", UserProfileResponse.fromUser(updated)));
    }

    /**
     * DELETE ACCOUNT - Permanently delete user account
     * 
     * User must provide the exact confirmation phrase:
     * "Saya mengerti bahwa akun saya akan dihapus permanen dan tidak bisa
     * dikembalikan."
     * 
     * This operation:
     * 1. Deletes all user files from cloud storage
     * 2. Anonymizes chat history (messages preserved, identity hidden)
     * 3. Archives completed projects (keeps system records)
     * 4. Removes personal data and marks account as DELETED
     */
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DeleteAccountRequest request) {
        try {
            accountDeletionService.deleteAccount(user, request);
            return ResponseEntity.ok(
                    ApiResponse.ok("Akun Anda telah berhasil dihapus. Terima kasih telah menggunakan QuickTurn.",
                            null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * GET REQUIRED CONFIRMATION PHRASE
     * Returns the exact phrase user must type to delete their account.
     */
    @GetMapping("/account/delete-confirmation")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDeleteConfirmationPhrase() {
        return ResponseEntity.ok(ApiResponse.ok("Confirmation phrase",
                Map.of("phrase", DeleteAccountRequest.REQUIRED_PHRASE)));
    }
}
