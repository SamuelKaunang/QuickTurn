package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.Application;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.WorkSubmissionRepository;
import com.example.QucikTurn.Entity.WorkSubmission;
import com.example.QucikTurn.dto.CreateProjectRequest;
import com.example.QucikTurn.dto.ProjectWithStatusResponse;
import com.example.QucikTurn.dto.UmkmProjectResponse;
import com.example.QucikTurn.Service.ActivityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final ApplicationRepository applicationRepo;
    private final WorkSubmissionRepository workSubmissionRepo;
    private final ActivityService activityService;

    public ProjectService(ProjectRepository projectRepo, UserRepository userRepo,
            ApplicationRepository applicationRepo, WorkSubmissionRepository workSubmissionRepo, ActivityService activityService) {
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.applicationRepo = applicationRepo;
        this.workSubmissionRepo = workSubmissionRepo;
        this.activityService = activityService;
    }

    // --- UMKM: Post Project ---
    @Transactional
    public Project createProject(Long ownerId, CreateProjectRequest req) {
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

        Project savedProject = projectRepo.save(p);

        // Log activity
        activityService.logActivity(owner, ActivityService.TYPE_PROJECT_POSTED, "Posted new project: " + savedProject.getTitle(), "PROJECT", savedProject.getId());

        return savedProject;
    }

    // --- GET PROJECTS BY OWNER (UMKM) with applicant count ---
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

    // --- GET OPEN PROJECTS WITH STATUS (For Student Browsing) ---
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

    // --- ✅ UPDATED: GET PROJECTS BY STUDENT (For Dashboard) ---
    // Now returns DTOs containing the application status
    // (Approved/Rejected/Pending)
    public List<ProjectWithStatusResponse> getProjectsByStudent(Long studentId) {
        List<Project> projects = projectRepo.findProjectsByStudentId(studentId);

        return projects.stream().map(p -> {
            // Find the specific application for this student to get the status
            String myStatus = applicationRepo.findByProjectIdAndStudentId(p.getId(), studentId)
                    .map(app -> app.getStatus().name())
                    .orElse(null);

            return mapToDTO(p, myStatus);
        }).collect(Collectors.toList());
    }

    // --- HELPER: Map Entity to DTO ---
    private ProjectWithStatusResponse mapToDTO(Project p, String myStatus) {
        // Get latest submission status and feedback
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
                latestSubmissionStatus, // ✅ NEW: Latest submission status
                latestSubmissionFeedback // ✅ NEW: Latest submission feedback
        );
    }

    // --- MAHASISWA SUBMIT FINISHING ---
    @Transactional
    public void submitFinishing(Long projectId, Long studentId, String finishingLink) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Application application = applicationRepo.findByProjectIdAndStudentId(projectId, studentId)
                .orElseThrow(() -> new RuntimeException("You are not the accepted applicant for this project"));

        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new RuntimeException("Only approved applicants can submit finishing");
        }

        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

    // --- UMKM CONFIRM FINISHING ---
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

    // --- GET FINISHING STATUS ---
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