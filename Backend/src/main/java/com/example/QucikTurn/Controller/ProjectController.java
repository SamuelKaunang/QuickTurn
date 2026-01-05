package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Service.ApplicationService;
import com.example.QucikTurn.Service.FinishingService;
import com.example.QucikTurn.Service.ProjectService;
import com.example.QucikTurn.Service.ProjectViewerService;
import com.example.QucikTurn.Service.ReviewService;
import com.example.QucikTurn.dto.ApiResponse;
import com.example.QucikTurn.dto.ApplicantResponse;
import com.example.QucikTurn.dto.CreateProjectRequest;
import com.example.QucikTurn.dto.FinishProjectRequest;
import com.example.QucikTurn.dto.ReviewRequest;
import com.example.QucikTurn.dto.ProjectWithStatusResponse;
import com.example.QucikTurn.dto.UmkmProjectResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectSvc;
    private final ProjectViewerService projectViewerSvc;
    private final FinishingService finishingSvc;
    private final ApplicationService applicationSvc;
    private final ReviewService reviewService;

    public ProjectController(ProjectService projectSvc, ProjectViewerService projectViewerSvc,
            FinishingService finishingSvc, ApplicationService applicationSvc,
            ReviewService reviewService) {
        this.projectSvc = projectSvc;
        this.projectViewerSvc = projectViewerSvc;
        this.finishingSvc = finishingSvc;
        this.applicationSvc = applicationSvc;
        this.reviewService = reviewService;
    }

    /**
     * Create a new project.
     * Requires email verification before first project creation.
     */
    @PostMapping
    public ResponseEntity<?> createProject(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProjectRequest req) {

        // Check email verification before allowing project creation
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "success", false,
                            "error", "EMAIL_NOT_VERIFIED",
                            "message", "Silakan verifikasi email Anda sebelum membuat project.",
                            "email", user.getEmail()));
        }

        Project project = projectSvc.createProject(user.getId(), req);
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Project berhasil dibuat", project));
    }

    // --- GET MY PROJECTS (UMKM) with applicant count ---
    @GetMapping("/my-projects")
    public ResponseEntity<ApiResponse<List<UmkmProjectResponse>>> getMyProjects(@AuthenticationPrincipal User user) {
        List<UmkmProjectResponse> list = projectViewerSvc.getProjectsByOwnerWithApplicantCount(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Projects retrieved", list));
    }

    // --- GET ALL OPEN PROJECTS (Status Aware) ---
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectWithStatusResponse>>> getAllProjects(
            @AuthenticationPrincipal User user) {
        Long studentId = (user != null && user.getRole().name().equals("MAHASISWA")) ? user.getId() : null;
        List<ProjectWithStatusResponse> list = projectViewerSvc.getOpenProjectsWithStatus(studentId);
        return ResponseEntity.ok(ApiResponse.ok("All open projects retrieved", list));
    }

    // --- GET PROJECTS I'M PARTICIPATING IN (For Students Dashboard) ---
    @GetMapping("/participating")
    public ResponseEntity<ApiResponse<List<ProjectWithStatusResponse>>> getParticipatingProjects(
            @AuthenticationPrincipal User user) {
        List<ProjectWithStatusResponse> list = projectViewerSvc.getProjectsByStudent(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Participating projects retrieved", list));
    }

    // --- LIHAT PELAMAR ---
    @GetMapping("/{projectId}/applicants")
    public ResponseEntity<ApiResponse<List<ApplicantResponse>>> getApplicants(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        List<ApplicantResponse> list = applicationSvc.getApplicantsForProject(user.getId(), projectId);
        return ResponseEntity.ok(ApiResponse.ok("List pelamar berhasil diambil", list));
    }

    // --- TERIMA PELAMAR ---
    @PostMapping("/{projectId}/applicants/{appId}/accept")
    public ResponseEntity<ApiResponse<String>> acceptApplicant(
            @PathVariable Long projectId,
            @PathVariable Long appId,
            @AuthenticationPrincipal User user) {
        applicationSvc.acceptApplicant(user.getId(), projectId, appId);
        return ResponseEntity.ok(ApiResponse.ok("Pelamar diterima, project dimulai!", null));
    }

    // --- TOLAK PELAMAR ---
    @PostMapping("/{projectId}/applicants/{appId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectApplicant(
            @PathVariable Long projectId,
            @PathVariable Long appId,
            @AuthenticationPrincipal User user) {
        applicationSvc.rejectApplicant(user.getId(), projectId, appId);
        return ResponseEntity.ok(ApiResponse.ok("Pelamar berhasil ditolak.", null));
    }

    // --- MAHASISWA SUBMIT FINISHING ---
    @PostMapping("/{projectId}/finish")
    public ResponseEntity<ApiResponse<String>> submitFinishing(
            @PathVariable Long projectId,
            @Valid @RequestBody FinishProjectRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            finishingSvc.submitFinishing(projectId, currentUser.getId(), request.getFinishingLink());
            return ResponseEntity
                    .ok(ApiResponse.ok("Finishing submitted successfully. Waiting for UMKM review.", null));
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
            finishingSvc.confirmFinishing(projectId, currentUser.getId());
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
            Map<String, Object> status = finishingSvc.getFinishingStatus(projectId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.ok("Finishing status retrieved", status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // --- GET DIGITAL CONTRACT (FR-09) ---
    @GetMapping("/{projectId}/contract")
    public ResponseEntity<ApiResponse<String>> getContract(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        try {
            String contractContent = applicationSvc.getContractByProject(projectId, user.getId());
            return ResponseEntity.ok(ApiResponse.ok("Contract retrieved", contractContent));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // --- SUBMIT REVIEW (FR-10) ---
    @PostMapping("/{projectId}/review")
    public ResponseEntity<ApiResponse<String>> submitReview(
            @PathVariable Long projectId,
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal User user) {
        try {
            reviewService.addReview(projectId, request, user.getEmail());
            return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // --- GET MY REVIEW FOR A PROJECT ---
    @GetMapping("/{projectId}/my-review")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyReview(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        try {
            var review = reviewService.getMyReviewForProject(projectId, user.getEmail());
            if (review == null) {
                return ResponseEntity.ok(ApiResponse.ok("No review found", Map.of(
                        "hasReviewed", false)));
            }
            return ResponseEntity.ok(ApiResponse.ok("Review found", Map.of(
                    "hasReviewed", true,
                    "rating", review.getRating(),
                    "comment", review.getComment() != null ? review.getComment() : "")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // --- GET PROJECT BRIEF & ATTACHMENT (ONLY FOR ACCEPTED TALENTS) ---
    @GetMapping("/{projectId}/brief")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProjectBrief(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        try {
            Map<String, Object> briefData = projectViewerSvc.getProjectBriefForAcceptedTalent(projectId, user.getId());
            return ResponseEntity.ok(ApiResponse.ok("Brief retrieved", briefData));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}