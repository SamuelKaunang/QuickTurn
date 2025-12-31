package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.UploadedFile;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.enums.FileType;
import com.example.QucikTurn.Repository.UploadedFileRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

/**
 * Service for handling file storage operations.
 * Delegates actual storage to AzureBlobService and manages file metadata in
 * database.
 */
@Service
public class FileStorageService {

    private final AzureBlobService azureBlobService;
    private final UploadedFileRepository uploadedFileRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    // Allowed file types
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");

    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "application/zip",
            "application/x-rar-compressed",
            "application/x-7z-compressed");

    private static final long MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB
    private static final long MAX_SUBMISSION_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public FileStorageService(AzureBlobService azureBlobService,
            UploadedFileRepository uploadedFileRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository) {
        this.azureBlobService = azureBlobService;
        this.uploadedFileRepository = uploadedFileRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    /**
     * Upload a profile picture for a user.
     * Updates the user's profilePictureUrl in the database.
     *
     * @param file The image file
     * @param user The user uploading the profile picture
     * @return The UploadedFile entity with Azure URL
     * @throws IOException If upload fails
     */
    @Transactional
    public UploadedFile uploadProfilePicture(MultipartFile file, User user) throws IOException {
        // Validate file type - only images allowed
        String contentType = file.getContentType();
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed for profile pictures.");
        }

        // Validate file size
        if (file.getSize() > MAX_PROFILE_PICTURE_SIZE) {
            throw new IllegalArgumentException(
                    "File too large. Maximum profile picture size is 5MB.");
        }

        // Generate unique filename
        String extension = azureBlobService.getFileExtension(file.getOriginalFilename());
        String storedFilename = azureBlobService.generateUniqueFilename(extension);

        // Upload to Azure Blob Storage
        String blobUrl = azureBlobService.uploadFileWithName(file, "profiles", storedFilename);

        // Delete old profile picture if exists
        if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty()) {
            azureBlobService.deleteFile(user.getProfilePictureUrl());
            // Also delete old record from database
            uploadedFileRepository.findByStoredFilename(extractFilename(user.getProfilePictureUrl()))
                    .ifPresent(uploadedFileRepository::delete);
        }

        // Create UploadedFile record
        UploadedFile uploadedFile = new UploadedFile(
                file.getOriginalFilename(),
                storedFilename,
                blobUrl, // Store the Azure URL
                contentType,
                file.getSize(),
                FileType.PROFILE_PICTURE,
                user);

        uploadedFile = uploadedFileRepository.save(uploadedFile);

        // Update user's profile picture URL
        user.setProfilePictureUrl(blobUrl);
        userRepository.save(user);

        return uploadedFile;
    }

    /**
     * Upload files for a work submission.
     *
     * @param files     List of files to upload
     * @param uploader  The user uploading
     * @param projectId The project ID
     * @return List of UploadedFile entities
     * @throws IOException If upload fails
     */
    @Transactional
    public List<UploadedFile> uploadSubmissionFiles(List<MultipartFile> files, User uploader, Long projectId)
            throws IOException {
        List<UploadedFile> uploadedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            // Validate file type
            String contentType = file.getContentType();
            if (!isAllowedFileType(contentType)) {
                throw new IllegalArgumentException(
                        "Invalid file type: " + contentType + ". Please upload images or documents only.");
            }

            // Validate file size
            if (file.getSize() > MAX_SUBMISSION_FILE_SIZE) {
                throw new IllegalArgumentException(
                        "File too large: " + file.getOriginalFilename() + ". Maximum size is 50MB.");
            }

            // Generate unique filename
            String extension = azureBlobService.getFileExtension(file.getOriginalFilename());
            String storedFilename = azureBlobService.generateUniqueFilename(extension);

            // Upload to Azure with project subdirectory
            String subdirectory = "submissions/" + projectId;
            String blobUrl = azureBlobService.uploadFileWithName(file, subdirectory, storedFilename);

            // Determine file type
            FileType fileType = ALLOWED_IMAGE_TYPES.contains(contentType)
                    ? FileType.SUBMISSION_IMAGE
                    : FileType.SUBMISSION_DOCUMENT;

            // Create UploadedFile record
            UploadedFile uploadedFile = new UploadedFile(
                    file.getOriginalFilename(),
                    storedFilename,
                    blobUrl,
                    contentType,
                    file.getSize(),
                    fileType,
                    uploader);
            uploadedFile.setProjectId(projectId);

            uploadedFiles.add(uploadedFileRepository.save(uploadedFile));
        }

        return uploadedFiles;
    }

    /**
     * Upload a chat attachment (image or document).
     *
     * @param file     The file to upload
     * @param uploader The user uploading
     * @return Map containing file info for chat message
     * @throws IOException If upload fails
     */
    public Map<String, Object> uploadChatAttachment(MultipartFile file, User uploader) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (!isAllowedFileType(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Please upload images or documents only.");
        }

        // Validate file size
        if (file.getSize() > MAX_ATTACHMENT_SIZE) {
            throw new IllegalArgumentException(
                    "File too large. Maximum attachment size is 25MB.");
        }

        // Generate unique filename
        String extension = azureBlobService.getFileExtension(file.getOriginalFilename());
        String storedFilename = azureBlobService.generateUniqueFilename(extension);

        // Upload to Azure
        String blobUrl = azureBlobService.uploadFileWithName(file, "chat", storedFilename);

        // Determine attachment type
        String attachmentType = ALLOWED_IMAGE_TYPES.contains(contentType) ? "IMAGE" : "DOCUMENT";

        // Return file info for chat message (stored in MongoDB)
        Map<String, Object> fileInfo = new HashMap<>();
        fileInfo.put("attachmentUrl", blobUrl);
        fileInfo.put("attachmentType", attachmentType);
        fileInfo.put("originalFilename", file.getOriginalFilename());
        fileInfo.put("fileSize", file.getSize());
        fileInfo.put("contentType", contentType);

        return fileInfo;
    }

    /**
     * Delete a file by ID.
     *
     * @param fileId The file ID
     * @param user   The user requesting deletion (must be the uploader)
     * @throws IOException If deletion fails
     */
    @Transactional
    public void deleteFile(Long fileId, User user) throws IOException {
        UploadedFile uploadedFile = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Check ownership
        if (!uploadedFile.getUploader().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this file");
        }

        // Delete from Azure Blob Storage
        String blobUrl = uploadedFile.getFilePath();
        boolean deleted = azureBlobService.deleteFile(blobUrl);

        if (!deleted) {
            System.err.println("Warning: Could not delete file from Azure: " + blobUrl);
        }

        // If it's a profile picture, clear the user's profilePictureUrl
        if (uploadedFile.getFileType() == FileType.PROFILE_PICTURE) {
            user.setProfilePictureUrl(null);
            userRepository.save(user);
        }

        // Delete from database
        uploadedFileRepository.delete(uploadedFile);
    }

    /**
     * Get file by ID.
     *
     * @param fileId The file ID
     * @return The UploadedFile entity
     */
    public UploadedFile getFileById(Long fileId) {
        return uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
    }

    /**
     * Get all files uploaded by a user.
     *
     * @param userId The user ID
     * @return List of UploadedFile entities
     */
    public List<UploadedFile> getUserFiles(Long userId) {
        return uploadedFileRepository.findByUploaderId(userId);
    }

    private boolean isAllowedFileType(String contentType) {
        return ALLOWED_IMAGE_TYPES.contains(contentType) || ALLOWED_DOCUMENT_TYPES.contains(contentType);
    }

    private String extractFilename(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        int lastSlash = url.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < url.length() - 1) {
            return url.substring(lastSlash + 1);
        }
        return url;
    }

    /**
     * Upload a project attachment (brief files, design specs, etc.).
     * Only the project owner (UMKM) can upload attachments.
     *
     * @param file      The file to upload
     * @param user      The user uploading (must be project owner)
     * @param projectId The project ID
     * @return Map containing url and filename
     * @throws IOException If upload fails
     */
    @Transactional
    public Map<String, String> uploadProjectAttachment(MultipartFile file, User user, Long projectId)
            throws IOException {
        // Find the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate ownership
        if (!project.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to upload attachments to this project");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (!isAllowedFileType(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Please upload images or documents only.");
        }

        // Validate file size
        if (file.getSize() > MAX_ATTACHMENT_SIZE) {
            throw new IllegalArgumentException(
                    "File too large. Maximum attachment size is 25MB.");
        }

        // Generate unique filename
        String extension = azureBlobService.getFileExtension(file.getOriginalFilename());
        String storedFilename = azureBlobService.generateUniqueFilename(extension);

        // Upload to Azure with project-attachments subdirectory
        String subdirectory = "project-attachments/" + projectId;
        String blobUrl = azureBlobService.uploadFileWithName(file, subdirectory, storedFilename);

        // Update project with attachment info
        project.setAttachmentUrl(blobUrl);
        project.setAttachmentName(file.getOriginalFilename());
        projectRepository.save(project);

        // Return the URL and original filename
        Map<String, String> result = new HashMap<>();
        result.put("url", blobUrl);
        result.put("filename", file.getOriginalFilename());
        result.put("contentType", contentType);

        return result;
    }
}
