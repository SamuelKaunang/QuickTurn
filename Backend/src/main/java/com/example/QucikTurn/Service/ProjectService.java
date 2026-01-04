package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.CreateProjectRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Core service for Project entity lifecycle management.
 * Handles Create, Read (basic), Update, Delete operations.
 * 
 * For viewing projects with status/applicant info, see ProjectViewerService.
 * For finishing workflow, see FinishingService.
 */
@Service
@SuppressWarnings("null")
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final ActivityService activityService;

    public ProjectService(ProjectRepository projectRepo, UserRepository userRepo,
            ActivityService activityService) {
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.activityService = activityService;
    }

    // --- UMKM: Post Project ---
    @Transactional
    public Project createProject(Long ownerId, CreateProjectRequest req) {
        Objects.requireNonNull(ownerId, "Owner ID cannot be null");
        User owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (owner.getRole() != Role.UMKM) {
            throw new RuntimeException("Hanya akun UMKM yang boleh memposting project");
        }

        Project p = new Project();
        p.setOwner(owner);
        p.setTitle(req.title());
        p.setDescription(req.description());
        p.setCategory(req.category());
        p.setBudget(req.budget());
        p.setDeadline(req.deadline());
        p.setStatus(ProjectStatus.OPEN);

        // NEW: Set additional fields
        p.setRequiredSkills(req.requiredSkills());
        p.setEstimatedDuration(req.estimatedDuration());
        if (req.complexity() != null) {
            p.setComplexity(req.complexity());
        }
        p.setApplicantCount(0);
        p.setBriefText(req.briefText());

        Project savedProject = projectRepo.save(p);

        // Log activity
        activityService.logActivity(owner, ActivityService.TYPE_PROJECT_POSTED,
                "Posted new project: " + savedProject.getTitle(), "PROJECT", savedProject.getId());

        return savedProject;
    }

    // --- GET PROJECTS BY OWNER (UMKM) - Legacy ---
    public List<Project> getProjectsByOwner(Long ownerId) {
        return projectRepo.findByOwnerId(ownerId);
    }

    // --- GET ALL OPEN PROJECTS (For Browsing - Legacy) ---
    public List<Project> getAllOpenProjects() {
        return projectRepo.findByStatus(ProjectStatus.OPEN);
    }

    // --- GET ALL PROJECTS (For Admin) ---
    public List<Project> getAllProjects() {
        return projectRepo.findAll();
    }

    // --- GET PROJECT BY ID ---
    public Project getProjectById(Long projectId) {
        return projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    // --- DELETE PROJECT ---
    @Transactional
    public void deleteProject(Long projectId, Long ownerId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own projects");
        }

        projectRepo.delete(project);
    }
}