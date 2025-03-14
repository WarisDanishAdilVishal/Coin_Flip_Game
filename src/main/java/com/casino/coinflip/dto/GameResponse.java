package com.casino.coinflip.dto;

import com.casino.coinflip.entity.Game;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class GameResponse {
    private Long id;
    private String username;
    private BigDecimal betAmount;
    private String choice;
    private String outcome;
    private Boolean won;
    private LocalDateTime playedAt;
    private BigDecimal winAmount;
    private String gameType = "Coin Flip";

    public GameResponse() {
    }

    public GameResponse(Game game) {
        this.id = game.getId();
        this.username = game.getUser().getUsername();
        this.betAmount = game.getBetAmount();
        this.choice = game.getChoice();
        this.outcome = game.getOutcome();
        this.won = game.getWon();
        this.playedAt = game.getPlayedAt();
        
        // Calculate win amount (for frontend display)
        this.winAmount = game.getWon() ? game.getBetAmount() : BigDecimal.ZERO;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public BigDecimal getBetAmount() {
        return betAmount;
    }

    public void setBetAmount(BigDecimal betAmount) {
        this.betAmount = betAmount;
    }

    public String getChoice() {
        return choice;
    }

    public void setChoice(String choice) {
        this.choice = choice;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public Boolean getWon() {
        return won;
    }

    public void setWon(Boolean won) {
        this.won = won;
    }

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }

    public BigDecimal getWinAmount() {
        return winAmount;
    }

    public void setWinAmount(BigDecimal winAmount) {
        this.winAmount = winAmount;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }
} 