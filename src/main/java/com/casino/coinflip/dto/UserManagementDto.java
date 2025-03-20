package com.casino.coinflip.dto;

import com.casino.coinflip.entity.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class UserManagementDto {
    private Long id;
    private String username;
    private BigDecimal balance;
    private String status;
    private String createdAt;
    private UserStatsDto stats;

    public UserManagementDto(User user, Long totalGames, BigDecimal profitLoss) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.balance = user.getBalance();
        this.status = user.getStatus().toString().toLowerCase();
        this.createdAt = formatDateTime(user.getCreatedAt());
        this.stats = new UserStatsDto(totalGames, profitLoss, user.getLastActive());
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? 
            dateTime.format(DateTimeFormatter.ISO_DATE_TIME) : null;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getStatus() {
        return status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public UserStatsDto getStats() {
        return stats;
    }

    public static class UserStatsDto {
        private Long totalGames;
        private BigDecimal profitLoss;
        private String lastActive;

        public UserStatsDto(Long totalGames, BigDecimal profitLoss, LocalDateTime lastActive) {
            this.totalGames = totalGames != null ? totalGames : 0L;
            this.profitLoss = profitLoss != null ? profitLoss : BigDecimal.ZERO;
            this.lastActive = lastActive != null ? 
                lastActive.format(DateTimeFormatter.ISO_DATE_TIME) : null;
        }

        public Long getTotalGames() {
            return totalGames;
        }

        public BigDecimal getProfitLoss() {
            return profitLoss;
        }

        public String getLastActive() {
            return lastActive;
        }
    }
} 