package com.example.QucikTurn.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * File storage configuration.
 * Note: Local file storage has been migrated to Azure Blob Storage.
 * This config class is kept for potential future WebMvc configurations.
 * 
 * All file uploads are now handled by AzureBlobService and FileStorageService.
 */
@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
    // Local file storage has been removed.
    // Files are now stored in Azure Blob Storage.
    // See AzureBlobService and FileStorageService for implementation.
}
