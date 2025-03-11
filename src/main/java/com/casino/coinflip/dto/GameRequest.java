package com.casino.coinflip.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class GameRequest {
    @NotNull(message = "Bet amount is required")
    @Min(value = 100, message = "Minimum bet amount is 100")
    private BigDecimal betAmount;

    @NotNull(message = "Choice is required")
    private String choice;
}