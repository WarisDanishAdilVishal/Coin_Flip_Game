package com.casino.coinflip.repository;

import com.casino.coinflip.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByUserIdOrderByPlayedAtDesc(Long userId);
    
    @Query("SELECT g.betAmount as amount, COUNT(g) as count, SUM(CASE WHEN g.won = true THEN g.betAmount ELSE 0 END) as totalWon " +
           "FROM Game g GROUP BY g.betAmount")
    List<GameStats> getGameStatistics();
    
    interface GameStats {
        BigDecimal getAmount();
        Long getCount();
        BigDecimal getTotalWon();
    }
}