package com.splittrip.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthTestController {

    /**
     * GET /api/auth/status - Quick auth status check
     * 
     * This is a simple endpoint to verify authentication is working.
     * Unlike /me, this shows more detailed debug info.
     */
    @GetMapping("/status")
    public Map<String, Object> getAuthStatus() {
        Map<String, Object> status = new HashMap<>();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null) {
            status.put("authenticated", false);
            status.put("reason", "No authentication in SecurityContext");
            return status;
        }
        
        status.put("authenticated", auth.isAuthenticated());
        status.put("principal", auth.getPrincipal().getClass().getSimpleName());
        status.put("authorities", auth.getAuthorities().toString());
        
        if (auth.getPrincipal() != null) {
            status.put("principalString", auth.getPrincipal().toString().substring(0, 
                Math.min(100, auth.getPrincipal().toString().length())));
        }
        
        return status;
    }

    /**
     * GET /api/auth/test - Test endpoint (always accessible)
     */
    @GetMapping("/test")
    public Map<String, String> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auth test endpoint is working");
        response.put("timestamp", java.time.Instant.now().toString());
        return response;
    }
}
