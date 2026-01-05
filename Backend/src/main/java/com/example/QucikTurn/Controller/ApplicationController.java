package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ApplicationService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.ApplyProjectRequest;
import com.example.QucikTurn.dto.ApplyProjectResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Apply to a project.
     * Requires email verification before first application.
     * 
     * Endpoint: POST /api/projects/{projectId}/apply
     * Header: Authorization: Bearer <token_mahasiswa>
     */
    @PostMapping("/{projectId}/apply")
    public ResponseEntity<?> applyToProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ApplyProjectRequest req) {
        // Check email verification before allowing application
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "success", false,
                            "error", "EMAIL_NOT_VERIFIED",
                            "message", "Silakan verifikasi email Anda sebelum melamar project.",
                            "email", user.getEmail()));
        }

        try {
            ApplyProjectResponse response = applicationService.applyToProject(
                    projectId,
                    user.getId(),
                    req);

            return ResponseEntity.status(201)
                    .body(ApiResponse.ok("Application submitted successfully", response));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
