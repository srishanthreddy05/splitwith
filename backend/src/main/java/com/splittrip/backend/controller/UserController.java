package com.splittrip.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splittrip.backend.dto.ApiResponse;
import com.splittrip.backend.dto.CreateGuestUserRequest;
import com.splittrip.backend.dto.CreateUserRequest;
import com.splittrip.backend.model.User;
import com.splittrip.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

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

    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<User>> createGuestUser(@Valid @RequestBody CreateGuestUserRequest request) {
        try {
            User guestUser = userService.createGuestUser(request.getGuestId(), request.getName());
            return ResponseEntity.ok(ApiResponse.success(guestUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<ApiResponse<User>> getUserByGuestId(@PathVariable String guestId) {
        try {
            User user = userService.getUserByGuestId(guestId);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get or create lightweight user identity (UUID + name)
     * This is the primary endpoint for the MVP lightweight identity system
     * POST body: { "userId": "uuid", "userName": "name" }
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
}
