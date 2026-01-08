package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Application;
import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.WorkSubmission;
import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.WorkSubmissionRepository;
import com.example.QucikTurn.dto.ProjectWithStatusResponse;
import com.example.QucikTurn.dto.UmkmProjectResponse;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service responsible for reading/viewing project data.
 * Follows CQRS pattern - separates reads from writes.
 */
@Service
@SuppressWarnings("null")
public class ProjectViewerService {

    private final ProjectRepository projectRepo;
    private final ApplicationRepository applicationRepo;
    private final WorkSubmissionRepository workSubmissionRepo;

    public ProjectViewerService(ProjectRepository projectRepo,
            ApplicationRepository applicationRepo,
            WorkSubmissionRepository workSubmissionRepo) {
        this.projectRepo = projectRepo;
        this.applicationRepo = applicationRepo;
        this.workSubmissionRepo = workSubmissionRepo;
    }

    /**
     * Get projects by owner (UMKM) with applicant count.
     */
    public List<UmkmProjectResponse> getProjectsByOwnerWithApplicantCount(Long ownerId) {
        List<Project> projects = projectRepo.findByOwnerId(ownerId);

        return projects.stream().map(p -> {
            int applicantCount = applicationRepo.countByProjectId(p.getId());
            return new UmkmProjectResponse(
                    p.getId(),
                    p.getTitle(),
                    p.getDescription(),
                    p.getCategory(),
                    p.getBudget(),
                    p.getDeadline(),
                    p.getStatus().name(),
                    p.getOwner(),
                    p.getFinishingSubmittedAt(),
                    p.getFinishedAt(),
                    applicantCount);
        }).collect(Collectors.toList());
    }

    /**
     * Get open projects with application status for a student.
     */
    public List<ProjectWithStatusResponse> getOpenProjectsWithStatus(Long studentId) {
        List<Project> projects = projectRepo.findByStatus(ProjectStatus.OPEN);

        return projects.stream().map(p -> {
            String myStatus = null;
            if (studentId != null) {
                var app = applicationRepo.findByProjectIdAndStudentId(p.getId(), studentId);
                if (app.isPresent()) {
                    myStatus = app.get().getStatus().name();
                }
            }
            return mapToDTO(p, myStatus);
        }).collect(Collectors.toList());
    }

    /**
     * Get projects by student (applied/accepted).
     */
    public List<ProjectWithStatusResponse> getProjectsByStudent(Long studentId) {
        List<Project> projects = projectRepo.findProjectsByStudentId(studentId);

        return projects.stream().map(p -> {
            String myStatus = applicationRepo.findByProjectIdAndStudentId(p.getId(), studentId)
                    .map(app -> app.getStatus().name())
                    .orElse(null);

            return mapToDTO(p, myStatus);
        }).collect(Collectors.toList());
    }

    /**
     * Get project brief for accepted talent only.
     */
    public Map<String, Object> getProjectBriefForAcceptedTalent(Long projectId, Long userId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Application application = applicationRepo.findByProjectIdAndStudentId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("You have not applied to this project"));

        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new RuntimeException(
                    "You are not authorized to view this content. Only accepted talents can access the brief and attachments.");
        }

        Map<String, Object> briefData = new HashMap<>();
        briefData.put("projectId", projectId);
        briefData.put("projectTitle", project.getTitle());
        briefData.put("briefText", project.getBriefText());
        briefData.put("attachmentUrl", project.getAttachmentUrl());
        briefData.put("attachmentName", project.getAttachmentName());
        briefData.put("ownerName", project.getOwner().getNama());
        briefData.put("ownerEmail", project.getOwner().getEmail());

        return briefData;
    }

    /**
     * Helper: Map Project entity to DTO.
     */
    private ProjectWithStatusResponse mapToDTO(Project p, String myStatus) {
        List<WorkSubmission> submissions = workSubmissionRepo.findByProjectIdOrderBySubmittedAtDesc(p.getId());
        String latestSubmissionStatus = null;
        String latestSubmissionFeedback = null;
        if (!submissions.isEmpty()) {
            WorkSubmission latest = submissions.get(0);
            latestSubmissionStatus = latest.getStatus();
            latestSubmissionFeedback = latest.getFeedback();
        }

        return new ProjectWithStatusResponse(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getCategory(),
                p.getBudget(),
                p.getDeadline(),
                p.getStatus().name(),
                p.getOwner(),
                myStatus,
                p.getFinishingSubmittedAt(),
                p.getFinishedAt(),
                latestSubmissionStatus,
                latestSubmissionFeedback,
                p.getRequiredSkills(),
                p.getEstimatedDuration(),
                p.getComplexity(),
                p.getApplicantCount());
    }

    /**
     * Convert a list of Projects to ProjectWithStatusResponse DTOs.
     * Used by RecommendationService to return consistent response format.
     */
    public List<ProjectWithStatusResponse> convertToStatusResponse(List<Project> projects, Long studentId) {
        return projects.stream().map(p -> {
            String myStatus = null;
            if (studentId != null) {
                var app = applicationRepo.findByProjectIdAndStudentId(p.getId(), studentId);
                if (app.isPresent()) {
                    myStatus = app.get().getStatus().name();
                }
            }
            return mapToDTO(p, myStatus);
        }).collect(Collectors.toList());
    }
}
