package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ApplicationService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.ApplyProjectRequest;
import com.example.QucikTurn.dto.ApplyProjectResponse;
import jakarta.validation.Valid;
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

        // Endpoint: POST /api/projects/{projectId}/apply
        // Header: Authorization: Bearer <token_mahasiswa>
        @PostMapping("/{projectId}/apply")
        public ResponseEntity<?> applyToProject(
                @PathVariable Long projectId,
                @AuthenticationPrincipal User user, // Mahasiswa yang login
                @Valid @RequestBody ApplyProjectRequest req
    ) {
        try {
            ApplyProjectResponse response = applicationService.applyToProject(
                    projectId,
                    user.getId(),
                    req
            );

            return ResponseEntity.status(201)
                    .body(ApiResponse.ok("Application submitted successfully", response));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}