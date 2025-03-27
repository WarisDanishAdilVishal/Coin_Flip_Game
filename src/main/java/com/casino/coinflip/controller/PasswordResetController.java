package com.casino.coinflip.controller;

import com.casino.coinflip.service.PasswordResetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/password")
public class PasswordResetController {
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);
    
    private final PasswordResetService passwordResetService;
    
    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }
    
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        logger.info("Received forgot password request");
        
        // Initiate password reset process
        passwordResetService.initiatePasswordReset(request.getEmail());
        
        // Always return success to prevent email enumeration
        return ResponseEntity.ok(Map.of(
            "message", "If your email is registered, you will receive a password reset link shortly."
        ));
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        logger.info("Validating token: {}", token);
        
        boolean isValid = passwordResetService.validateToken(token);
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "message", "Invalid or expired token"
            ));
        }
    }
    
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("Received reset password request");
        
        boolean success = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "message", "Password has been reset successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid or expired token"
            ));
        }
    }
    
    // Request DTOs
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        // Getters and setters
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
    }
    
    public static class ResetPasswordRequest {
        @NotBlank(message = "Token is required")
        private String token;
        
        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
        
        // Getters and setters
        public String getToken() {
            return token;
        }
        
        public void setToken(String token) {
            this.token = token;
        }
        
        public String getNewPassword() {
            return newPassword;
        }
        
        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
} 