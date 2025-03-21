package com.casino.coinflip.dto;

import com.casino.coinflip.entity.WithdrawalRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WithdrawalRequestDto {
    private Long id;
    private String username;
    private BigDecimal amount;
    private WithdrawalRequest.PaymentMethod method;
    private String details;
    private WithdrawalRequest.WithdrawalStatus status;
    private LocalDateTime timestamp;

    // Default constructor for Jackson
    public WithdrawalRequestDto() {}

    public WithdrawalRequestDto(WithdrawalRequest request) {
        this.id = request.getId();
        this.username = request.getUser().getUsername();
        this.amount = request.getAmount();
        this.method = request.getMethod();
        this.details = request.getDetails();
        this.status = request.getStatus();
        this.timestamp = request.getTimestamp();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public WithdrawalRequest.PaymentMethod getMethod() {
        return method;
    }

    public String getDetails() {
        return details;
    }

    public WithdrawalRequest.WithdrawalStatus getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // Setters for Jackson
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setMethod(WithdrawalRequest.PaymentMethod method) {
        this.method = method;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public void setStatus(WithdrawalRequest.WithdrawalStatus status) {
        this.status = status;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}