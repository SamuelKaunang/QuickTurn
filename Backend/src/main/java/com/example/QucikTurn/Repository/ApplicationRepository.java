package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Cek apakah mahasiswa sudah pernah apply ke project tertentu
    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);
    
    // Ambil semua aplikasi untuk satu project (UMKM lihat siapa saja yang apply)
    List<Application> findByProjectId(Long projectId);
    
    // Ambil semua aplikasi dari seorang mahasiswa
    List<Application> findByStudentId(Long studentId);
    
    // Ambil aplikasi spesifik berdasarkan project dan student
    Optional<Application> findByProjectIdAndStudentId(Long projectId, Long studentId);
}