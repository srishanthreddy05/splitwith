package com.splittrip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for Google OAuth redirect-based authentication.
 * Contains authorization code from Google's OAuth redirect.
 */
@Data
public class GoogleCodeAuthRequest {
    
    /**
     * Authorization code received from Google OAuth redirect
     */
    @NotBlank(message = "Authorization code is required")
    private String code;
    
    /**
     * Redirect URI that was used in the OAuth request
     * Must match the one registered in Google Cloud Console
     */
    @NotBlank(message = "Redirect URI is required")
    private String redirectUri;
    
    /**
     * Optional: Current user ID if upgrading a guest user to Google auth
     */
    private String currentUserId;
}
