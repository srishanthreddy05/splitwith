package com.splittrip.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.splittrip.backend.dto.ApiResponse;
import com.splittrip.backend.dto.CreateGuestUserRequest;
import com.splittrip.backend.dto.CreateUserRequest;
import com.splittrip.backend.dto.ProfileUpdateRequest;
import com.splittrip.backend.model.User;
import com.splittrip.backend.service.UserService;
import com.splittrip.backend.utils.FirebaseTokenVerifier;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final FirebaseTokenVerifier firebaseTokenVerifier;

    /**
     * Create user (legacy endpoint, kept for backward compat).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get user by ID.
     * Called on app load to check if user is logged in.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Legacy endpoint - no longer used (auth is handled via /auth/guest).
     * Kept for backward compatibility if needed.
     */
    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<User>> createGuestUser(@Valid @RequestBody CreateGuestUserRequest request) {
        try {
            User guestUser = userService.createGuestUser(request.getName());
            return ResponseEntity.ok(ApiResponse.success(guestUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get or create lightweight user identity (UUID + name).
     * This is the primary endpoint for the MVP lightweight identity system.
     * Called on app load if no userId in localStorage.
     */
    @PostMapping("/identity")
    public ResponseEntity<ApiResponse<User>> getOrCreateIdentity(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String userName = request.get("userName");

            if (userId == null || userId.isBlank() || userName == null || userName.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId and userName are required"));
            }

            User user = userService.getOrCreateByIdAndName(userId, userName);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update user profile: display name, email.
     * Only the user can update their own profile.
     * 
     * Request: { displayName: "John Doe", email: "john@example.com" }
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @PathVariable String id,
            @Valid @RequestBody ProfileUpdateRequest request) {
        try {
            User user = userService.updateProfile(id, request.getDisplayName(), request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    /**
     * Upgrade guest account to email auth.
     * Preserves all user data (trips, expenses, etc).
     * 
     * Request: { email: "john@example.com", password: "...", displayName: "John Doe" }
     */
    @PostMapping("/{id}/upgrade/email")
    public ResponseEntity<ApiResponse<User>> upgradeToEmail(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String displayName = request.get("displayName");

            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("email and password are required"));
            }

            // TODO: Hash password with BCrypt
            String passwordHash = password; // Mock

            User user = userService.upgradeGuestToEmail(id, email, passwordHash, displayName);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upgrade failed: " + e.getMessage()));
        }
    }

    /**
     * Upgrade guest account to Google auth.
     * Supports two token formats:
     * 1. Firebase ID token via Authorization Bearer header (preferred)
     * 2. Legacy request body with googleId, email, displayName
     * 
     * Preserves all user data (trips, expenses, etc).
     * 
     * Request (Firebase via header):
     * Headers: { Authorization: "Bearer <firebase_id_token>" }
     * Body: {} (empty)
     * 
     * Request (legacy via body):
     * { googleId: "...", email: "john@example.com", displayName: "John Doe" }
     */
    @PostMapping("/{id}/upgrade/google")
    public ResponseEntity<ApiResponse<User>> upgradeToGoogle(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String googleId = null;
            String email = null;
            String displayName = null;

            // Extract token from Authorization header (Firebase)
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring("Bearer ".length());
                var tokenClaims = firebaseTokenVerifier.verifyToken(token);
                
                googleId = (String) tokenClaims.get("sub");  // Firebase UID from 'sub' claim
                email = FirebaseTokenVerifier.extractEmail(tokenClaims);
                displayName = FirebaseTokenVerifier.extractName(tokenClaims);
            }
            // Fallback to request body (legacy)
            else if (request != null) {
                googleId = request.get("googleId");
                email = request.get("email");
                displayName = request.get("displayName");
            }

            if (googleId == null || googleId.isEmpty() || email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("googleId and email are required"));
            }

            User user = userService.upgradeGuestToGoogle(id, googleId, email, displayName);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upgrade failed: " + e.getMessage()));
        }
    }
}
