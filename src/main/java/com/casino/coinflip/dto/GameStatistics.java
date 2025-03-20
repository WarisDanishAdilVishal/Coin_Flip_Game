package com.casino.coinflip.dto;

public class GameStatistics {
    private Long totalGames;
    private Double totalBetAmount;
    private Double totalPayoutAmount;
    private Double houseProfit;
    
    // Getters, setters, and constructors
    public GameStatistics(Long totalGames, Double totalBetAmount, Double totalPayoutAmount) {
        this.totalGames = totalGames;
        this.totalBetAmount = totalBetAmount;
        this.totalPayoutAmount = totalPayoutAmount;
        this.houseProfit = totalBetAmount - totalPayoutAmount;
    }
}
