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
 * OTP storage for email-based authentication.
 * Each OTP is valid for 10 minutes.
 * 
 * TODO: Integrate with Brevo for real OTP delivery.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otps")
public class Otp {

    @Id
    private String id;

    @Indexed(unique = false)
    private String email;

    // 6-digit or 4-digit OTP
    private String code;

    // True if OTP was verified
    private Boolean verified;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

    // For cleanup: mark expired OTPs
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !isExpired() && !verified;
    }
}
