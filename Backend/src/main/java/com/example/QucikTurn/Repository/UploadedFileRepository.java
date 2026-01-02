package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.UploadedFile;
import com.example.QucikTurn.Entity.enums.FileType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findByUploaderId(Long uploaderId);

    List<UploadedFile> findByProjectId(Long projectId);

    List<UploadedFile> findByUploaderIdAndFileType(Long uploaderId, FileType fileType);

    Optional<UploadedFile> findByStoredFilename(String storedFilename);

    // For account deletion - delete all files uploaded by a user
    void deleteByUploaderId(Long uploaderId);
}
