package com.splittrip.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to verify OTP and optionally set password (first-time only).
 * Step 2: User provides OTP, backend verifies.
 * Step 3: If first-time, user sets password and display name.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "OTP is required")
    @Size(min = 4, max = 6, message = "OTP must be 4-6 characters")
    private String otp;

    // Optional: for first-time signup
    private String password;

    private String displayName;

    // Flag: is this first-time signup (true) or login (false)?
    @Builder.Default
    private Boolean isSignup = false;
}
