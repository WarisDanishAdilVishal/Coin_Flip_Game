package com.casino.coinflip.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.reset-password.url}")
    private String resetPasswordUrl;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    public void sendPasswordResetEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Reset Your Stake Paradise Password");
            
            String resetLink = resetPasswordUrl + "?token=" + token;
            
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { text-align: center; padding: 20px 0; }
                        .logo { font-size: 24px; font-weight: bold; color: #ff0080; }
                        .content { background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .button { display: inline-block; padding: 12px 24px; background-color: #ff0080; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666666; }
                        .warning { color: #666666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body style="background-color: #f4f4f4; margin: 0; padding: 20px;">
                    <div class="container">
                        <div class="header">
                            <div class="logo">💰 Coin Flip Game</div>
                        </div>
                        <div class="content">
                            <h2>Password Reset Request</h2>
                            <p>Hello,</p>
                            <p>We received a request to reset your password for your Stake Paradise account. To proceed with the password reset, click the button below:</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button" style="color: #ffffff;">Reset Password</a>
                            </div>
                            <p class="warning">⚠️ This link will expire in 1 hour for security reasons.</p>
                            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                            <p>Best regards,<br>The Stake Paradise Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; 2025 Stake Paradise. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(resetLink);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Password reset email sent to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    public void sendWelcomeEmail(String to, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Welcome to Stake Paradise!🎮");
            
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { text-align: center; padding: 20px 0; }
                        .logo { font-size: 24px; font-weight: bold; color: #ff0080; }
                        .content { background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .welcome-image { width: 100%%; max-width: 300px; margin: 20px auto; display: block; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666666; }
                    </style>
                </head>
                <body style="background-color: #f4f4f4; margin: 0; padding: 20px;">
                    <div class="container">
                        <div class="header">
                            <div class="logo">💰 Coin Flip Game</div>
                        </div>
                        <div class="content">
                            <h2>Welcome to Stake Paradise! 🎉</h2>
                            <p>Hi %s,</p>
                            <p>We're thrilled to have you join our gaming community! Your account has been successfully created.</p>
                            <p>Get ready to experience the excitement of coin flipping and win big!</p>
                            <p>Here's what you can do now:</p>
                            <ul>
                                <li>Play exciting coin flip games</li>
                                <li>Track your wins and losses</li>
                                <li>Compete with other players</li>
                                <li>Win amazing rewards</li>
                            </ul>
                            <p>If you have any questions or need assistance, our support team is here to help.</p>
                            <p>Best regards,<br>The Stake Paradise Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; 2025 Stake Paradise. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(username);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Welcome email sent to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send welcome email: {}", e.getMessage());
            // Don't throw exception for welcome emails as they are not critical
        }
    }
} 