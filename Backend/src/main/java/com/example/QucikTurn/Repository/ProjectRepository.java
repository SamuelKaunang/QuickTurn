package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // ✅ IMPORT THIS
import org.springframework.data.repository.query.Param; // ✅ IMPORT THIS
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerId(Long ownerId);
    List<Project> findByStatus(com.example.QucikTurn.Entity.enums.ProjectStatus status);

    // ✅ ADD THIS NEW QUERY
    @Query("SELECT p FROM Project p JOIN Application a ON p.id = a.project.id WHERE a.student.id = :studentId")
    List<Project> findProjectsByStudentId(@Param("studentId") Long studentId);

    /**
     * Projects of a given status that have both coordinates set.
     * Used by the "nearby projects" feature so projects without coordinates are
     * excluded at the database level (they still appear in normal browsing).
     */
    List<Project> findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull(
            com.example.QucikTurn.Entity.enums.ProjectStatus status);
}