package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.Application;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.ApplicationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Scheduled service to check for overdue projects
 * Runs daily to update project status and notify users
 */
@Service
public class ProjectDeadlineSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectDeadlineSchedulerService.class);

    private final ProjectRepository projectRepo;
    private final ApplicationRepository applicationRepo;
    private final ActivityService activityService;

    public ProjectDeadlineSchedulerService(
            ProjectRepository projectRepo,
            ApplicationRepository applicationRepo,
            ActivityService activityService) {
        this.projectRepo = projectRepo;
        this.applicationRepo = applicationRepo;
        this.activityService = activityService;
    }

    /**
     * Run every day at 00:05 AM to check for overdue projects
     */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void checkOverdueProjects() {
        logger.info("Running scheduled task: Checking for overdue projects...");

        LocalDate today = LocalDate.now();

        // Get all ONGOING projects where deadline has passed
        List<Project> ongoingProjects = projectRepo.findByStatus(ProjectStatus.ONGOING);

        int overdueCount = 0;
        for (Project project : ongoingProjects) {
            if (project.getDeadline() != null && project.getDeadline().isBefore(today)) {
                markProjectAsOverdue(project);
                overdueCount++;
            }
        }

        // Also check OPEN projects that have passed deadline (no one applied/accepted)
        List<Project> openProjects = projectRepo.findByStatus(ProjectStatus.OPEN);
        for (Project project : openProjects) {
            if (project.getDeadline() != null && project.getDeadline().isBefore(today)) {
                markProjectAsOverdue(project);
                overdueCount++;
            }
        }

        logger.info("Overdue check completed. {} projects marked as overdue.", overdueCount);
    }

    /**
     * Mark a project as overdue and create activity notifications
     */
    private void markProjectAsOverdue(Project project) {
        // Update project status
        project.setStatus(ProjectStatus.OVERDUE);
        projectRepo.save(project);

        // Log activity for project owner (Client/UMKM)
        activityService.logActivity(
                project.getOwner(),
                "PROJECT_OVERDUE",
                "Project \"" + project.getTitle() + "\" has passed its deadline!",
                "PROJECT",
                project.getId());

        // Find accepted talent and notify them too
        Optional<Application> acceptedApp = applicationRepo
                .findByProjectIdAndStatus(project.getId(), ApplicationStatus.APPROVED)
                .stream()
                .findFirst();

        if (acceptedApp.isPresent()) {
            activityService.logActivity(
                    acceptedApp.get().getStudent(),
                    "PROJECT_OVERDUE",
                    "Project \"" + project.getTitle() + "\" has passed its deadline!",
                    "PROJECT",
                    project.getId());
        }

        logger.warn("Project {} (ID: {}) marked as OVERDUE", project.getTitle(), project.getId());
    }

    /**
     * Manual check method - can be called via API for testing
     */
    @Transactional
    public int checkAndMarkOverdueProjects() {
        LocalDate today = LocalDate.now();
        int overdueCount = 0;

        // Check ONGOING projects
        List<Project> ongoingProjects = projectRepo.findByStatus(ProjectStatus.ONGOING);
        for (Project project : ongoingProjects) {
            if (project.getDeadline() != null && project.getDeadline().isBefore(today)) {
                markProjectAsOverdue(project);
                overdueCount++;
            }
        }

        // Check OPEN projects
        List<Project> openProjects = projectRepo.findByStatus(ProjectStatus.OPEN);
        for (Project project : openProjects) {
            if (project.getDeadline() != null && project.getDeadline().isBefore(today)) {
                markProjectAsOverdue(project);
                overdueCount++;
            }
        }

        return overdueCount;
    }

    /**
     * Check if a specific project is overdue based on deadline
     */
    public boolean isProjectOverdue(Long projectId) {
        if (projectId == null)
            return false;
        return projectRepo.findById(projectId)
                .map(project -> {
                    if (project.getDeadline() == null)
                        return false;
                    if (project.getStatus() == ProjectStatus.DONE ||
                            project.getStatus() == ProjectStatus.CLOSED)
                        return false;
                    return project.getDeadline().isBefore(LocalDate.now());
                })
                .orElse(false);
    }

    /**
     * Calculate days until deadline (negative if overdue)
     */
    public int getDaysUntilDeadline(Long projectId) {
        if (projectId == null)
            return 0;
        return projectRepo.findById(projectId)
                .map(project -> {
                    if (project.getDeadline() == null)
                        return 0;
                    return (int) java.time.temporal.ChronoUnit.DAYS.between(
                            LocalDate.now(), project.getDeadline());
                })
                .orElse(0);
    }
}
