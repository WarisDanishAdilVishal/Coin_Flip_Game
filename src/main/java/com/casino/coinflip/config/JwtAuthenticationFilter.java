package com.casino.coinflip.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import com.casino.coinflip.repository.UserRepository;
import com.casino.coinflip.security.CustomUserDetailsService.CustomUserDetails;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Constructor
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        logger.info("JwtFilter processing request to: {}", request.getRequestURI());
        
        final String authHeader = request.getHeader("Authorization");
        logger.info("Auth header present: {}", authHeader != null);
        
        if (authHeader != null) {
            logger.info("Auth header: {}", authHeader.substring(0, Math.min(authHeader.length(), 20)) + "...");
        }

        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No bearer token found in request to {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        logger.debug("JWT token extracted from request");
        
        try {
            username = jwtService.extractUsername(jwt);
            logger.debug("Username extracted from JWT: {}", username);
        } catch (Exception e) {
            logger.error("Error extracting username from JWT: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            logger.debug("User loaded: {}, Authorities: {}", username, userDetails.getAuthorities());
            
            try {
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Create authentication token with the actual User entity if using CustomUserDetails
                    UsernamePasswordAuthenticationToken authToken;
                    
                    if (userDetails instanceof CustomUserDetails) {
                        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
                        // Use the actual User entity as the principal
                        authToken = new UsernamePasswordAuthenticationToken(
                            customUserDetails.getUser(),
                            null,
                            userDetails.getAuthorities()
                        );
                    } else {
                        // Fallback to standard behavior
                        authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );
                    }
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication successful for user: {}", username);
                } else {
                    logger.debug("Invalid JWT token for user: {}", username);
                }
            } catch (Exception e) {
                logger.error("JWT validation error: {}", e.getMessage());
            }
        }

        logger.info("Token validation result: {}", SecurityContextHolder.getContext().getAuthentication() != null);
        logger.info("Authentication context after processing: {}", 
                    SecurityContextHolder.getContext().getAuthentication() != null ? 
                    SecurityContextHolder.getContext().getAuthentication().getName() : "null");
        
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/auth/forgot-password") || 
               path.startsWith("/auth/reset-password") ||
               path.startsWith("/auth/") ||
               path.startsWith("/api/auth/");
    }
}