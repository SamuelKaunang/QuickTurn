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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List; // <--- ADDED THIS IMPORT
import java.util.Map;
import java.util.HashMap;

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

    // --- GET PROJECTS BY OWNER (NEW) ---
    public List<Project> getProjectsByOwner(Long ownerId) {
        return projectRepo.findByOwnerId(ownerId);
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
        if (student.getRole() != Role.MAHASISWA) {
            throw new RuntimeException("Only mahasiswa can submit finishing");
        }
        
        if (project.getStatus() != ProjectStatus.ONGOING) {
            throw new RuntimeException("Project is not in ONGOING status for finishing");
        }
        
        if (project.getFinishingLink() != null || project.getFinishingSubmittedAt() != null) {
            throw new RuntimeException("Finishing has already been submitted for this project");
        }
        
        if (application.getFinishingLink() != null || application.getFinishingSubmittedAt() != null) {
            throw new RuntimeException("You have already submitted finishing for this project");
        }
        
        application.setFinishingLink(finishingLink);
        application.setFinishingSubmittedAt(LocalDateTime.now());
        application.setIsFinishedByStudent(true);
        applicationRepo.save(application);
        
        project.setFinishingLink(finishingLink);
        project.setFinishingSubmittedAt(LocalDateTime.now());
        projectRepo.save(project);
    }

    // --- UMKM CONFIRM FINISHING ---
    @Transactional
    public void confirmFinishing(Long projectId, Long umkmId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getOwner().getId().equals(umkmId)) {
            throw new RuntimeException("Only project owner can confirm finishing");
        }
        
        User umkm = userRepo.findById(umkmId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (umkm.getRole() != Role.UMKM) {
            throw new RuntimeException("Only UMKM can confirm finishing");
        }
        
        if (project.getFinishingLink() == null || project.getFinishingSubmittedAt() == null) {
            throw new RuntimeException("Finishing has not been submitted by the student");
        }
        
        if (project.getStatus() != ProjectStatus.ONGOING) {
            throw new RuntimeException("Project is not in ONGOING status");
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
        
        boolean isOwner = project.getOwner().getId().equals(userId);
        boolean isApplicant = applicationRepo.findByProjectIdAndStudentId(projectId, userId).isPresent();
        
        if (!isOwner && !isApplicant) {
            throw new RuntimeException("You are not authorized to view finishing status");
        }
        
        Map<String, Object> status = new HashMap<>();
        status.put("projectId", projectId);
        status.put("projectStatus", project.getStatus().name());
        status.put("finishingLink", project.getFinishingLink());
        status.put("finishingSubmittedAt", project.getFinishingSubmittedAt());
        status.put("finishedAt", project.getFinishedAt());
        status.put("finishedByUmkmId", project.getFinishedByUmkmId());
        
        applicationRepo.findByProjectIdAndStudentId(projectId, userId).ifPresent(app -> {
            status.put("applicationStatus", app.getStatus().name());
            status.put("isFinishedByStudent", app.getIsFinishedByStudent());
            status.put("applicationFinishingLink", app.getFinishingLink());
            status.put("applicationFinishingSubmittedAt", app.getFinishingSubmittedAt());
        });
        
        return status;
    }
}