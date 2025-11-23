package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ApplicationService; // ✅ Pastikan Import ini ada
import com.example.QucikTurn.Service.ProjectService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.ApplicantResponse;     // ✅ Pastikan Import ini ada
import com.example.QucikTurn.dto.CreateProjectRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectSvc;
    private final ApplicationService applicationSvc; // ✅ Variabel ini yang error tadi

    // --- PERBAIKAN DI SINI (CONSTRUCTOR) ---
    public ProjectController(ProjectService projectSvc, ApplicationService applicationSvc) {
        this.projectSvc = projectSvc;

        // ⚠️ INI YANG KEMUNGKINAN HILANG DI CODINGAN KAMU SEBELUMNYA:
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
}