package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Application;
import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.ApplicantResponse; // ✅ Import ini wajib ada
import com.example.QucikTurn.dto.ApplyProjectRequest;
import com.example.QucikTurn.dto.ApplyProjectResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepo; // ✅ Nama variabel panjang (tidak disingkat)
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    public ApplicationService(
            ApplicationRepository applicationRepo,
            ProjectRepository projectRepo,
            UserRepository userRepo
    ) {
        this.applicationRepo = applicationRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
    }

    // --- LOGIC MAHASISWA APPLY ---
    @Transactional
    public ApplyProjectResponse applyToProject(Long projectId, Long studentId, ApplyProjectRequest req) {
        // 1. Validasi User
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (student.getRole() != Role.MAHASISWA) {
            throw new RuntimeException("Hanya mahasiswa yang boleh apply project");
        }

        // 2. Validasi Project
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new RuntimeException("Project sudah tidak menerima aplikasi");
        }

        // 3. Validasi Duplikasi
        if (applicationRepo.existsByProjectIdAndStudentId(projectId, studentId)) {
            throw new RuntimeException("You have already applied for this project");
        }

        // 4. Simpan Aplikasi
        Application application = new Application();
        application.setProject(project);
        application.setStudent(student);
        application.setProposal(req.proposal());
        application.setBidAmount(req.bidAmount());
        application.setStatus(ApplicationStatus.PENDING);

        Application saved = applicationRepo.save(application);

        return new ApplyProjectResponse(
                saved.getId(),
                saved.getProject().getId(),
                saved.getStudent().getId(),
                saved.getStatus().name()
        );
    }

    // --- LOGIC UMKM MELIHAT LIST PELAMAR ---
    public List<ApplicantResponse> getApplicantsForProject(Long ownerId, Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized: You are not the owner of this project");
        }

        List<Application> apps = applicationRepo.findByProjectId(projectId);

        return apps.stream().map(app -> new ApplicantResponse(
                app.getId(),
                app.getStudent().getId(),      // ✅ FIX: Sesuai Entity (student)
                app.getStudent().getNama(),    // ✅ FIX: Sesuai Entity (student)
                app.getStudent().getEmail(),   // ✅ FIX: Sesuai Entity (student)
                app.getProposal(),             // ✅ FIX: Sesuai Entity (proposal)
                app.getBidAmount(),
                app.getStatus().name(),
                app.getCreatedAt()
        )).collect(Collectors.toList());
    }

    // --- LOGIC UMKM MENERIMA PELAMAR ---
    @Transactional
    public void acceptApplicant(Long ownerId, Long projectId, Long applicationId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized Access");
        }

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new RuntimeException("Project is already closed or ongoing");
        }

        List<Application> allApps = applicationRepo.findByProjectId(projectId);
        boolean found = false;

        for (Application app : allApps) {
            if (app.getId().equals(applicationId)) {
                app.setStatus(ApplicationStatus.APPROVED);
                found = true;
            } else {
                if (app.getStatus() == ApplicationStatus.PENDING) {
                    app.setStatus(ApplicationStatus.REJECTED);
                }
            }
        }

        if (!found) throw new RuntimeException("Application ID not found in this project");

        project.setStatus(ProjectStatus.ONGOING);
        projectRepo.save(project);

        // ✅ FIX: Menggunakan variabel applicationRepo (bukan appRepo)
        applicationRepo.saveAll(allApps);
    }
}