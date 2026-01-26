package com.splittrip.backend.config;

import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filter to set Cross-Origin-Opener-Policy headers for Google OAuth popup support.
 * 
 * COOP headers allow the OAuth popup window to communicate with the parent window.
 * This is essential for Google OAuth authentication to work properly.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CoopHeaderFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // No initialization needed
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Set COOP header to allow popups to communicate with parent
        // Use "same-origin" for full popup communication compatibility with Google OAuth
        httpResponse.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        // Removed COEP header as it was too strict and blocked popup communication
        
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // Cleanup not needed
    }
}
