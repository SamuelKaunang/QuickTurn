package com.example.QucikTurn.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.io.File;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        // Ensure uploadDir is absolute
        File dir = new File(uploadDir);
        if (!dir.isAbsolute()) {
            uploadDir = System.getProperty("user.dir") + File.separator + uploadDir;
        }

        // Create upload directories if they don't exist
        createDirectoryIfNotExists(uploadDir);
        createDirectoryIfNotExists(uploadDir + "/profiles");
        createDirectoryIfNotExists(uploadDir + "/submissions");
    }

    private void createDirectoryIfNotExists(String path) {
        File directory = new File(path);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (!created && !directory.exists()) {
                System.err.println("Failed to create directory: " + path);
            }
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = "file:" + uploadDir + "/";
        // Fix for Windows paths handling in URLs
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            path = path.replace("\\", "/");
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(path);
    }

    public String getUploadDir() {
        return uploadDir;
    }
}
