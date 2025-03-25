package com.casino.coinflip.controller;

import com.casino.coinflip.dto.UserProfileResponse;
import com.casino.coinflip.entity.Game;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.service.GameService;
import com.casino.coinflip.service.UserService;
import com.casino.coinflip.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    
    private final GameService gameService;
    private final UserService userService;
    private final TransactionService transactionService;
    
    public UserController(GameService gameService, UserService userService, TransactionService transactionService) {
        this.gameService = gameService;
        this.userService = userService;
        this.transactionService = transactionService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        
        String primaryRole = user.getRoles().stream().findFirst().orElse("ROLE_USER");
        
        // Use the simple constructor for basic profile information
        UserProfileResponse response = new UserProfileResponse(
            user.getUsername(),
            user.getBalance(),
            primaryRole,
            new ArrayList<>(user.getRoles()),
            user.getId(),
            user.getCreatedAt()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/profile/detailed")
    public ResponseEntity<UserProfileResponse> getDetailedUserProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            System.err.println("Error: User is null in detailed profile request");
            return ResponseEntity.badRequest().build();
        }
        
        System.out.println("Fetching detailed profile for user: " + user.getUsername() + " (ID: " + user.getId() + ")");
        
        try {
            // Get user's game history
            List<Game> gameHistory = gameService.getGameHistory(user.getId());
            System.out.println("Found " + gameHistory.size() + " games for user " + user.getUsername());
            
            // Calculate statistics
            int totalGames = gameHistory.size();
            int gamesWon = 0;
            int gamesLost = 0;
            BigDecimal lifetimeEarnings = BigDecimal.ZERO;
            BigDecimal highestWin = BigDecimal.ZERO;
            
            for (Game game : gameHistory) {
                if (game.getWon()) {
                    gamesWon++;
                    // In a real game, there would be a winAmount field
                    // Using betAmount as winnings for this example
                    BigDecimal winAmount = game.getBetAmount();
                    lifetimeEarnings = lifetimeEarnings.add(winAmount);
                    if (winAmount.compareTo(highestWin) > 0) {
                        highestWin = winAmount;
                    }
                } else {
                    gamesLost++;
                    lifetimeEarnings = lifetimeEarnings.subtract(game.getBetAmount());
                }
            }
            
            System.out.println("User stats - Total games: " + totalGames + 
                               ", Won: " + gamesWon + 
                               ", Lost: " + gamesLost + 
                               ", Earnings: " + lifetimeEarnings + 
                               ", Highest win: " + highestWin);
            
            String primaryRole = user.getRoles().stream().findFirst().orElse("ROLE_USER");
            
            // Create detailed response
            UserProfileResponse detailedResponse = new UserProfileResponse(
                user.getUsername(),
                user.getBalance(),
                primaryRole,
                new ArrayList<>(user.getRoles()),
                user.getId(),
                user.getCreatedAt(),
                user.getUsername() + "@example.com", // Placeholder email (you might want to add email to User entity)
                totalGames,
                gamesWon,
                gamesLost,
                lifetimeEarnings,
                highestWin,
                user.getStatus().toString(),
                user.getLastActive()
            );
            
            return ResponseEntity.ok(detailedResponse);
        } catch (Exception e) {
            System.err.println("Error fetching detailed profile for user " + user.getUsername() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> createDeposit(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> depositRequest) {
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        try {
            // Extract deposit amount from request
            BigDecimal amount;
            try {
                amount = new BigDecimal(depositRequest.get("amount").toString());
                if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Deposit amount must be greater than zero"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid deposit amount"));
            }
            
            // Create deposit transaction
            transactionService.createDepositTransaction(user, amount, "Online", "Online deposit from game page");
            
            // Update user balance
            userService.updateBalance(user, amount);
            
            // Return updated user profile
            UserProfileResponse response = new UserProfileResponse(
                user.getUsername(),
                user.getBalance(),
                user.getRoles().stream().findFirst().orElse("ROLE_USER"),
                user.getId(),
                user.getCreatedAt()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error processing deposit: " + e.getMessage()));
        }
    }
} 