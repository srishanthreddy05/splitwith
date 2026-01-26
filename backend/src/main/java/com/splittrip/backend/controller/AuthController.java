package com.splittrip.backend.controller;

import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.splittrip.backend.dto.ApiResponse;
import com.splittrip.backend.dto.AuthResponse;
import com.splittrip.backend.dto.GoogleAuthRequest;
import com.splittrip.backend.dto.GoogleCodeAuthRequest;
import com.splittrip.backend.dto.GuestSignupRequest;
import com.splittrip.backend.dto.SendOtpRequest;
import com.splittrip.backend.dto.VerifyOtpRequest;
import com.splittrip.backend.model.User;
import com.splittrip.backend.service.OtpService;
import com.splittrip.backend.service.UserService;
import com.splittrip.backend.utils.GoogleTokenVerifier;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Authentication Controller: Guest signup, Google OAuth, Email+OTP flows.
 * 
 * Endpoints:
 * - POST /auth/guest        - Create guest user
 * - POST /auth/google       - Google OAuth login/signup/upgrade
 * - POST /auth/email/send-otp    - Send OTP to email
 * - POST /auth/email/verify-otp  - Verify OTP and create/login user
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
@Slf4j
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;
    private final GoogleTokenVerifier googleTokenVerifier;

    /**
     * Guest Signup: Create a guest user with display name.
     * Called when user clicks "Continue as Guest".
     * 
     * Request: { displayName: "John Doe" }
     * Response: { success: true, data: { userId, displayName, authProvider } }
     */
    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<AuthResponse>> signupGuest(
            @Valid @RequestBody GuestSignupRequest request) {
        try {
            User user = userService.createGuestUser(request.getDisplayName());
            
            AuthResponse response = AuthResponse.builder()
                    .userId(user.getId())
                    .displayName(user.getDisplayName())
                    .authProvider("GUEST")
                    .isNew(true)
                    .needsDisplayName(false)
                    .nextStep("continue_action")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Guest signup failed", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create guest user: " + e.getMessage()));
        }
    }

    /**
     * Google OAuth: Authenticate with Google ID token.
     * Frontend obtains token via Google SDK, sends here.
     * 
     * Three flows:
     * 1. New Google user → Create user
     * 2. Existing Google user → Login (by email or googleId)
     * 3. Upgrade guest user → Merge guest account to Google auth
     * 
     * Request (flow 1/2):
     * {
     *   "idToken": "<google_id_token>"
     * }
     * 
     * Request (flow 3 - guest upgrade):
     * {
     *   "idToken": "<google_id_token>",
     *   "currentUserId": "<guest_user_id>"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "userId": "...",
     *     "displayName": "...",
     *     "email": "...",
     *     "authProvider": "GOOGLE",
     *     "isNew": true | false,
     *     "needsDisplayName": true | false
     *   }
     * }
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateGoogle(
            @Valid @RequestBody GoogleAuthRequest request) {
        try {
            // Step 1: Verify Google ID token with Google's public keys
            GoogleIdToken.Payload payload = googleTokenVerifier.verifyToken(request.getIdToken());
            
            if (payload == null) {
                log.warn("Google token verification returned null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Google token"));
            }

            // Step 2: Extract user info from verified payload
            GoogleTokenVerifier.GoogleUserInfo googleUserInfo = 
                    GoogleTokenVerifier.extractUserInfo(payload);

            log.info("Google token verified for email: {}", googleUserInfo.getEmail());

            // Step 3: User resolution logic
            User user;
            boolean isNew = false;

            if (request.getCurrentUserId() != null) {
                // GUEST UPGRADE FLOW: Upgrade existing guest to Google
                log.info("Upgrading guest user {} to Google auth", request.getCurrentUserId());
                
                try {
                    user = userService.getUserById(request.getCurrentUserId());
                    
                    if (!user.isGuest()) {
                        // User already has auth provider, don't upgrade
                        log.warn("User {} is not a guest, cannot upgrade", request.getCurrentUserId());
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("User is already authenticated. Please log in instead."));
                    }

                    // Upgrade guest to Google
                    user = userService.upgradeGuestToGoogle(
                            request.getCurrentUserId(),
                            googleUserInfo.getGoogleId(),
                            googleUserInfo.getEmail(),
                            googleUserInfo.getDisplayName()
                    );
                } catch (IllegalArgumentException e) {
                    log.error("Failed to upgrade guest: {}", e.getMessage());
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error(e.getMessage()));
                }
            } else {
                // NEW LOGIN/SIGNUP FLOW
                // First check by email (most reliable)
                try {
                    user = userService.getUserByEmail(googleUserInfo.getEmail());
                    log.info("Google user already exists by email: {}", googleUserInfo.getEmail());
                } catch (IllegalArgumentException e) {
                    // New user: create with Google auth
                    log.info("Creating new Google user: {}", googleUserInfo.getEmail());
                    user = userService.getOrCreateGoogleUser(
                            googleUserInfo.getGoogleId(),
                            googleUserInfo.getEmail(),
                            googleUserInfo.getDisplayName()
                    );
                    isNew = true;
                }
            }

            // Step 4: Prepare response
            boolean needsDisplayName = user.getDisplayName() == null || user.getDisplayName().isEmpty();

            AuthResponse response = AuthResponse.builder()
                    .userId(user.getId())
                    .displayName(user.getDisplayName())
                    .email(user.getEmail())
                    .authProvider("GOOGLE")
                    .isNew(isNew)
                    .needsDisplayName(needsDisplayName)
                    .nextStep(needsDisplayName ? "set_display_name" : "continue_action")
                    .build();

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (IllegalArgumentException e) {
            // Token verification failed
            log.error("Google token verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Google authentication failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Google authentication failed. Please try again."));
        }
    }

    /**
     * Google OAuth (Redirect Flow): Exchange authorization code for user info.
     * 
     * This endpoint handles the redirect-based OAuth flow where:
     * 1. Frontend redirects user to Google OAuth page
     * 2. User authenticates on Google
     * 3. Google redirects back to frontend with authorization code
     * 4. Frontend sends code to this endpoint
     * 5. Backend exchanges code for access token with Google's servers
     * 6. Backend retrieves user info and creates/logs in user
     * 
     * Request:
     * {
     *   "code": "<authorization_code_from_google>",
     *   "redirectUri": "http://localhost:3000/auth/google/callback",
     *   "currentUserId": "<optional_guest_user_id>"
     * }
     * 
     * Response: Same as /auth/google endpoint
     */
    @PostMapping("/google/code")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateGoogleWithCode(
            @Valid @RequestBody GoogleCodeAuthRequest request) {
        try {
            log.info("Processing Google OAuth code exchange");

            // Step 1: Exchange authorization code for user info
            GoogleTokenVerifier.GoogleUserInfo googleUserInfo = 
                    googleTokenVerifier.exchangeCodeForUserInfo(request.getCode(), request.getRedirectUri());

            if (googleUserInfo == null) {
                log.warn("Google code exchange returned null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid authorization code"));
            }

            log.info("Google code exchanged successfully for email: {}", googleUserInfo.getEmail());

            // Step 2: User resolution logic (same as ID token flow)
            User user;
            boolean isNew = false;

            if (request.getCurrentUserId() != null) {
                // GUEST UPGRADE FLOW
                log.info("Upgrading guest user {} to Google auth", request.getCurrentUserId());
                
                try {
                    user = userService.getUserById(request.getCurrentUserId());
                    
                    if (!user.isGuest()) {
                        log.warn("User {} is not a guest, cannot upgrade", request.getCurrentUserId());
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("User is already authenticated. Please log in instead."));
                    }

                    user = userService.upgradeGuestToGoogle(
                            request.getCurrentUserId(),
                            googleUserInfo.getGoogleId(),
                            googleUserInfo.getEmail(),
                            googleUserInfo.getDisplayName()
                    );
                } catch (IllegalArgumentException e) {
                    log.error("Failed to upgrade guest: {}", e.getMessage());
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error(e.getMessage()));
                }
            } else {
                // NEW LOGIN/SIGNUP FLOW
                try {
                    user = userService.getUserByEmail(googleUserInfo.getEmail());
                    log.info("Google user already exists by email: {}", googleUserInfo.getEmail());
                } catch (IllegalArgumentException e) {
                    // New user: create with Google auth
                    log.info("Creating new Google user: {}", googleUserInfo.getEmail());
                    user = userService.getOrCreateGoogleUser(
                            googleUserInfo.getGoogleId(),
                            googleUserInfo.getEmail(),
                            googleUserInfo.getDisplayName()
                    );
                    isNew = true;
                }
            }

            // Step 3: Prepare response
            boolean needsDisplayName = user.getDisplayName() == null || user.getDisplayName().isEmpty();

            AuthResponse response = AuthResponse.builder()
                    .userId(user.getId())
                    .displayName(user.getDisplayName())
                    .email(user.getEmail())
                    .authProvider("GOOGLE")
                    .isNew(isNew)
                    .needsDisplayName(needsDisplayName)
                    .nextStep(needsDisplayName ? "set_display_name" : "continue_action")
                    .build();

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (IllegalArgumentException e) {
            log.error("Google code exchange failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Google authentication with code failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Google authentication failed. Please try again."));
        }
    }


    /**
     * Email+OTP: Step 1 - Send OTP to email.
     * Called when user enters email on login/signup.
     * 
     * TODO: Integrate with Brevo API for real email delivery.
     * For now, OTP is logged to console.
     * 
     * Request: { email: "user@example.com" }
     * Response: { success: true, data: null, message: "OTP sent" }
     */
    @PostMapping("/email/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {
        try {
            otpService.generateAndSendOtp(request.getEmail());
            log.info("OTP sent to: {}", request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Failed to send OTP", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to send OTP: " + e.getMessage()));
        }
    }

    /**
     * Email+OTP: Step 2 - Verify OTP and create/login user.
     * On first signup, also sets password and display name.
     * 
     * Request (first-time signup):
     * {
     *   email: "user@example.com",
     *   otp: "123456",
     *   isSignup: true,
     *   password: "...",
     *   displayName: "John Doe"
     * }
     * 
     * Request (login):
     * {
     *   email: "user@example.com",
     *   otp: "123456",
     *   isSignup: false
     * }
     * 
     * Response: { success: true, data: { userId, displayName, authProvider, isNew } }
     */
    @PostMapping("/email/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        try {
            // Verify OTP
            boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
            if (!isValid) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid or expired OTP"));
            }

            User user;
            boolean isNew = false;

            if (Boolean.TRUE.equals(request.getIsSignup())) {
                // First-time signup: create user with password
                if (request.getPassword() == null || request.getPassword().isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Password is required for signup"));
                }

                user = userService.getOrCreateEmailUser(request.getEmail(), request.getDisplayName());
                
                // Hash password (mock: simple Base64 for now)
                // TODO: Use BCryptPasswordEncoder in production
                String passwordHash = Base64.getEncoder().encodeToString(
                        request.getPassword().getBytes()
                );
                userService.setPasswordHash(user.getId(), passwordHash);
                isNew = true;
            } else {
                // Login: user must exist
                try {
                    user = userService.getUserByEmail(request.getEmail());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Email not registered. Sign up first."));
                }
            }

            AuthResponse response = AuthResponse.builder()
                    .userId(user.getId())
                    .displayName(user.getDisplayName())
                    .email(user.getEmail())
                    .authProvider("EMAIL")
                    .isNew(isNew)
                    .nextStep("continue_action")
                    .build();

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("OTP verification failed", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("OTP verification failed: " + e.getMessage()));
        }
    }
}
