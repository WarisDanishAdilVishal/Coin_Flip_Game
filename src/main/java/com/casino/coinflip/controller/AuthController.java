package com.casino.coinflip.controller;

import com.casino.coinflip.dto.AuthRequest;
import com.casino.coinflip.dto.RegisterRequest;
import com.casino.coinflip.dto.AuthResponse;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.service.UserService;
import com.casino.coinflip.config.JwtService;
import com.casino.coinflip.security.CustomUserDetailsService;
import com.casino.coinflip.service.EmailService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final EmailService emailService;
    
    // Constructor
    public AuthController(AuthenticationManager authenticationManager, UserService userService, 
                         JwtService jwtService, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            logger.info("Register request received for username: {}", request.getUsername());
            
            // Validate email format
            if (!isValidEmail(request.getEmail())) {
                logger.error("Invalid email format: {}", request.getEmail());
                return ResponseEntity.badRequest().body(Map.of("error", "Please enter a valid email address"));
            }
            
            User user = userService.createUser(request.getUsername(), request.getPassword(), request.getEmail());
            UserDetails userDetails = CustomUserDetailsService.createUserDetails(user);
            String token = jwtService.generateToken(userDetails);
            String primaryRole = user.getRoles().stream().findFirst().orElse("ROLE_USER");
            
            // Send welcome email (now mandatory)
            try {
                emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
                logger.info("Welcome email sent successfully to: {}", user.getEmail());
            } catch (Exception e) {
                logger.error("Failed to send welcome email: {}", e.getMessage());
                // We might want to consider rolling back the registration if email fails
                // For now, we'll continue but log the error
            }
            
            logger.info("User registered successfully: {}", request.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), primaryRole, new ArrayList<>(user.getRoles())));
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            logger.info("Login attempt for username: {}", request.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            logger.info("Authentication successful for user: {}", userDetails.getUsername());
            logger.info("User authorities: {}", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
            
            User user = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String token = jwtService.generateToken(userDetails);
            String primaryRole = user.getRoles().stream().findFirst().orElse("ROLE_USER");
            
            logger.info("JWT token generated successfully for user: {}", userDetails.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), primaryRole, new ArrayList<>(user.getRoles())));
        } catch (BadCredentialsException e) {
            logger.error("Bad credentials: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (UsernameNotFoundException e) {
            logger.error("Username not found: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (AuthenticationException e) {
            logger.error("Authentication error: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            logger.info("Processing forgot password request for email: {}", email);
            userService.initiatePasswordReset(email);
            
            return ResponseEntity.ok(Map.of("message", "Password reset instructions have been sent to your email."));
        } catch (RuntimeException e) {
            logger.error("Forgot password error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during password reset: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("message", "If an account exists with this email, a password reset link will be sent."));
        }
    }

    @GetMapping("/reset-password/validate")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            logger.info("Validating reset token");
            boolean isValid = userService.validateResetToken(token);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            logger.error("Token validation error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required"));
            }

            logger.info("Processing password reset");
            userService.resetPassword(token, newPassword);
            
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        } catch (Exception e) {
            logger.error("Password reset error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to reset password: " + e.getMessage()));
        }
    }
}