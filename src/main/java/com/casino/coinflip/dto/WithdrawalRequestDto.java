package com.casino.coinflip.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WithdrawalRequestDto {
    @NotNull(message = "Amount is required")
    @Min(value = 100, message = "Minimum withdrawal amount is 100")
    private BigDecimal amount;

    @NotBlank(message = "Payment method is required")
    private String method;

    @NotBlank(message = "Payment details are required")
    private String details;
    
    // Getters
    public BigDecimal getAmount() {
        return amount;
    }
    
    public String getMethod() {
        return method;
    }
    
    public String getDetails() {
        return details;
    }
    
    // Setters
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public void setMethod(String method) {
        this.method = method;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
}