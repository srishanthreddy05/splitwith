package com.splittrip.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ✅ Use global CorsConfig
            .cors(Customizer.withDefaults())

            // ❌ Disable Spring auth completely
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)

            // ✅ Firebase = stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ✅ Firebase-only auth (permit all for now)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/health",
                        "/favicon.ico",
                        "/auth/**",
                        "/api/auth/**"
                ).permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
