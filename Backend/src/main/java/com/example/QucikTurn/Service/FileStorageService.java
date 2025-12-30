package com.example.QucikTurn.Service;

import com.example.QucikTurn.Config.FileStorageConfig;
import com.example.QucikTurn.Entity.UploadedFile;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.FileType;
import com.example.QucikTurn.Repository.UploadedFileRepository;
import com.example.QucikTurn.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private final FileStorageConfig fileStorageConfig;
    private final UploadedFileRepository fileRepository;
    private final UserRepository userRepository;

    // Allowed extensions for profile pictures
    private static final List<String> ALLOWED_PROFILE_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp");

    // Allowed extensions for work submissions
    private static final List<String> ALLOWED_SUBMISSION_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "zip", "rar", "7z");

    // Allowed extensions for chat attachments (images)
    private static final List<String> ALLOWED_CHAT_IMAGE_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg", "ico", "heic", "heif");

    // Allowed extensions for chat attachments (documents)
    private static final List<String> ALLOWED_CHAT_DOCUMENT_EXTENSIONS = Arrays.asList(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "zip", "rar", "7z");

    // Max file size: 50MB in bytes
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    // Max chat attachment size: 10MB in bytes
    private static final long MAX_CHAT_ATTACHMENT_SIZE = 10 * 1024 * 1024;

    // Max files per submission
    private static final int MAX_FILES_PER_SUBMISSION;

    static {
        MAX_FILES_PER_SUBMISSION = 10;
    }

    public FileStorageService(FileStorageConfig fileStorageConfig,
            UploadedFileRepository fileRepository,
            UserRepository userRepository) {
        this.fileStorageConfig = fileStorageConfig;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    /**
     * Upload profile picture
     */
    @Transactional
    public UploadedFile uploadProfilePicture(MultipartFile file, User user) throws IOException {
        // Validate file
        validateFile(file, ALLOWED_PROFILE_EXTENSIONS, "profile picture");

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String storedFilename = "profile_" + user.getId() + "_" + UUID.randomUUID().toString() + "." + extension;

        // Save file to disk
        String subDir = "profiles";
        Path targetPath = saveFileToDisk(file, subDir, storedFilename);

        // Create and save UploadedFile entity
        UploadedFile uploadedFile = new UploadedFile(
                originalFilename,
                storedFilename,
                "/uploads/" + subDir + "/" + storedFilename,
                file.getContentType(),
                file.getSize(),
                FileType.PROFILE_PICTURE,
                user);

        UploadedFile saved = fileRepository.save(uploadedFile);

        // Update user's profile picture URL
        user.setProfilePictureUrl(uploadedFile.getFilePath());
        userRepository.save(user);

        return saved;
    }

    /**
     * Upload work submission files
     */
    @Transactional
    public List<UploadedFile> uploadSubmissionFiles(List<MultipartFile> files, User user, Long projectId)
            throws IOException {
        // Validate file count
        if (files.size() > MAX_FILES_PER_SUBMISSION) {
            throw new IllegalArgumentException("Maximum " + MAX_FILES_PER_SUBMISSION + " files allowed per submission");
        }

        // Validate and save each file
        List<UploadedFile> uploadedFiles = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            // Validate file
            validateFile(file, ALLOWED_SUBMISSION_EXTENSIONS, "work submission");

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String storedFilename = "submission_" + projectId + "_" + UUID.randomUUID().toString() + "." + extension;

            // Save file to disk
            String subDir = "submissions";
            saveFileToDisk(file, subDir, storedFilename);

            // Create and save UploadedFile entity
            UploadedFile uploadedFile = new UploadedFile(
                    originalFilename,
                    storedFilename,
                    "/uploads/" + subDir + "/" + storedFilename,
                    file.getContentType(),
                    file.getSize(),
                    FileType.WORK_SUBMISSION,
                    user);
            uploadedFile.setProjectId(projectId);

            uploadedFiles.add(fileRepository.save(uploadedFile));
        }

        return uploadedFiles;
    }

    /**
     * Get submission files for a project
     */
    public List<UploadedFile> getSubmissionFiles(Long projectId) {
        return fileRepository.findByProjectId(projectId);
    }

    /**
     * Upload chat attachment (image or document)
     * Max size: 10MB
     */
    public Map<String, Object> uploadChatAttachment(MultipartFile file, User user) throws IOException {
        // Validate file is not empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file size (10MB max for chat)
        if (file.getSize() > MAX_CHAT_ATTACHMENT_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename).toLowerCase();

        // Determine attachment type
        String attachmentType;
        if (ALLOWED_CHAT_IMAGE_EXTENSIONS.contains(extension)) {
            attachmentType = "IMAGE";
        } else if (ALLOWED_CHAT_DOCUMENT_EXTENSIONS.contains(extension)) {
            attachmentType = "DOCUMENT";
        } else {
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed images: " + String.join(", ", ALLOWED_CHAT_IMAGE_EXTENSIONS) +
                            ". Allowed documents: " + String.join(", ", ALLOWED_CHAT_DOCUMENT_EXTENSIONS));
        }

        // Generate unique filename
        String storedFilename = "chat_" + user.getId() + "_" + UUID.randomUUID().toString() + "." + extension;

        // Save file to disk
        String subDir = "chat";
        saveFileToDisk(file, subDir, storedFilename);

        // Build file path
        String filePath = "/uploads/" + subDir + "/" + storedFilename;

        // Return file info (we don't need to persist to MySQL for chat files)
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("attachmentUrl", filePath);
        result.put("attachmentType", attachmentType);
        result.put("originalFilename", originalFilename);
        result.put("fileSize", file.getSize());

        return result;
    }

    /**
     * Delete file by ID
     */
    @Transactional
    public void deleteFile(Long fileId, User user) throws IOException {
        UploadedFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Check authorization - only uploader can delete
        if (!file.getUploader().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this file");
        }

        // Delete from disk
        Path filePath = Paths.get(fileStorageConfig.getUploadDir() + file.getFilePath().replace("/uploads", ""));
        Files.deleteIfExists(filePath);

        // Delete from database
        fileRepository.delete(file);
    }

    // --- Private Helper Methods ---

    private void validateFile(MultipartFile file, List<String> allowedExtensions, String type) {
        if (file.isEmpty()) {
            System.err.println("Validation failed: File is empty");
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            System.err.println("Validation failed: File size " + file.getSize() + " exceeds limit " + MAX_FILE_SIZE);
            throw new IllegalArgumentException("File size exceeds maximum limit of 50MB");
        }

        String originalName = file.getOriginalFilename();
        String extension = getFileExtension(originalName).toLowerCase();

        // Debug
        System.out.println("Validating file: " + originalName + " (" + file.getSize() + " bytes), extension: "
                + extension + ", type context: " + type);

        if (!allowedExtensions.contains(extension)) {
            System.err
                    .println("Validation failed: Invalid extension '" + extension + "'. Allowed: " + allowedExtensions);
            throw new IllegalArgumentException(
                    "Invalid file type for " + type + ". Allowed: " + String.join(", ", allowedExtensions));
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private Path saveFileToDisk(MultipartFile file, String subDir, String filename) throws IOException {
        Path uploadPath = Paths.get(fileStorageConfig.getUploadDir(), subDir);

        // Create directory if it doesn't exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path targetPath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return targetPath;
    }
}
