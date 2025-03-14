package com.casino.coinflip.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class GameRequest {
    @NotNull(message = "Bet amount is required")
    @Min(value = 100, message = "Minimum bet amount is 100")
    private BigDecimal betAmount;

    @NotNull(message = "Choice is required")
    private String choice;
    
    // Getters
    public BigDecimal getBetAmount() {
        return betAmount;
    }
    
    public String getChoice() {
        return choice;
    }
    
    // Setters
    public void setBetAmount(BigDecimal betAmount) {
        this.betAmount = betAmount;
    }
    
    public void setChoice(String choice) {
        this.choice = choice;
    }
}