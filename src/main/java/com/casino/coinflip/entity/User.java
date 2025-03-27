package com.casino.coinflip.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;
    
    @Column(unique = true)
    private String email;
    
    @Column(name = "reset_token")
    private String resetToken;
    
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    public enum UserStatus {
        ACTIVE, SUSPENDED, BLOCKED
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getResetToken() {
        return resetToken;
    }
    
    public LocalDateTime getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastActive() {
        return lastActive;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public UserStatus getStatus() {
        return status;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }
}