package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.UploadedFile;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.WorkSubmission;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.WorkSubmissionRepository;
import com.example.QucikTurn.Service.ActivityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkSubmissionService {

    private final WorkSubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final FileStorageService fileStorageService;
    private final ActivityService activityService;

    public WorkSubmissionService(WorkSubmissionRepository submissionRepository,
            ProjectRepository projectRepository,
            FileStorageService fileStorageService,
            ActivityService activityService) {
        this.submissionRepository = submissionRepository;
        this.projectRepository = projectRepository;
        this.fileStorageService = fileStorageService;
        this.activityService = activityService;
    }

    /**
     * Create a new work submission with files and links
     */
    @Transactional
    public WorkSubmission createSubmission(Long projectId, User submitter,
            String description, String links,
            List<MultipartFile> files) throws IOException {
        // Get project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

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
     */
    public List<WorkSubmission> getProjectSubmissions(Long projectId) {
        return submissionRepository.findByProjectIdOrderBySubmittedAtDesc(projectId);
    }

    /**
     * Get submission by ID
     */
    public WorkSubmission getSubmissionById(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
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
