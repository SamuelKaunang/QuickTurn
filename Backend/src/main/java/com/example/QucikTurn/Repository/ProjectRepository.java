package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Nanti berguna untuk melihat project milik UMKM tertentu
    List<Project> findByOwnerId(Long ownerId);
}