package com.splittrip.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.splittrip.backend.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserService userService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            
            // Session management - CRITICAL for OAuth2
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
            )
            
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/health", "/test/**", "/me", "/api/auth/**", "/auth/**").permitAll()
                // Allow all API endpoints (identification via headers for guest users or session for OAuth)
                .requestMatchers("/trips/**", "/users/**", "/expenses/**", "/join-requests/**").permitAll()
                .anyRequest().authenticated()
            )
            
            .oauth2Login(oauth -> oauth
                .successHandler(customAuthenticationSuccessHandler())
                .failureUrl("http://localhost:3000/?error=auth_failed")
            )
            
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(200);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Logged out successfully\"}");
                })
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
            );

        return http.build();
    }
    
    /**
     * Custom success handler that sets proper cookie attributes for cross-origin sessions
     * and saves OAuth user to database
     */
    @Bean
    public AuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        return (HttpServletRequest request, HttpServletResponse response, Authentication authentication) -> {
            // Save OAuth user to database
            if (authentication.getPrincipal() instanceof OAuth2User) {
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                String googleId = oauth2User.getAttribute("sub");
                String email = oauth2User.getAttribute("email");
                String name = oauth2User.getAttribute("name");
                
                // Create or get user in database
                userService.getOrCreateGoogleUser(googleId, email, name);
            }
            
            // Set session cookie with proper attributes for localhost cross-origin
            Cookie sessionCookie = new Cookie("JSESSIONID", request.getSession().getId());
            sessionCookie.setPath("/");
            sessionCookie.setHttpOnly(true);
            sessionCookie.setSecure(false); // Set to true in production with HTTPS
            sessionCookie.setMaxAge(3600); // 1 hour
            // Note: SameSite=None requires Secure=true, so in localhost we use Lax
            // In production with HTTPS, use: sessionCookie.setAttribute("SameSite", "None");
            
            response.addCookie(sessionCookie);
            response.sendRedirect("http://localhost:3000/dashboard");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow React frontend
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        
        // Allow all common HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow all headers (including custom ones)
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // CRITICAL: Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Expose headers that frontend might need
        config.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie"));
        
        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
