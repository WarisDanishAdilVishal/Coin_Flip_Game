package com.casino.coinflip.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String role;
    
    // Constructor
    public AuthResponse(String token, String username, String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }
    
    // Getters
    public String getToken() {
        return token;
    }
    
    public String getUsername() {
        return username;
    }
    
    public String getRole() {
        return role;
    }
    
    // Setters
    public void setToken(String token) {
        this.token = token;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
}