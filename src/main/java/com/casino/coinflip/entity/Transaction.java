package com.casino.coinflip.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    private String details;
    
    // Payment method for deposits and withdrawals (e.g., UPI, Bank Transfer)
    private String paymentMethod;

    public enum TransactionType {
        DEPOSIT, WITHDRAWAL, GAME
    }

    public enum TransactionStatus {
        PENDING, COMPLETED, FAILED
    }
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public User getUser() {
        return user;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public TransactionType getType() {
        return type;
    }
    
    public TransactionStatus getStatus() {
        return status;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public String getDetails() {
        return details;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public void setType(TransactionType type) {
        this.type = type;
    }
    
    public void setStatus(TransactionStatus status) {
        this.status = status;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}