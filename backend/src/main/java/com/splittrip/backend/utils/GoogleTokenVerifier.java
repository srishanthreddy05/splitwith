package com.splittrip.backend.utils;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import lombok.extern.slf4j.Slf4j;

/**
 * GoogleTokenVerifier: Verify Google ID tokens using Google's public keys.
 * 
 * Flow:
 * 1. Frontend obtains ID token from Google SDK
 * 2. Frontend sends token to backend
 * 3. Backend calls verifyToken(idToken)
 * 4. Returns verified token payload with email, name, etc.
 * 5. If verification fails, throws SecurityException
 * 
 * Security:
 * - Validates token signature against Google's public keys
 * - Checks token audience matches our GOOGLE_CLIENT_ID
 * - Checks token expiration
 * - Never trusts frontend identity, always verifies with Google
 */
@Component
@Slf4j
public class GoogleTokenVerifier {

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Value("${app.google.client-secret}")
    private String googleClientSecret;

    /**
     * Verify Google ID token and extract payload.
     * 
     * @param idToken JWT token from Google SDK
     * @return Verified token payload with email, name, sub (Google ID)
     * @throws IllegalArgumentException if token is invalid or expired
     */
    public GoogleIdToken.Payload verifyToken(String idToken) {
        try {
            // Create verifier with Google's public keys
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            // Verify token signature and expiration
            GoogleIdToken token = verifier.verify(idToken);

            if (token == null) {
                log.warn("Invalid Google ID token: signature verification failed");
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = token.getPayload();

            // Additional validation (audience already checked by verifier)
            if (payload.getExpirationTimeSeconds() < System.currentTimeMillis() / 1000) {
                log.warn("Google token has expired");
                throw new IllegalArgumentException("Google token has expired");
            }

            log.debug("Google token verified successfully for user: {}", payload.getEmail());
            return payload;

        } catch (GeneralSecurityException e) {
            log.error("Security error verifying Google token: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to verify Google token: " + e.getMessage());
        } catch (IOException e) {
            log.error("IO error verifying Google token: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to verify Google token: " + e.getMessage());
        }
    }

    /**
     * Extract user info from verified token payload.
     * 
     * @param payload Verified token payload
     * @return GoogleUserInfo with email, name, googleId
     */
    public static GoogleUserInfo extractUserInfo(GoogleIdToken.Payload payload) {
        String googleId = payload.getSubject(); // sub = unique Google ID
        String email = payload.getEmail();
        String displayName = (String) payload.get("name");

        return GoogleUserInfo.builder()
                .googleId(googleId)
                .email(email)
                .displayName(displayName)
                .emailVerified(payload.getEmailVerified())
                .build();
    }

    /**
     * Exchange Google authorization code for user info (redirect-based OAuth flow).
     * 
     * Flow:
     * 1. Frontend redirects user to Google OAuth page
     * 2. User authenticates, Google redirects back with authorization code
     * 3. Frontend sends code to backend
     * 4. Backend exchanges code for access token and ID token with Google
     * 5. Backend extracts user info from ID token
     * 
     * @param authorizationCode Authorization code from Google OAuth redirect
     * @param redirectUri Redirect URI that was used (must match Google Cloud Console config)
     * @return GoogleUserInfo with email, name, googleId
     * @throws IllegalArgumentException if code is invalid or exchange fails
     */
    public GoogleUserInfo exchangeCodeForUserInfo(String authorizationCode, String redirectUri) {
        try {
            log.info("Exchanging Google authorization code for tokens");

            // Exchange authorization code for access token and ID token
            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    new GsonFactory(),
                    "https://oauth2.googleapis.com/token",
                    googleClientId,
                    googleClientSecret,
                    authorizationCode,
                    redirectUri
            ).execute();

            // Extract ID token from response
            GoogleIdToken idToken = tokenResponse.parseIdToken();

            if (idToken == null) {
                log.error("No ID token in Google token response");
                throw new IllegalArgumentException("Failed to get ID token from Google");
            }

            // Get payload from ID token
            GoogleIdToken.Payload payload = idToken.getPayload();

            // Verify audience
            if (!payload.getAudience().equals(googleClientId)) {
                log.error("ID token audience mismatch. Expected: {}, Got: {}", 
                         googleClientId, payload.getAudience());
                throw new IllegalArgumentException("Invalid ID token audience");
            }

            log.info("Successfully exchanged code for user info: {}", payload.getEmail());

            // Extract and return user info
            return extractUserInfo(payload);

        } catch (IOException e) {
            log.error("IO error exchanging Google authorization code: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to exchange authorization code: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error exchanging Google authorization code: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to exchange authorization code: " + e.getMessage());
        }
    }

    /**
     * Container for extracted Google user info.
     */
    @lombok.Data
    @lombok.Builder
    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String displayName;
        private Boolean emailVerified;
    }
}
