package com.splittrip.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to initiate email+OTP login.
 * Step 1: User provides email, backend sends OTP via Brevo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;
}
