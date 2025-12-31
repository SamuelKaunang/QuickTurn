package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.UploadedFile;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.WorkSubmission;
import com.example.QucikTurn.Service.FileStorageService;
import com.example.QucikTurn.Service.WorkSubmissionService;
import com.example.QucikTurn.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final WorkSubmissionService workSubmissionService;

    public FileUploadController(FileStorageService fileStorageService,
            WorkSubmissionService workSubmissionService) {
        this.fileStorageService = fileStorageService;
        this.workSubmissionService = workSubmissionService;
    }

    // --- PROFILE PICTURE UPLOAD ---
    @PostMapping("/profile-picture")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        try {
            UploadedFile uploaded = fileStorageService.uploadProfilePicture(file, user);
            return ResponseEntity.ok(ApiResponse.ok("Profile picture uploaded successfully",
                    Map.of("url", uploaded.getFilePath())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload file"));
        }
    }

    // --- WORK SUBMISSION ---
    @PostMapping("/submission/{projectId}")
    public ResponseEntity<ApiResponse<WorkSubmission>> createSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "links", required = false) String links,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        try {
            WorkSubmission submission = workSubmissionService.createSubmission(
                    projectId, user, description, links, files);
            return ResponseEntity.ok(ApiResponse.ok("Work submitted successfully", submission));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload files"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // --- GET PROJECT SUBMISSIONS (for UMKM) ---
    @GetMapping("/submissions/{projectId}")
    public ResponseEntity<ApiResponse<List<WorkSubmission>>> getProjectSubmissions(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        List<WorkSubmission> submissions = workSubmissionService.getProjectSubmissions(projectId);
        return ResponseEntity.ok(ApiResponse.ok("Submissions retrieved", submissions));
    }

    // --- GET SINGLE SUBMISSION ---
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<ApiResponse<WorkSubmission>> getSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long submissionId) {
        try {
            WorkSubmission submission = workSubmissionService.getSubmissionById(submissionId);
            return ResponseEntity.ok(ApiResponse.ok("Submission retrieved", submission));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // --- REVIEW SUBMISSION (UMKM approves/rejects) ---
    @PostMapping("/submission/{submissionId}/review")
    public ResponseEntity<ApiResponse<WorkSubmission>> reviewSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long submissionId,
            @RequestBody Map<String, String> reviewData) {
        try {
            String status = reviewData.get("status"); // APPROVED or REJECTED
            String feedback = reviewData.get("feedback");

            WorkSubmission submission = workSubmissionService.reviewSubmission(
                    submissionId, user, status, feedback);
            return ResponseEntity.ok(ApiResponse.ok("Submission reviewed", submission));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // --- GET USER'S SUBMISSIONS ---
    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<List<WorkSubmission>>> getMySubmissions(
            @AuthenticationPrincipal User user) {
        List<WorkSubmission> submissions = workSubmissionService.getUserSubmissions(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Your submissions", submissions));
    }

    // --- DELETE FILE ---
    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse<String>> deleteFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long fileId) {
        try {
            fileStorageService.deleteFile(fileId, user);
            return ResponseEntity.ok(ApiResponse.ok("File deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to delete file"));
        }
    }

    // --- PROJECT ATTACHMENT UPLOAD (for UMKM) ---
    @PostMapping("/project-attachment/{projectId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProjectAttachment(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file) {
        try {
            Map<String, String> result = fileStorageService.uploadProjectAttachment(file, user, projectId);
            return ResponseEntity.ok(ApiResponse.ok("Project attachment uploaded successfully", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload file"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
