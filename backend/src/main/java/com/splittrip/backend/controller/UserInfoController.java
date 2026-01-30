package com.splittrip.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class UserInfoController {

    /**
     * GET /me - Returns current authenticated user info
     * 
     * Response (when authenticated):
     * {
     *   "authenticated": true,
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "id": "google-sub-id"
     * }
     * 
     * Response (when not authenticated):
     * {
     *   "authenticated": false
     * }
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Map<String, Object> response = new HashMap<>();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // Check if user is authenticated (not anonymous)
        if (auth == null || !auth.isAuthenticated() || 
            auth.getPrincipal().equals("anonymousUser")) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        response.put("authenticated", true);
        response.put("name", auth.getName());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /logout - Logout endpoint
     * Spring Security's logout filter handles /logout by default
     */
    @GetMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
