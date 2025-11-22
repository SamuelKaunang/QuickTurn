package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ProjectService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.CreateProjectRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService svc;

    public ProjectController(ProjectService svc) {
        this.svc = svc;
    }

    // Endpoint: POST /api/projects
    // Header: Authorization: Bearer <token_umkm>
    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(
            @AuthenticationPrincipal User user, // User diambil otomatis dari Token JWT
            @Valid @RequestBody CreateProjectRequest req
    ) {
        Project project = svc.createProject(user.getId(), req);
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Project berhasil dibuat", project));
    }
}