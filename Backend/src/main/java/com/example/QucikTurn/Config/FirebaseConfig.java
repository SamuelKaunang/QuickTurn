package com.example.QucikTurn.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class FirebaseConfig {

    @Value("${quickturn.firebase.config-path:}")
    private String firebaseConfigPath;

    private boolean firebaseEnabled = false;

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount = null;

            if (firebaseConfigPath != null && !firebaseConfigPath.isBlank()) {
                if (Files.exists(Paths.get(firebaseConfigPath))) {
                    serviceAccount = new FileInputStream(firebaseConfigPath);
                } else {
                    // Try classpath
                    serviceAccount = getClass().getClassLoader().getResourceAsStream(firebaseConfigPath);
                }
            }

            // Fallback: search default location
            if (serviceAccount == null) {
                String defaultPath = "firebase-service-account.json";
                serviceAccount = getClass().getClassLoader().getResourceAsStream(defaultPath);
                if (serviceAccount == null && Files.exists(Paths.get(defaultPath))) {
                    serviceAccount = new FileInputStream(defaultPath);
                }
            }

            FirebaseOptions options;
            if (serviceAccount != null) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
                firebaseEnabled = true;
                System.out.println("Firebase Admin SDK successfully initialized using service account credentials.");
            } else {
                // Try initializing with Google Application Default Credentials
                try {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                    FirebaseApp.initializeApp(options);
                    firebaseEnabled = true;
                    System.out.println("Firebase Admin SDK successfully initialized using Application Default Credentials.");
                } catch (Exception e) {
                    System.err.println("WARNING: Firebase Admin SDK could not be initialized because no credentials were found.");
                    System.err.println("To enable push notifications, configure 'quickturn.firebase.config-path' in application.properties or place 'firebase-service-account.json' in resources.");
                }
            }
        } catch (IOException e) {
            System.err.println("ERROR: Failed to read Firebase credentials: " + e.getMessage());
        }
    }

    public boolean isFirebaseEnabled() {
        return firebaseEnabled;
    }
}
