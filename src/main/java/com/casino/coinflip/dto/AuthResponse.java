package com.casino.coinflip.dto;

import java.util.List;

public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private List<String> roles;
    
    // Constructor
    public AuthResponse(String token, String username, String role, List<String> roles) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.roles = roles;
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

    public List<String> getRoles() {
        return roles;
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

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}