package com.splittrip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to authenticate with Google OAuth.
 * Frontend obtains idToken from Google SDK, backend verifies it.
 * 
 * Supports two flows:
 * 1. New login/signup: Only idToken required
 *    → Backend creates new user or logs in existing by email
 * 
 * 2. Guest upgrade: Both idToken and currentUserId required
 *    → Backend verifies guest exists and upgrades to GOOGLE auth
 *    → Preserves all user data (trips, expenses, etc)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    // Optional: If upgrading guest user to Google auth
    // When provided, backend will upgrade this user instead of creating new
    private String currentUserId;
}
