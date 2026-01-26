package com.splittrip.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned after successful authentication.
 * Contains userId, user info, and next steps for UX flow.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String userId;

    private String displayName;

    private String email;

    private String authProvider;

    private boolean isNew;

    // UX signal: if true, frontend should show Display Name modal
    // This happens when user authenticates but has no displayName set
    private boolean needsDisplayName;

    // Message for UI (e.g., "Set display name" or "Account upgraded")
    private String nextStep;
}
