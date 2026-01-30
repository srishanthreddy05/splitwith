package com.splittrip.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws Exception {

        String firebaseJson = System.getenv("FIREBASE_CONFIG_JSON");

        if (firebaseJson == null || firebaseJson.isBlank()) {
            throw new RuntimeException(
                "FIREBASE_CONFIG_JSON environment variable is not set. " +
                "Firebase Admin SDK cannot be initialized."
            );
        }

        InputStream serviceAccount =
                new ByteArrayInputStream(firebaseJson.getBytes(StandardCharsets.UTF_8));

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized using environment variable");
        }

        return FirebaseApp.getInstance();
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
