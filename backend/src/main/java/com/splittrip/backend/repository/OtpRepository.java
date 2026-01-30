package com.splittrip.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.splittrip.backend.model.Otp;

public interface OtpRepository extends MongoRepository<Otp, String> {

    // Find the most recent unverified OTP for an email
    Optional<Otp> findFirstByEmailAndVerifiedIsFalseOrderByCreatedAtDesc(String email);

    // Find the most recent verified OTP for an email
    Optional<Otp> findFirstByEmailAndVerifiedIsTrueOrderByCreatedAtDesc(String email);

    // Find all OTPs for an email (for cleanup)
    List<Otp> findByEmail(String email);

    // Delete expired OTPs (called periodically)
    void deleteByExpiresAtBefore(LocalDateTime now);
}
