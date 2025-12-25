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
import com.example.QucikTurn.dto.CreateProjectRequest;
import com.example.QucikTurn.dto.ProjectWithStatusResponse; 
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

    public ProjectService(ProjectRepository projectRepo, UserRepository userRepo, ApplicationRepository applicationRepo) {
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.applicationRepo = applicationRepo;
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

        return projectRepo.save(p);
    }

    // --- GET PROJECTS BY OWNER (UMKM) ---
    public List<Project> getProjectsByOwner(Long ownerId) {
        return projectRepo.findByOwnerId(ownerId);
    }

    // --- GET ALL OPEN PROJECTS (For Browsing - Legacy) ---
    public List<Project> getAllOpenProjects() {
        return projectRepo.findByStatus(ProjectStatus.OPEN);
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
    // Now returns DTOs containing the application status (Approved/Rejected/Pending)
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
                p.getFinishingSubmittedAt(), // ✅ Added
                p.getFinishedAt()            // ✅ Added
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
        
        if (!project.getOwner().getId().equals(umkmId)) throw new RuntimeException("Unauthorized");
        
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