package com.casino.coinflip.service;

import com.casino.coinflip.entity.Game;
import com.casino.coinflip.entity.Transaction;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.GameRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class GameService {
    private final GameRepository gameRepository;
    private final UserService userService;
    private final TransactionService transactionService;
    private final Random random = new Random();
    
    // Constructor
    public GameService(GameRepository gameRepository, UserService userService, TransactionService transactionService) {
        this.gameRepository = gameRepository;
        this.userService = userService;
        this.transactionService = transactionService;
    }

    @Transactional
    public Game playGame(User user, BigDecimal betAmount, String choice) {
        if (user.getBalance().compareTo(betAmount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // Determine outcome
        String outcome = random.nextBoolean() ? "heads" : "tails";
        boolean won = choice.equalsIgnoreCase(outcome);
        BigDecimal winAmount = won ? betAmount : betAmount.negate();

        // Update user balance
        userService.updateBalance(user, winAmount);

        // Create game record
        Game game = new Game();
        game.setUser(user);
        game.setBetAmount(betAmount);
        game.setChoice(choice);
        game.setOutcome(outcome);
        game.setWon(won);
        game.setPlayedAt(LocalDateTime.now());
        game = gameRepository.save(game);

        // Create transaction record
        transactionService.createGameTransaction(user, betAmount, won);

        return game;
    }

    public List<Game> getGameHistory(Long userId) {
        // Get games from repository 
        List<Game> games = gameRepository.findByUserIdOrderByPlayedAtDesc(userId);
        
        // Initialize lazy-loaded User entities
        games.forEach(game -> {
            try {
                // Access the username to initialize the User entity
                game.getUser().getUsername();
            } catch (Exception e) {
                // Log any issues but continue processing
                System.err.println("Error initializing user for game " + game.getId() + ": " + e.getMessage());
            }
        });
        
        return games;
    }
}