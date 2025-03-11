package com.casino.coinflip.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WithdrawalRequestDto {
    @NotNull(message = "Amount is required")
    @Min(value = 100, message = "Minimum withdrawal amount is 100")
    private BigDecimal amount;

    @NotBlank(message = "Payment method is required")
    private String method;

    @NotBlank(message = "Payment details are required")
    private String details;
}