package com.splittrip.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

/**
 * Spring Security Configuration
 * 
 * IMPORTANT MIGRATION NOTE (Firebase Authentication):
 * - OAuth2 client configuration is DEPRECATED and no longer used
 * - Firebase Admin SDK now handles all authentication
 * - This configuration is kept for backward compatibility only
 * 
 * Frontend authenticates directly with Firebase and sends Bearer tokens
 * to backend endpoints. Backend verifies tokens using Firebase Admin SDK.
 * 
 * Old flow (deprecated):
 * 1. Frontend → /oauth2/authorization/google
 * 2. Backend handles OAuth2 flow
 * 3. Backend creates session
 * 
 * New flow (Firebase):
 * 1. Frontend uses Firebase SDK to sign in
 * 2. Frontend sends Bearer token to backend
 * 3. Backend verifies token, creates MongoDB user record
 * 4. Backend returns user data (no session needed)
 * 
 * To fully remove OAuth2:
 * 1. Remove spring-boot-starter-oauth2-client from pom.xml
 * 2. Remove .oauth2Login() configuration from this file
 * 3. Update application.properties to remove OAuth2 settings
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS for cross-origin requests from React frontend (localhost:3000)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF for stateless REST API (OAuth2 uses PKCE for security)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Disable HTTP Basic and form login - we only use OAuth2
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            
            // Session management for OAuth2 - create session only when needed (after OAuth login)
            // CRITICAL: OAuth2 requires session to store authentication state during redirect flow
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1) // Limit to 1 concurrent session per user
            )
            
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - no authentication required
                .requestMatchers("/health", "/test/**", "/me", "/favicon.ico").permitAll()
                
                // CRITICAL: Allow Spring Security's OAuth2 endpoints for Google login flow
                // /oauth2/authorization/google - initiates OAuth2 flow (redirects to Google)
                // /login/oauth2/code/google - callback URL where Google sends authorization code
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                
                // Public API endpoints for guest users and OAuth authenticated users
                .requestMatchers("/api/auth/**", "/auth/**").permitAll()
                .requestMatchers("/trips/**", "/users/**", "/expenses/**", "/join-requests/**").permitAll()
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            
            // Stateless session management for Firebase Bearer token authentication
            // No session cookies needed - tokens are sent in Authorization header
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }
    
    /**
     * CORS configuration for cross-origin requests
     * 
     * Required because frontend (localhost:3000) makes requests to backend (localhost:9090)
     * 
     * Key settings:
     * - allowCredentials: true → allows cookies (JSESSIONID) to be sent cross-origin
     * - allowedOrigins: localhost:3000 → only frontend can make requests
     * - allowedMethods: all standard HTTP methods
     * - allowedHeaders: * → allow all request headers (including custom ones)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow React frontend origin
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        
        // Allow all standard HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow all headers (including custom identification headers for guest users)
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // CRITICAL: Enable credentials (cookies like JSESSIONID) to be sent cross-origin
        // Without this, browser blocks session cookie on API requests from frontend
        config.setAllowCredentials(true);
        
        // Expose headers that frontend JavaScript can read
        config.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie"));
        
        // Cache preflight OPTIONS requests for 1 hour (reduces network overhead)
        config.setMaxAge(3600L);

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
