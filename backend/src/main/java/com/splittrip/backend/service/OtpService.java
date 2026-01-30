package com.splittrip.backend.service;

import java.io.IOException;
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
 * Integrated with Brevo (https://www.brevo.com/) for real email delivery.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpRepository otpRepository;
    private final BrevoEmailService brevoEmailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 10;

    /**
     * Generate and send OTP to email via Brevo.
     * Creates a 6-digit OTP code and sends it via professional email template.
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

        // Send via Brevo API
        try {
            brevoEmailService.sendOtpEmail(email, otpCode);
            log.info("OTP email sent successfully via Brevo to: {}", email);
        } catch (IOException e) {
            log.error("Failed to send OTP email via Brevo to: {}", email, e);
            // Still log OTP to console as fallback for development
            log.warn("FALLBACK - OTP for email '{}': {}", email, otpCode);
            throw new RuntimeException("Failed to send OTP email. Please try again.", e);
        }
    }

    /**
     * Verify OTP against stored code.
     * Marks OTP as verified but does NOT delete it.
     * Returns true if OTP is valid, false otherwise.
     */
    public boolean verifyOtp(String email, String providedOtp) {
        var otpRecord = otpRepository.findFirstByEmailAndVerifiedIsFalseOrderByCreatedAtDesc(email);

        if (otpRecord.isEmpty()) {
            log.warn("No unverified OTP found for email: {}", email);
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

        // Mark as verified (but keep the record for password setup)
        otp.setVerified(true);
        otpRepository.save(otp);

        log.info("OTP verified successfully for email: {}", email);
        return true;
    }

    /**
     * Check if email has a verified OTP (without re-verifying).
     * Used during password setup to ensure OTP was already verified.
     */
    public boolean isOtpVerified(String email) {
        var otpRecord = otpRepository.findFirstByEmailAndVerifiedIsTrueOrderByCreatedAtDesc(email);

        if (otpRecord.isEmpty()) {
            log.warn("No verified OTP found for email: {}", email);
            return false;
        }

        Otp otp = otpRecord.get();

        // Check if still valid (not expired)
        if (otp.isExpired()) {
            log.warn("Verified OTP expired for email: {}", email);
            return false;
        }

        log.info("Verified OTP exists for email: {}", email);
        return true;
    }

    /**
     * Clear OTP verification after password is successfully set.
     * Deletes the verified OTP record.
     */
    public void clearOtpVerification(String email) {
        var otpRecord = otpRepository.findFirstByEmailAndVerifiedIsTrueOrderByCreatedAtDesc(email);
        
        if (otpRecord.isPresent()) {
            otpRepository.delete(otpRecord.get());
            log.info("Cleared verified OTP for email: {}", email);
        }
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
