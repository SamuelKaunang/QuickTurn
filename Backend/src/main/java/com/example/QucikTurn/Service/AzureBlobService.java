package com.example.QucikTurn.Service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

/**
 * Centralized service for Azure Blob Storage operations.
 * Handles all file uploads to Azure Blob Storage with UUID-based naming
 * to prevent filename collisions.
 */
@Service
public class AzureBlobService {

    private static final Logger log = LoggerFactory.getLogger(AzureBlobService.class);

    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Value("${azure.storage.container-name}")
    private String containerName;

    private BlobContainerClient containerClient;

    @PostConstruct
    public void init() {
        if (connectionString == null || connectionString.isEmpty()) {
            log.warn(
                    "Azure Storage connection string is not configured. File uploads will fail until AZURE_STORAGE_CONNECTION_STRING is set.");
            return;
        }

        try {
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                    .connectionString(connectionString)
                    .buildClient();

            containerClient = blobServiceClient.getBlobContainerClient(containerName);

            // Create container if it doesn't exist
            if (!containerClient.exists()) {
                containerClient.create();
                log.info("Created Azure Blob container: {}", containerName);
            }

            log.info("Azure Blob Storage initialized successfully. Container: {}", containerName);
        } catch (Exception e) {
            log.error("Failed to initialize Azure Blob Storage: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize Azure Blob Storage", e);
        }
    }

    /**
     * Upload a file to Azure Blob Storage.
     *
     * @param file         The MultipartFile to upload
     * @param subdirectory Optional subdirectory (e.g., "profiles", "submissions",
     *                     "chat")
     * @return The public URL of the uploaded blob
     * @throws IOException If upload fails
     */
    public String uploadFile(MultipartFile file, String subdirectory) throws IOException {
        validateConfiguration();
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = generateUniqueFilename(extension);

        // Build blob name with optional subdirectory
        String blobName = subdirectory != null && !subdirectory.isEmpty()
                ? subdirectory + "/" + uniqueFilename
                : uniqueFilename;

        try (InputStream inputStream = file.getInputStream()) {
            BlobClient blobClient = containerClient.getBlobClient(blobName);

            // Set content type for proper browser handling
            BlobHttpHeaders headers = new BlobHttpHeaders()
                    .setContentType(file.getContentType());

            blobClient.upload(inputStream, file.getSize(), true);
            blobClient.setHttpHeaders(headers);

            String blobUrl = blobClient.getBlobUrl();
            log.debug("File uploaded to Azure Blob: {}", blobUrl);

            return blobUrl;
        } catch (Exception e) {
            throw new IOException("Failed to upload file to Azure Blob Storage: " + e.getMessage(), e);
        }
    }

    /**
     * Upload a file with a specific stored filename.
     *
     * @param file           The MultipartFile to upload
     * @param subdirectory   Optional subdirectory
     * @param storedFilename The specific filename to use (should already include
     *                       UUID)
     * @return The public URL of the uploaded blob
     * @throws IOException If upload fails
     */
    public String uploadFileWithName(MultipartFile file, String subdirectory, String storedFilename)
            throws IOException {
        validateConfiguration();
        validateFile(file);

        String blobName = subdirectory != null && !subdirectory.isEmpty()
                ? subdirectory + "/" + storedFilename
                : storedFilename;

        try (InputStream inputStream = file.getInputStream()) {
            BlobClient blobClient = containerClient.getBlobClient(blobName);

            BlobHttpHeaders headers = new BlobHttpHeaders()
                    .setContentType(file.getContentType());

            blobClient.upload(inputStream, file.getSize(), true);
            blobClient.setHttpHeaders(headers);

            return blobClient.getBlobUrl();
        } catch (Exception e) {
            throw new IOException("Failed to upload file to Azure Blob Storage: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a file from Azure Blob Storage.
     *
     * @param blobUrl The full URL of the blob to delete
     * @return true if deleted successfully, false otherwise
     */
    public boolean deleteFile(String blobUrl) {
        validateConfiguration();

        try {
            // Extract blob name from URL
            String blobName = extractBlobNameFromUrl(blobUrl);
            if (blobName == null) {
                log.warn("Could not extract blob name from URL: {}", blobUrl);
                return false;
            }

            BlobClient blobClient = containerClient.getBlobClient(blobName);
            if (blobClient.exists()) {
                blobClient.delete();
                log.debug("Deleted blob: {}", blobName);
                return true;
            } else {
                log.debug("Blob not found: {}", blobName);
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to delete blob: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Generate a unique filename using UUID to prevent collisions.
     *
     * @param extension File extension including the dot (e.g., ".jpg")
     * @return Unique filename
     */
    public String generateUniqueFilename(String extension) {
        return UUID.randomUUID().toString() + (extension != null ? extension : "");
    }

    /**
     * Extract file extension from filename.
     *
     * @param filename Original filename
     * @return Extension including dot, or empty string if no extension
     */
    public String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex).toLowerCase();
        }
        return "";
    }

    /**
     * Check if the service is properly configured.
     *
     * @return true if configured, false otherwise
     */
    public boolean isConfigured() {
        return connectionString != null && !connectionString.isEmpty() && containerClient != null;
    }

    private void validateConfiguration() {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING environment variable.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }
    }

    private String extractBlobNameFromUrl(String blobUrl) {
        if (blobUrl == null || blobUrl.isEmpty()) {
            return null;
        }

        // URL format:
        // https://<storage-account>.blob.core.windows.net/<container>/<blob-path>
        try {
            String containerPath = "/" + containerName + "/";
            int containerIndex = blobUrl.indexOf(containerPath);
            if (containerIndex != -1) {
                return blobUrl.substring(containerIndex + containerPath.length());
            }
        } catch (Exception e) {
            log.warn("Error extracting blob name: {}", e.getMessage());
        }
        return null;
    }
}
