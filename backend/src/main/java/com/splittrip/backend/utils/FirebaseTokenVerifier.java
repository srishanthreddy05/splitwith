package com.splittrip.backend.utils;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Firebase Token Verifier
 * 
 * Verifies Firebase ID tokens from the frontend and extracts user claims.
 * 
 * Assumes:
 * - FirebaseAuth is initialized by FirebaseConfig at application startup
 * - Tokens are always present (caller validates Authorization header)
 * - Only responsibility is token verification and claim extraction
 * 
 * Firebase Admin SDK automatically:
 * - Validates token signature using Google's public keys
 * - Checks token expiration
 * - Checks token issued-at time
 * - Extracts claims (uid, email, name, picture, etc.)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FirebaseTokenVerifier {

    private final FirebaseAuth firebaseAuth;

    /**
     * Verify Firebase ID token and extract claims.
     * 
     * @param idToken Firebase ID token from client (from Authorization: Bearer <token>)
     * @return Map of verified token claims (sub, email, name, picture, etc.)
     * @throws IllegalArgumentException if token is invalid, expired, or malformed
     */
    public Map<String, Object> verifyToken(String idToken) {
        try {
            var decodedToken = firebaseAuth.verifyIdToken(idToken);
            var claims = decodedToken.getClaims();
            
            String uid = decodedToken.getUid();
            String email = (String) claims.get("email");
            
            log.debug("Firebase token verified for uid={}, email={}", uid, email);
            
            return claims;
        } catch (FirebaseAuthException e) {
            log.warn("Firebase token verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid Firebase ID token: " + e.getMessage(), e);
        }
    }

    /**
     * Extract email from verified token claims.
     */
    public static String extractEmail(Map<String, Object> tokenClaims) {
        Object email = tokenClaims.get("email");
        return email != null ? email.toString() : null;
    }

    /**
     * Extract display name from verified token claims.
     */
    public static String extractName(Map<String, Object> tokenClaims) {
        Object name = tokenClaims.get("name");
        return name != null ? name.toString() : null;
    }

    /**
     * Extract picture URL from verified token claims.
     */
    public static String extractPicture(Map<String, Object> tokenClaims) {
        Object picture = tokenClaims.get("picture");
        return picture != null ? picture.toString() : null;
    }
}
