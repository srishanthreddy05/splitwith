package com.splittrip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to create a guest user.
 * Called when user clicks "Continue as Guest" after entering display name.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestSignupRequest {

    @NotBlank(message = "Display name is required")
    private String displayName;
}
