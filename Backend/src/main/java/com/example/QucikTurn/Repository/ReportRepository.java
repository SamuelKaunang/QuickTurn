package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Report;
import com.example.QucikTurn.Entity.enums.ReportStatus;
import com.example.QucikTurn.Entity.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // Find reports by reporter
    List<Report> findByReporterId(Long reporterId);

    // Find reports by status (for admin)
    List<Report> findByStatus(ReportStatus status);

    // Find reports by type (for admin)
    List<Report> findByType(ReportType type);

    // Find reports by status ordered by createdAt
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);

    // Find all reports ordered by createdAt (for admin)
    List<Report> findAllByOrderByCreatedAtDesc();

    // Count pending reports (for admin dashboard)
    long countByStatus(ReportStatus status);
}
