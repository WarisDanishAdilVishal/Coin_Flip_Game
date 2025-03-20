package com.casino.coinflip.dto;

import com.casino.coinflip.entity.Transaction;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class TransactionDto {
    private String id;
    private String userId;
    private String username;
    private String type;
    private double amount;
    private String status;
    private String timestamp;
    private String details;

    public TransactionDto(Transaction transaction) {
        this.id = transaction.getId().toString();
        this.userId = transaction.getUser().getId().toString();
        this.username = transaction.getUser().getUsername();
        this.type = transaction.getType().name().toLowerCase();
        this.amount = transaction.getAmount().doubleValue();
        this.status = transaction.getStatus().name().toLowerCase();
        this.timestamp = transaction.getTimestamp().format(DateTimeFormatter.ISO_DATE_TIME);
        this.details = transaction.getDetails();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
} 