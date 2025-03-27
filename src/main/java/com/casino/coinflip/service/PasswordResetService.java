package com.casino.coinflip.service;

import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.reset-password.token-expiration}")
    private long tokenExpirationMs;

    public PasswordResetService(UserRepository userRepository, 
                              EmailService emailService,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void initiatePasswordReset(String email) {
        logger.info("Initiating password reset for email: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            logger.warn("Password reset requested for non-existent email: {}", email);
            // Don't reveal that the email doesn't exist
            return;
        }
        
        User user = userOpt.get();
        
        // Check if user is active
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            logger.warn("Password reset requested for non-active user: {}", email);
            // Don't reveal that the account is not active
            return;
        }
        
        // Generate reset token
        String token = generateToken();
        
        // Set expiry time (1 hour from now)
        LocalDateTime expiryTime = LocalDateTime.now().plusNanos(tokenExpirationMs * 1000000);
        
        // Save token to user
        user.setResetToken(token);
        user.setResetTokenExpiry(expiryTime);
        userRepository.save(user);
        
        // Send email with reset link
        emailService.sendPasswordResetEmail(email, token);
        
        logger.info("Password reset link sent to: {}", email);
    }
    
    @Transactional
    public boolean validateToken(String token) {
        logger.info("Validating reset token: {}", token);
        
        Optional<User> userOpt = userRepository.findByResetToken(token);
        
        if (userOpt.isEmpty()) {
            logger.warn("Invalid reset token: {}", token);
            return false;
        }
        
        User user = userOpt.get();
        
        // Check if token has expired
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            logger.warn("Expired reset token: {}", token);
            // Clean up expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            return false;
        }
        
        return true;
    }
    
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        logger.info("Resetting password with token: {}", token);
        
        if (!validateToken(token)) {
            return false;
        }
        
        Optional<User> userOpt = userRepository.findByResetToken(token);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Clear reset token
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        userRepository.save(user);
        
        logger.info("Password reset successfully for user: {}", user.getUsername());
        
        return true;
    }
    
    private String generateToken() {
        return UUID.randomUUID().toString();
    }
} 