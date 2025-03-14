package com.casino.coinflip.controller;

import com.casino.coinflip.dto.UserProfileResponse;
import com.casino.coinflip.entity.Game;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.service.GameService;
import com.casino.coinflip.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    
    private final GameService gameService;
    private final UserService userService;
    
    public UserController(GameService gameService, UserService userService) {
        this.gameService = gameService;
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Use the simple constructor for basic profile information
        UserProfileResponse response = new UserProfileResponse(
            user.getUsername(),
            user.getBalance(),
            user.getRoles().stream().findFirst().orElse("ROLE_USER"),
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
            
            // Create detailed response
            UserProfileResponse detailedResponse = new UserProfileResponse(
                user.getUsername(),
                user.getBalance(),
                user.getRoles().stream().findFirst().orElse("ROLE_USER"),
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
} 