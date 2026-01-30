package com.splittrip.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to set password and display name after OTP verification.
 * Step 3: User sets password (OTP already verified).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Display name is required")
    @Size(min = 2, message = "Display name must be at least 2 characters")
    private String displayName;
}
