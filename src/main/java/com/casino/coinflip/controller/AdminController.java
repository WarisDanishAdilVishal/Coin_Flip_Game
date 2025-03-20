package com.casino.coinflip.controller;

//import com.casino.coinflip.dto.GameRequest;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.GameRepository;
import com.casino.coinflip.repository.GameRepository.GameStats;
import com.casino.coinflip.service.UserService;
import com.casino.coinflip.service.WithdrawalService;
import com.casino.coinflip.dto.TransactionDto;
import com.casino.coinflip.dto.UserManagementDto;
import com.casino.coinflip.entity.Transaction;

//import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {
    private final GameRepository gameRepository;
    private final UserService userService;
    private final WithdrawalService withdrawalService;
    
    // Constructor
    public AdminController(GameRepository gameRepository, UserService userService, WithdrawalService withdrawalService) {
        this.gameRepository = gameRepository;
        this.userService = userService;
        this.withdrawalService = withdrawalService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getGameStats(@AuthenticationPrincipal User user) {
        List<GameStats> stats = gameRepository.getGameStatistics();
        
        // Convert the statistics to a format that can be serialized to JSON
        List<Map<String, Object>> formattedStats = stats.stream().map(stat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("betAmount", stat.getAmount());
            map.put("gamesPlayed", stat.getCount());
            map.put("totalWon", stat.getTotalWon());
            
            // Calculate profit/loss for the house
            BigDecimal totalBet = stat.getAmount().multiply(BigDecimal.valueOf(stat.getCount()));
            BigDecimal houseProfit = totalBet.subtract(stat.getTotalWon() != null ? stat.getTotalWon() : BigDecimal.ZERO);
            map.put("houseProfit", houseProfit);
            
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(formattedStats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        // Return users with their game statistics
        List<UserManagementDto> usersWithStats = userService.getAllUsersWithStats();
        return ResponseEntity.ok(usersWithStats);
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions() {
        List<Transaction> transactions = userService.getAllTransactions();
        List<TransactionDto> transactionDtos = transactions.stream()
            .map(TransactionDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(transactionDtos);
    }
    
    @GetMapping("/withdrawals")
    public ResponseEntity<?> getAllWithdrawals() {
        return ResponseEntity.ok(withdrawalService.getAllWithdrawalRequests());
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam User.UserStatus status) {
        userService.updateUserStatus(userId, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdrawals/{requestId}/approve")
    public ResponseEntity<?> approveWithdrawal(@PathVariable Long requestId) {
        withdrawalService.approveWithdrawal(requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdrawals/{requestId}/reject")
    public ResponseEntity<?> rejectWithdrawal(@PathVariable Long requestId) {
        withdrawalService.rejectWithdrawal(requestId);
        return ResponseEntity.ok().build();
    }
}