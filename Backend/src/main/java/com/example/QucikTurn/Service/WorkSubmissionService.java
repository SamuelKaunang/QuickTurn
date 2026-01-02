package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.UploadedFile;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.WorkSubmission;
import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.WorkSubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@SuppressWarnings("null") // Suppress Eclipse null analysis false positives for JPA repository methods
public class WorkSubmissionService {

    private final WorkSubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final ApplicationRepository applicationRepository;
    private final FileStorageService fileStorageService;
    private final ActivityService activityService;

    public WorkSubmissionService(WorkSubmissionRepository submissionRepository,
            ProjectRepository projectRepository,
            ApplicationRepository applicationRepository,
            FileStorageService fileStorageService,
            ActivityService activityService) {
        this.submissionRepository = submissionRepository;
        this.projectRepository = projectRepository;
        this.applicationRepository = applicationRepository;
        this.fileStorageService = fileStorageService;
        this.activityService = activityService;
    }

    /**
     * Create a new work submission with files and links
     * SECURITY FIX P3: Only approved applicants can submit work
     */
    @Transactional
    public WorkSubmission createSubmission(Long projectId, User submitter,
            String description, String links,
            List<MultipartFile> files) throws IOException {
        // Get project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // SECURITY FIX P3: Verify submitter is the approved applicant for this project
        boolean isApprovedApplicant = applicationRepository.existsByProjectIdAndStudentIdAndStatus(
                projectId, Objects.requireNonNull(submitter.getId(), "Submitter ID cannot be null"),
                ApplicationStatus.APPROVED);
        if (!isApprovedApplicant) {
            throw new RuntimeException("Only approved applicants can submit work for this project");
        }

        // Create submission
        WorkSubmission submission = new WorkSubmission(project, submitter, description, links);

        // Upload and attach files
        if (files != null && !files.isEmpty()) {
            List<UploadedFile> uploadedFiles = fileStorageService.uploadSubmissionFiles(files, submitter, projectId);
            for (UploadedFile file : uploadedFiles) {
                submission.addFile(file);
            }
        }

        // Save submission first
        WorkSubmission savedSubmission = submissionRepository.save(submission);

        // Update project status to DONE and set finishingSubmittedAt
        project.setStatus(com.example.QucikTurn.Entity.enums.ProjectStatus.DONE);
        project.setFinishingSubmittedAt(LocalDateTime.now());

        // Store submission link (combine links if present)
        String submissionInfo = "";
        if (links != null && !links.isEmpty()) {
            submissionInfo = links;
        }
        if (!submissionInfo.isEmpty() || (files != null && !files.isEmpty())) {
            project.setFinishingLink(submissionInfo.isEmpty() ? "Files submitted" : submissionInfo);
        }

        projectRepository.save(project);

        // Log activity for student
        activityService.logActivity(submitter, ActivityService.TYPE_SUBMITTED,
                "Submitted work for: " + project.getTitle(), "SUBMISSION", savedSubmission.getId());

        return savedSubmission;
    }

    /**
     * Get all submissions for a project
     * SECURITY FIX P1: Only project owner or approved applicant can view
     * submissions
     */
    public List<WorkSubmission> getProjectSubmissions(Long projectId, User requester) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // SECURITY FIX P1: Verify requester is owner OR approved applicant
        boolean isOwner = project.getOwner().getId().equals(requester.getId());
        boolean isApprovedApplicant = applicationRepository.existsByProjectIdAndStudentIdAndStatus(
                projectId, Objects.requireNonNull(requester.getId(), "Requester ID cannot be null"),
                ApplicationStatus.APPROVED);

        if (!isOwner && !isApprovedApplicant) {
            throw new RuntimeException("Access denied: You are not authorized to view these submissions");
        }

        return submissionRepository.findByProjectIdOrderBySubmittedAtDesc(projectId);
    }

    /**
     * Get submission by ID
     * SECURITY FIX P2: Only submitter or project owner can view specific submission
     */
    public WorkSubmission getSubmissionById(Long submissionId, User requester) {
        WorkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // SECURITY FIX P2: Verify requester is submitter OR project owner
        boolean isSubmitter = submission.getSubmittedBy().getId().equals(requester.getId());
        boolean isProjectOwner = submission.getProject().getOwner().getId().equals(requester.getId());

        if (!isSubmitter && !isProjectOwner) {
            throw new RuntimeException("Access denied: You are not authorized to view this submission");
        }

        return submission;
    }

    /**
     * Review a submission (approve/reject)
     */
    @Transactional
    public WorkSubmission reviewSubmission(Long submissionId, User reviewer,
            String status, String feedback) {
        WorkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Verify reviewer is the project owner
        Project project = submission.getProject();
        if (!project.getOwner().getId().equals(reviewer.getId())) {
            throw new RuntimeException("Only project owner can review submissions");
        }

        submission.setStatus(status);
        submission.setFeedback(feedback);
        submission.setReviewedAt(LocalDateTime.now());

        // If rejected, reset project status to allow resubmission
        if ("REJECTED".equals(status)) {
            project.setFinishingSubmittedAt(null);
            project.setFinishingLink(null);
            project.setStatus(com.example.QucikTurn.Entity.enums.ProjectStatus.ONGOING);
            projectRepository.save(project);

            // Log for student
            activityService.logActivity(submission.getSubmittedBy(), ActivityService.TYPE_WORK_REJECTED,
                    "Submission rejected for: " + project.getTitle(), "SUBMISSION", submission.getId());
        } else if ("APPROVED".equals(status)) {
            // Log for student
            activityService.logActivity(submission.getSubmittedBy(), ActivityService.TYPE_WORK_ACCEPTED,
                    "Submission accepted for: " + project.getTitle(), "SUBMISSION", submission.getId());
            // Log project completed?
            activityService.logActivity(submission.getSubmittedBy(), ActivityService.TYPE_PROJECT_COMPLETED,
                    "Project completed: " + project.getTitle(), "PROJECT", project.getId());
            // And for client
            activityService.logActivity(reviewer, ActivityService.TYPE_PROJECT_COMPLETED,
                    "Project completed: " + project.getTitle(), "PROJECT", project.getId());
        }

        return submissionRepository.save(submission);
    }

    /**
     * Get user's submissions
     */
    public List<WorkSubmission> getUserSubmissions(Long userId) {
        return submissionRepository.findBySubmittedById(userId);
    }
}
