package com.splittrip.backend.service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.splittrip.backend.model.Otp;
import com.splittrip.backend.repository.OtpRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OTP Service: Generate, send, and verify OTPs for email authentication.
 * 
 * TODO: Integrate with Brevo (https://www.brevo.com/) for real email delivery.
 * For now, OTP is logged to console.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpRepository otpRepository;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 10;

    /**
     * Generate and store OTP for email.
     * In production, send via Brevo.
     * For now, logs OTP to console for testing.
     */
    public void generateAndSendOtp(String email) {
        // Generate 6-digit OTP
        String otpCode = generateOtpCode();

        // Create and save OTP record
        Otp otp = Otp.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .code(otpCode)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES))
                .build();

        otpRepository.save(otp);

        // TODO: Send via Brevo API
        // BrevoService.sendOtpEmail(email, otpCode);

        // For development, log to console
        log.info("OTP for email '{}': {}", email, otpCode);
    }

    /**
     * Verify OTP against stored code.
     * Returns true if OTP is valid, false otherwise.
     */
    public boolean verifyOtp(String email, String providedOtp) {
        var otpRecord = otpRepository.findFirstByEmailAndVerifiedIsFalseOrderByCreatedAtDesc(email);

        if (otpRecord.isEmpty()) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }

        Otp otp = otpRecord.get();

        // Check if expired
        if (otp.isExpired()) {
            log.warn("OTP expired for email: {}", email);
            return false;
        }

        // Check if matches
        if (!otp.getCode().equals(providedOtp)) {
            log.warn("OTP mismatch for email: {}", email);
            return false;
        }

        // Mark as verified
        otp.setVerified(true);
        otpRepository.save(otp);

        log.info("OTP verified successfully for email: {}", email);
        return true;
    }

    /**
     * Generate random 6-digit OTP.
     */
    private String generateOtpCode() {
        Random random = new Random();
        int otp = random.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", otp);
    }

    /**
     * Clean up expired OTPs (run periodically via scheduled task).
     */
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Cleaned up expired OTPs");
    }
}
