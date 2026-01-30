package com.splittrip.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * ✅ Google / Firebase popup compatibility
     * ❌ NO CORS LOGIC HERE
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(
                    HttpServletRequest request,
                    HttpServletResponse response,
                    Object handler
            ) {

                // 🔥 REQUIRED for Google OAuth popup
                response.setHeader(
                        "Cross-Origin-Opener-Policy",
                        "same-origin-allow-popups"
                );

                // ❌ DO NOT enable COEP (breaks Google login)
                // response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

                return true;
            }
        }).addPathPatterns("/**");
    }
}
