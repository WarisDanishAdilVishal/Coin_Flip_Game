package com.casino.coinflip.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UserProfileResponse {
    private String username;
    private BigDecimal balance;
    private String role;
    private Long id;
    private LocalDateTime createdAt;
    // Added new fields for detailed profile
    private String email;
    private int totalGames;
    private int gamesWon;
    private int gamesLost;
    private BigDecimal lifetimeEarnings;
    private BigDecimal highestWin;
    private String status;
    private LocalDateTime lastActive;

    // Default constructor for serialization
    public UserProfileResponse() {
    }

    // Constructor with all fields
    public UserProfileResponse(String username, BigDecimal balance, String role, Long id, LocalDateTime createdAt) {
        this.username = username;
        this.balance = balance;
        this.role = role;
        this.id = id;
        this.createdAt = createdAt;
    }

    // Extended constructor with all additional fields
    public UserProfileResponse(
            String username, 
            BigDecimal balance, 
            String role, 
            Long id, 
            LocalDateTime createdAt,
            String email,
            int totalGames,
            int gamesWon,
            int gamesLost,
            BigDecimal lifetimeEarnings,
            BigDecimal highestWin,
            String status,
            LocalDateTime lastActive) {
        this.username = username;
        this.balance = balance;
        this.role = role;
        this.id = id;
        this.createdAt = createdAt;
        this.email = email;
        this.totalGames = totalGames;
        this.gamesWon = gamesWon;
        this.gamesLost = gamesLost;
        this.lifetimeEarnings = lifetimeEarnings;
        this.highestWin = highestWin;
        this.status = status;
        this.lastActive = lastActive;
    }

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // New getters and setters for additional fields
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getTotalGames() {
        return totalGames;
    }

    public void setTotalGames(int totalGames) {
        this.totalGames = totalGames;
    }

    public int getGamesWon() {
        return gamesWon;
    }

    public void setGamesWon(int gamesWon) {
        this.gamesWon = gamesWon;
    }

    public int getGamesLost() {
        return gamesLost;
    }

    public void setGamesLost(int gamesLost) {
        this.gamesLost = gamesLost;
    }

    public BigDecimal getLifetimeEarnings() {
        return lifetimeEarnings;
    }

    public void setLifetimeEarnings(BigDecimal lifetimeEarnings) {
        this.lifetimeEarnings = lifetimeEarnings;
    }

    public BigDecimal getHighestWin() {
        return highestWin;
    }

    public void setHighestWin(BigDecimal highestWin) {
        this.highestWin = highestWin;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastActive() {
        return lastActive;
    }

    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }
} 