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
import com.example.QucikTurn.dto.ApplyProjectRequest;
import com.example.QucikTurn.dto.ApplyProjectResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepo;
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

    @Transactional
    public ApplyProjectResponse applyToProject(Long projectId, Long studentId, ApplyProjectRequest req) {
        // 1. Validasi: Cek apakah user adalah MAHASISWA
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (student.getRole() != Role.MAHASISWA) {
            throw new RuntimeException("Hanya mahasiswa yang boleh apply project");
        }

        // 2. Validasi: Cek apakah project ada
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 3. Validasi: Cek apakah project masih OPEN
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new RuntimeException("Project sudah tidak menerima aplikasi");
        }

        // 4. Validasi: Cek apakah mahasiswa sudah pernah apply
        if (applicationRepo.existsByProjectIdAndStudentId(projectId, studentId)) {
            throw new RuntimeException("You have already applied for this project");
        }

        // 5. Buat aplikasi baru
        Application application = new Application();
        application.setProject(project);
        application.setStudent(student);
        application.setProposal(req.proposal());
        application.setBidAmount(req.bidAmount());
        application.setStatus(ApplicationStatus.PENDING);

        // 6. Simpan ke database
        Application saved = applicationRepo.save(application);

        // 7. Return response
        return new ApplyProjectResponse(
                saved.getId(),
                saved.getProject().getId(),
                saved.getStudent().getId(),
                saved.getStatus().name()
        );
    }
}