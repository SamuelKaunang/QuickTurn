package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Application;
import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.Contract;
import com.example.QucikTurn.Entity.enums.ApplicationStatus;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Repository.ContractRepository;
import com.example.QucikTurn.dto.ApplicantResponse;
import com.example.QucikTurn.dto.ApplyProjectRequest;
import com.example.QucikTurn.dto.ApplyProjectResponse;
import com.example.QucikTurn.Service.ActivityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final ContractRepository contractRepo;
    private final ActivityService activityService;

    public ApplicationService(
            ApplicationRepository applicationRepo,
            ProjectRepository projectRepo,
            UserRepository userRepo,
            ContractRepository contractRepo,
            ActivityService activityService) {
        this.applicationRepo = applicationRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.contractRepo = contractRepo;
        this.activityService = activityService;
    }

    // --- LOGIC MAHASISWA APPLY ---
    @Transactional
    public ApplyProjectResponse applyToProject(Long projectId, Long studentId, ApplyProjectRequest req) {
        User student = userRepo.findById(studentId).orElseThrow(() -> new RuntimeException("User not found"));
        if (student.getRole() != Role.MAHASISWA)
            throw new RuntimeException("Only students can apply");

        Project project = projectRepo.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        if (project.getStatus() != ProjectStatus.OPEN)
            throw new RuntimeException("Project closed");

        if (applicationRepo.existsByProjectIdAndStudentId(projectId, studentId)) {
            throw new RuntimeException("Already applied");
        }

        Application application = new Application();
        application.setProject(project);
        application.setStudent(student);
        application.setProposal(req.proposal());
        application.setBidAmount(req.bidAmount());
        application.setStatus(ApplicationStatus.PENDING);

        Application saved = applicationRepo.save(application);

        // Increment applicant count for social proof
        project.incrementApplicantCount();
        projectRepo.save(project);

        // Log activity for student
        activityService.logActivity(student, ActivityService.TYPE_APPLIED, "Applied to project: " + project.getTitle(),
                "PROJECT", project.getId());

        return new ApplyProjectResponse(saved.getId(), saved.getProject().getId(), saved.getStudent().getId(),
                saved.getStatus().name());
    }

    // --- LOGIC UMKM MELIHAT LIST PELAMAR ---
    public List<ApplicantResponse> getApplicantsForProject(Long ownerId, Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }

        List<Application> apps = applicationRepo.findByProjectId(projectId);

        return apps.stream().map(app -> new ApplicantResponse(
                app.getId(),
                app.getStudent().getId(),
                app.getStudent().getNama(),
                app.getStudent().getEmail(),
                app.getProposal(),
                app.getBidAmount(),
                app.getStatus().name(),
                app.getCreatedAt(),
                app.getStudent().getAverageRating())).collect(Collectors.toList());
    }

    // --- LOGIC UMKM MENERIMA PELAMAR ---
    @Transactional
    public void acceptApplicant(Long ownerId, Long projectId, Long applicationId) {
        Project project = projectRepo.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getOwner().getId().equals(ownerId))
            throw new RuntimeException("Unauthorized");
        if (project.getStatus() != ProjectStatus.OPEN)
            throw new RuntimeException("Project not open");

        List<Application> allApps = applicationRepo.findByProjectId(projectId);
        Application acceptedApp = null;

        for (Application app : allApps) {
            if (app.getId().equals(applicationId)) {
                app.setStatus(ApplicationStatus.APPROVED);
                acceptedApp = app;
                // Log for student
                activityService.logActivity(app.getStudent(), ActivityService.TYPE_ACCEPTED,
                        "Application accepted for: " + project.getTitle(), "PROJECT", project.getId());
            } else if (app.getStatus() == ApplicationStatus.PENDING) {
                app.setStatus(ApplicationStatus.REJECTED);
                // Log for other students (optional, but requested "when he get a feedback...
                // rejected")
                activityService.logActivity(app.getStudent(), ActivityService.TYPE_REJECTED,
                        "Application rejected for: " + project.getTitle(), "PROJECT", project.getId());
            }
        }

        if (acceptedApp == null)
            throw new RuntimeException("Application ID not found");

        project.setStatus(ProjectStatus.ONGOING);
        projectRepo.save(project);
        applicationRepo.saveAll(allApps);

        // GENERATE DIGITAL CONTRACT
        String contractText = generateContractText(project, acceptedApp);

        Contract contract = new Contract();
        contract.setProject(project);
        contract.setUmkm(project.getOwner());
        contract.setStudent(acceptedApp.getStudent());
        contract.setContent(contractText);

        contractRepo.save(contract);

        // Log for UMKM
        activityService.logActivity(project.getOwner(), ActivityService.TYPE_CONTRACT_SIGNED,
                "Accepted applicant for: " + project.getTitle(), "PROJECT", project.getId());
        // Log contract signed for student too? Yes
        activityService.logActivity(acceptedApp.getStudent(), ActivityService.TYPE_CONTRACT_SIGNED,
                "Contract generated for: " + project.getTitle(), "PROJECT", project.getId());

    }

    // --- ✅ NEW: LOGIC UMKM TOLAK PELAMAR ---
    @Transactional
    public void rejectApplicant(Long ownerId, Long projectId, Long applicationId) {
        Project project = projectRepo.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));

        // Security Check
        if (!project.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized: Not your project");
        }

        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Cannot reject non-pending application");
        }

        app.setStatus(ApplicationStatus.REJECTED);
        applicationRepo.save(app);

        // Log for student
        activityService.logActivity(app.getStudent(), ActivityService.TYPE_REJECTED,
                "Application rejected for: " + project.getTitle(), "PROJECT", project.getId());
    }

    // Helper to generate the text
    private String generateContractText(Project p, Application app) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        return "SURAT PERJANJIAN KERJASAMA (SPK)\n" +
                "Nomor: QT/CTR/" + p.getId() + "/" + System.currentTimeMillis() + "\n\n" +
                "Pada hari ini, " + LocalDateTime.now().format(fmt) + ", telah disepakati kerjasama antara:\n\n" +
                "PIHAK PERTAMA (PEMBERI KERJA):\n" +
                "Nama: " + p.getOwner().getNama() + "\n" +
                "Email: " + p.getOwner().getEmail() + "\n\n" +
                "PIHAK KEDUA (PELAKSANA):\n" +
                "Nama: " + app.getStudent().getNama() + "\n" +
                "Email: " + app.getStudent().getEmail() + "\n\n" +
                "Kedua belah pihak sepakat untuk melaksanakan pekerjaan dengan detail:\n" +
                "- Judul Project: " + p.getTitle() + "\n" +
                "- Kategori: " + p.getCategory() + "\n" +
                "- Nilai Kontrak: Rp " + app.getBidAmount() + "\n" +
                "- Deadline: " + p.getDeadline() + "\n\n" +
                "Surat ini digenerate secara otomatis oleh sistem QuickTurn dan sah sebagai bukti kerjasama digital.";
    }

    // --- GET CONTRACT ---
    public String getContractByProject(Long projectId, Long userId) {
        Contract contract = contractRepo.findByProjectId(projectId)
                .orElseThrow(() -> new RuntimeException("Kontrak belum terbit"));

        if (!contract.getUmkm().getId().equals(userId) && !contract.getStudent().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return contract.getContent();
    }
}