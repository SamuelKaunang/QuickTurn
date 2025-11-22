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

@Service
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    public ProjectService(ProjectRepository projectRepo, UserRepository userRepo) {
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
    }

    // --- UMKM: Post Project ---
    @Transactional
    public Project createProject(Long ownerId, CreateProjectRequest req) {
        // 1. Cari User (UMKM)
        User owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Validasi Role (Harus UMKM)
        if (owner.getRole() != Role.UMKM) {
            throw new RuntimeException("Hanya akun UMKM yang boleh memposting project");
        }

        // 3. Buat Entity Project Baru
        Project p = new Project();
        p.setOwner(owner);
        p.setTitle(req.title());
        p.setDescription(req.description());
        p.setCategory(req.category());
        p.setBudget(req.budget());
        p.setDeadline(req.deadline()); // Langsung set karena tipenya sama (LocalDate)
        p.setStatus(ProjectStatus.OPEN);

        // 4. Simpan ke Database
        return projectRepo.save(p);
    }
}