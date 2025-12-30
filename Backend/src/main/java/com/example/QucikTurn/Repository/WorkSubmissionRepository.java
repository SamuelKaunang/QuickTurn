package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.WorkSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkSubmissionRepository extends JpaRepository<WorkSubmission, Long> {
    List<WorkSubmission> findByProjectId(Long projectId);

    List<WorkSubmission> findBySubmittedById(Long userId);

    Optional<WorkSubmission> findByProjectIdAndSubmittedById(Long projectId, Long userId);

    List<WorkSubmission> findByProjectIdOrderBySubmittedAtDesc(Long projectId);
}
