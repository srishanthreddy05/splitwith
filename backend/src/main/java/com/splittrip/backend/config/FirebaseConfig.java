package com.splittrip.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * Firebase Admin SDK Configuration
 * 
 * Initializes Firebase Admin SDK exactly once at application startup.
 * Exposes FirebaseAuth as a Spring Bean for dependency injection.
 * 
 * Fails immediately if:
 * - firebase-service-account.json is missing from classpath
 * - Service account JSON is invalid
 * - Firebase initialization fails
 * 
 * Setup:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Select your Firebase project
 * 3. Go to Service Accounts (Project Settings → Service Accounts tab)
 * 4. Click "Generate New Private Key"
 * 5. Save the downloaded JSON to src/main/resources/firebase-service-account.json
 */
@Configuration
@Slf4j
public class FirebaseConfig {

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        // If FirebaseApp is already initialized, reuse it
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase App already initialized, returning existing instance");
            return FirebaseAuth.getInstance();
        }

        // Load service account credentials from classpath
        var credentialStream = this.getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
        
        if (credentialStream == null) {
            String errorMsg = "Firebase service account credentials NOT FOUND at classpath:firebase-service-account.json. " +
                    "Download the private key from Firebase Console → Project Settings → Service Accounts → Generate New Private Key, " +
                    "then save it to src/main/resources/firebase-service-account.json";
            log.error(errorMsg);
            throw new IOException(errorMsg);
        }

        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialStream);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully");

            return FirebaseAuth.getInstance();
        } catch (IOException | IllegalArgumentException e) {
            String errorMsg = "Failed to initialize Firebase Admin SDK: " + e.getMessage() + ". " +
                    "Verify that firebase-service-account.json contains valid credentials.";
            log.error(errorMsg, e);
            throw new IOException(errorMsg, e);
        }
    }
}
