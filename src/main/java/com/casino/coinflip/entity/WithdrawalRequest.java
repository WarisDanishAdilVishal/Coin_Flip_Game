package com.casino.coinflip.entity;

import com.casino.coinflip.config.PaymentMethodDeserializer;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.deser.std.StringDeserializer;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal_requests")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WithdrawalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "role"}) // Exclude sensitive user data
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JsonDeserialize(using = PaymentMethodDeserializer.class)
    private PaymentMethod method;

    @Column(nullable = false)
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WithdrawalStatus status = WithdrawalStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum PaymentMethod {
        UPI
    }

    public enum WithdrawalStatus {
        PENDING, APPROVED, REJECTED
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
    
    public PaymentMethod getMethod() {
        return method;
    }
    
    public String getDetails() {
        return details;
    }
    
    public WithdrawalStatus getStatus() {
        return status;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
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
    
    public void setMethod(PaymentMethod method) {
        this.method = method;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public void setStatus(WithdrawalStatus status) {
        this.status = status;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}