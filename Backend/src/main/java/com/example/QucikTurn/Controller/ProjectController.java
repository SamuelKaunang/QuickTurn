package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ApplicationService;
import com.example.QucikTurn.Service.ProjectService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.ApplicantResponse;
import com.example.QucikTurn.dto.CreateProjectRequest;
import com.example.QucikTurn.dto.FinishProjectRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectSvc;
    private final ApplicationService applicationSvc;

    public ProjectController(ProjectService projectSvc, ApplicationService applicationSvc) {
        this.projectSvc = projectSvc;
        this.applicationSvc = applicationSvc;
    }

    // --- CREATE PROJECT ---
    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProjectRequest req
    ) {
        Project project = projectSvc.createProject(user.getId(), req);
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Project berhasil dibuat", project));
    }

    // --- GET MY PROJECTS (UMKM) ---
    // ✅ ADDED THIS ENDPOINT
    @GetMapping("/my-projects")
    public ResponseEntity<ApiResponse<List<Project>>> getMyProjects(@AuthenticationPrincipal User user) {
        List<Project> list = projectSvc.getProjectsByOwner(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Projects retrieved", list));
    }

    // --- LIHAT PELAMAR ---
    @GetMapping("/{projectId}/applicants")
    public ResponseEntity<ApiResponse<List<ApplicantResponse>>> getApplicants(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user
    ) {
        List<ApplicantResponse> list = applicationSvc.getApplicantsForProject(user.getId(), projectId);
        return ResponseEntity.ok(ApiResponse.ok("List pelamar berhasil diambil", list));
    }

    // --- TERIMA PELAMAR ---
    @PostMapping("/{projectId}/applicants/{appId}/accept")
    public ResponseEntity<ApiResponse<String>> acceptApplicant(
            @PathVariable Long projectId,
            @PathVariable Long appId,
            @AuthenticationPrincipal User user
    ) {
        applicationSvc.acceptApplicant(user.getId(), projectId, appId);
        return ResponseEntity.ok(ApiResponse.ok("Pelamar diterima, project dimulai!", null));
    }

    // --- MAHASISWA SUBMIT FINISHING ---
    @PostMapping("/{projectId}/finish")
    public ResponseEntity<ApiResponse<String>> submitFinishing(
            @PathVariable Long projectId,
            @Valid @RequestBody FinishProjectRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            projectSvc.submitFinishing(projectId, currentUser.getId(), request.getFinishingLink());
            return ResponseEntity.ok(ApiResponse.ok("Finishing submitted successfully. Waiting for UMKM review.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // --- UMKM CONFIRM FINISHING ---
    @PostMapping("/{projectId}/finish/confirm")
    public ResponseEntity<ApiResponse<String>> confirmFinishing(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {
        try {
            projectSvc.confirmFinishing(projectId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.ok("Project officially finished and closed.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // --- GET FINISHING STATUS ---
    @GetMapping("/{projectId}/finish-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinishingStatus(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {
        try {
            Map<String, Object> status = projectSvc.getFinishingStatus(projectId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.ok("Finishing status retrieved", status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}