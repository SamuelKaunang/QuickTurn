package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Application;
import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service responsible for the Project Finishing workflow.
 * Handles submission of work by students and confirmation by UMKM.
 */
@Service
@SuppressWarnings("null")
public class FinishingService {

    private final ProjectRepository projectRepo;
    private final ApplicationRepository applicationRepo;

    public FinishingService(ProjectRepository projectRepo, ApplicationRepository applicationRepo) {
        this.projectRepo = projectRepo;
        this.applicationRepo = applicationRepo;
    }

    /**
     * Student submits their completed work for a project.
     */
    @Transactional
    public void submitFinishing(Long projectId, Long studentId, String finishingLink) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Application application = applicationRepo.findByProjectIdAndStudentId(projectId, studentId)
                .orElseThrow(() -> new RuntimeException("You are not the accepted applicant for this project"));

        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new RuntimeException("Only approved applicants can submit finishing");
        }

        if (project.getStatus() != ProjectStatus.ONGOING) {
            throw new RuntimeException("Project is not in ONGOING status");
        }

        application.setFinishingLink(finishingLink);
        application.setFinishingSubmittedAt(LocalDateTime.now());
        application.setIsFinishedByStudent(true);
        applicationRepo.save(application);

        project.setFinishingLink(finishingLink);
        project.setFinishingSubmittedAt(LocalDateTime.now());
        project.setStatus(ProjectStatus.DONE);

        projectRepo.save(project);
    }

    /**
     * UMKM confirms that the project is finished and closes it.
     */
    @Transactional
    public void confirmFinishing(Long projectId, Long umkmId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(umkmId))
            throw new RuntimeException("Unauthorized");

        if (project.getStatus() != ProjectStatus.DONE) {
            throw new RuntimeException("Student has not submitted the work yet");
        }

        project.setStatus(ProjectStatus.CLOSED);
        project.setFinishedAt(LocalDateTime.now());
        project.setFinishedByUmkmId(umkmId);
        projectRepo.save(project);
    }

    /**
     * Get the finishing status for a project.
     */
    public Map<String, Object> getFinishingStatus(Long projectId, Long userId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Map<String, Object> status = new HashMap<>();
        status.put("projectId", projectId);
        status.put("projectStatus", project.getStatus().name());
        status.put("finishingLink", project.getFinishingLink());
        status.put("finishingSubmittedAt", project.getFinishingSubmittedAt());
        status.put("finishedAt", project.getFinishedAt());

        applicationRepo.findByProjectIdAndStudentId(projectId, userId).ifPresent(app -> {
            status.put("applicationStatus", app.getStatus().name());
            status.put("isFinishedByStudent", app.getIsFinishedByStudent());
        });

        return status;
    }
}
