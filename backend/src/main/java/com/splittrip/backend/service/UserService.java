package com.splittrip.backend.service;

import java.util.UUID;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import com.splittrip.backend.dto.CreateUserRequest;
import com.splittrip.backend.model.User;
import com.splittrip.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User createUser(CreateUserRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .email(request.getEmail())
                .build();

        try {
            return userRepository.save(user);
        } catch (DuplicateKeyException e) {
            throw new IllegalArgumentException("Email already exists");
        }
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    /**
     * Create or retrieve guest user
     * Guest users are identified by guestId (stored in browser localStorage)
     */
    public User createGuestUser(String guestId, String name) {
        // Check if guest already exists
        return userRepository.findByGuestId(guestId)
                .orElseGet(() -> {
                    User guestUser = User.builder()
                            .id(UUID.randomUUID().toString())
                            .name(name)
                            .guestId(guestId)
                            .isGuest(true)
                            .build();
                    return userRepository.save(guestUser);
                });
    }

    /**
     * Get user by guest ID
     */
    public User getUserByGuestId(String guestId) {
        return userRepository.findByGuestId(guestId)
                .orElseThrow(() -> new IllegalArgumentException("Guest user not found"));
    }

    /**
     * Get or create user by UUID (for lightweight identity system)
     * If user doesn't exist, create with name. If exists, return existing user.
     */
    public User getOrCreateByIdAndName(String userId, String userName) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .id(userId)
                            .name(userName)
                            .isGuest(true)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}
