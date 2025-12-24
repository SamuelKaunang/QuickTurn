package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Finds all projects belonging to a specific UMKM ID
    List<Project> findByOwnerId(Long ownerId);

    // ✅ ADDED: Find projects by their status (e.g., OPEN)
    List<Project> findByStatus(ProjectStatus status);
}