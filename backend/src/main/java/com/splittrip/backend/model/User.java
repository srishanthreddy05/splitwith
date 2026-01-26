package com.splittrip.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User model with full auth & identity support.
 * Every user (guest or authenticated) has ONE backend userId.
 * 
 * Auth providers:
 * - GUEST: No email/password, display name only
 * - GOOGLE: OAuth identity, email from Google
 * - EMAIL: Email + password + OTP verification
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    // Display name (editable by user)
    private String displayName;

    // Email (unique, optional for guests)
    @Indexed(unique = true, sparse = true)
    private String email;

    // Auth provider type: GUEST | GOOGLE | EMAIL
    @Builder.Default
    private String authProvider = "GUEST";

    // Hashed password (only for EMAIL auth)
    private String passwordHash;

    // Google ID from OAuth (only for GOOGLE auth)
    private String googleId;

    // Legacy field for backward compatibility
    @Deprecated
    private String name;

    // Legacy field: guest tracking
    @Deprecated
    private String guestId;

    // Optional UPI ID for settlements (future)
    private String upiId;

    // Timestamps
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Helper: is this user a guest?
    public boolean isGuest() {
        return "GUEST".equals(authProvider);
    }

    // Helper: is this user email-authenticated?
    public boolean isEmailAuth() {
        return "EMAIL".equals(authProvider);
    }

    // Helper: is this user Google-authenticated?
    public boolean isGoogleAuth() {
        return "GOOGLE".equals(authProvider);
    }
    
    // Helper: Get name for display (prefers displayName, falls back to deprecated name)
    public String getName() {
        if (displayName != null && !displayName.isBlank()) {
            return displayName;
        }
        if (name != null && !name.isBlank()) {
            return name;
        }
        if (email != null) {
            return email.split("@")[0];
        }
        return "Unknown User";
    }
}
