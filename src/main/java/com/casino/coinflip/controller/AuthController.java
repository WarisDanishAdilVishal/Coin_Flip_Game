package com.casino.coinflip.controller;

import com.casino.coinflip.dto.AuthRequest;
import com.casino.coinflip.dto.AuthResponse;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.service.UserService;
import com.casino.coinflip.config.JwtService;
import com.casino.coinflip.security.CustomUserDetailsService;
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
    
    // Constructor
    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        try {
            logger.info("Register request received for username: {}", request.getUsername());
            
            User user = userService.createUser(request.getUsername(), request.getPassword());
            UserDetails userDetails = CustomUserDetailsService.createUserDetails(user);
            String token = jwtService.generateToken(userDetails);
            String primaryRole = user.getRoles().stream().findFirst().orElse("ROLE_USER");
            
            logger.info("User registered successfully: {}", request.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), primaryRole, new ArrayList<>(user.getRoles())));
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
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
}