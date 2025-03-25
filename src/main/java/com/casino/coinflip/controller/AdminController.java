package com.casino.coinflip.controller;

//import com.casino.coinflip.dto.GameRequest;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.GameRepository;
import com.casino.coinflip.repository.GameRepository.GameStats;
import com.casino.coinflip.service.UserService;
import com.casino.coinflip.service.WithdrawalService;
import com.casino.coinflip.service.TransactionService;
import com.casino.coinflip.dto.TransactionDto;
import com.casino.coinflip.dto.UserManagementDto;
import com.casino.coinflip.entity.Transaction;
import com.casino.coinflip.entity.WithdrawalRequest;
import com.casino.coinflip.dto.WithdrawalRequestDto;

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
import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {
    private final GameRepository gameRepository;
    private final UserService userService;
    private final WithdrawalService withdrawalService;
    private final TransactionService transactionService;
    
    // Constructor
    public AdminController(GameRepository gameRepository, UserService userService, 
                          WithdrawalService withdrawalService, TransactionService transactionService) {
        this.gameRepository = gameRepository;
        this.userService = userService;
        this.withdrawalService = withdrawalService;
        this.transactionService = transactionService;
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
    
    @GetMapping("/deposits")
    public ResponseEntity<?> getAllDeposits() {
        try {
            System.out.println("Received request for deposit transactions");
            List<Transaction> deposits = transactionService.getAllDeposits();
            List<TransactionDto> depositDtos = deposits.stream()
                .map(TransactionDto::new)
                .collect(Collectors.toList());
            System.out.println("Found " + depositDtos.size() + " deposit transactions");
            return ResponseEntity.ok(depositDtos);
        } catch (Exception e) {
            System.err.println("Error fetching deposit transactions: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching deposit transactions: " + e.getMessage());
        }
    }
    
    @GetMapping("/withdrawals")
    public ResponseEntity<?> getAllWithdrawals(@RequestParam(required = false) WithdrawalRequest.WithdrawalStatus status) {
        try {
            System.out.println("Received request for withdrawals with status: " + status);
            List<WithdrawalRequestDto> requests = withdrawalService.getAllWithdrawalRequests(status);
            System.out.println("Found " + requests.size() + " withdrawal requests");
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            System.err.println("Error fetching withdrawal requests: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching withdrawal requests: " + e.getMessage());
        }
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

    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long userId, @RequestParam String role, @RequestParam boolean add) {
        try {
            User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Set<String> roles = new HashSet<>(user.getRoles());
            
            if (add) {
                roles.add(role);
            } else {
                roles.remove(role);
                // Make sure user still has at least ROLE_USER
                roles.add("ROLE_USER");
            }
            
            user.setRoles(roles);
            userService.saveUser(user);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}