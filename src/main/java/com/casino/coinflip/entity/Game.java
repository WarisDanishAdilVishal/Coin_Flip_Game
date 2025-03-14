package com.casino.coinflip.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "games")
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal betAmount;

    @Column(nullable = false)
    private String choice;

    @Column(nullable = false)
    private String outcome;

    @Column(nullable = false)
    private Boolean won;

    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt = LocalDateTime.now();
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public User getUser() {
        return user;
    }
    
    public BigDecimal getBetAmount() {
        return betAmount;
    }
    
    public String getChoice() {
        return choice;
    }
    
    public String getOutcome() {
        return outcome;
    }
    
    public Boolean getWon() {
        return won;
    }
    
    public LocalDateTime getPlayedAt() {
        return playedAt;
    }
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public void setBetAmount(BigDecimal betAmount) {
        this.betAmount = betAmount;
    }
    
    public void setChoice(String choice) {
        this.choice = choice;
    }
    
    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }
    
    public void setWon(Boolean won) {
        this.won = won;
    }
    
    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }
}