package com.splittrip.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import com.splittrip.backend.dto.CreateUserRequest;
import com.splittrip.backend.model.User;
import com.splittrip.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * User Service: Manage user lifecycle, auth, profile updates.
 * Rules:
 * - Every user (guest or authenticated) has ONE backend userId
 * - Guest users have authProvider = "GUEST"
 * - Email users have authProvider = "EMAIL" and passwordHash
 * - Google users have authProvider = "GOOGLE" and googleId
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * Safe lookup by email.
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Create a guest user with display name.
     * Called from: AuthController /auth/guest
     */
    public User createGuestUser(String displayName) {
        User guestUser = User.builder()
                .id(UUID.randomUUID().toString())
                .displayName(displayName)
                .authProvider("GUEST")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(guestUser);
    }

    /**
     * Create or get user by email for email+OTP auth.
     * If new user, creates with authProvider = "EMAIL" (passwordHash set later).
     */
    public User getOrCreateEmailUser(String email, String displayName) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .id(UUID.randomUUID().toString())
                            .email(email)
                            .displayName(displayName != null ? displayName : email.split("@")[0])
                            .authProvider("EMAIL")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });
    }

    /**
     * Create or get user by Google ID.
     * If new user, creates with authProvider = "GOOGLE".
     */
    public User getOrCreateGoogleUser(String googleId, String email, String displayName) {
        return userRepository.findByEmail(email)
            .or(() -> {
                User newUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .googleId(googleId)
                    .email(email)
                    .displayName(displayName)
                    .authProvider("GOOGLE")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
                return Optional.of(userRepository.save(newUser));
            })
            .get();
    }

    /**
     * Get user by ID.
     */
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    /**
     * Get user by email.
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    /**
     * Update user profile (display name, email).
     * Only the user can update their own profile.
     */
    public User updateProfile(String userId, String displayName, String email) {
        User user = getUserById(userId);

        if (displayName != null && !displayName.isEmpty()) {
            user.setDisplayName(displayName);
        }

        if (email != null && !email.isEmpty()) {
            // Check if email is already taken (and not by this user)
            if (!email.equals(user.getEmail()) && userRepository.findByEmail(email).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(email);
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Set password hash for email auth users.
     * Only callable after OTP verification.
     */
    public void setPasswordHash(String userId, String passwordHash) {
        User user = getUserById(userId);
        user.setPasswordHash(passwordHash);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Upgrade a guest user to email auth.
     * Preserves all user data (trips, expenses, etc).
     */
    public User upgradeGuestToEmail(String userId, String email, String passwordHash, String displayName) {
        User user = getUserById(userId);

        if (!user.isGuest()) {
            throw new IllegalArgumentException("User is not a guest");
        }

        // Check email not taken
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setAuthProvider("EMAIL");
        if (displayName != null) {
            user.setDisplayName(displayName);
        }
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Upgrade a guest user to Google auth.
     * Preserves all user data (trips, expenses, etc).
     */
    public User upgradeGuestToGoogle(String userId, String googleId, String email, String displayName) {
        User user = getUserById(userId);

        if (!user.isGuest()) {
            throw new IllegalArgumentException("User is not a guest");
        }

        // Check email not taken
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setGoogleId(googleId);
        user.setEmail(email);
        user.setAuthProvider("GOOGLE");
        if (displayName != null) {
            user.setDisplayName(displayName);
        }
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Legacy: Create or get user by UUID + name (backward compat with old system).
     */
    public User getOrCreateByIdAndName(String userId, String userName) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .id(userId)
                            .displayName(userName)
                            .authProvider("GUEST")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });
    }

    /**
     * Legacy: Create regular user (old API).
     */
    public User createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .displayName(request.getName())
                .email(request.getEmail())
                .authProvider("EMAIL")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        try {
            return userRepository.save(user);
        } catch (DuplicateKeyException e) {
            throw new IllegalArgumentException("Email already exists");
        }
    }
}
