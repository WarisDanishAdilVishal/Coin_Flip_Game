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
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {
    private final GameRepository gameRepository;
    private final UserService userService;
    private final WithdrawalService withdrawalService;
    private final TransactionService transactionService;
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    // Constructor
    public AdminController(GameRepository gameRepository, UserService userService, 
                          WithdrawalService withdrawalService, TransactionService transactionService) {
        this.gameRepository = gameRepository;
        this.userService = userService;
        this.withdrawalService = withdrawalService;
        this.transactionService = transactionService;
    }

    @GetMapping({"/admin/stats", "/api/admin/stats"})
    public ResponseEntity<?> getGameStats() {
        List<GameRepository.GameStats> stats = gameRepository.getGameStatistics();
        List<Map<String, Object>> formattedStats = stats.stream().map(stat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("betAmount", stat.getAmount());
            map.put("gamesPlayed", stat.getCount());
            map.put("totalWon", stat.getTotalWon());
            BigDecimal totalBet = stat.getAmount().multiply(BigDecimal.valueOf(stat.getCount()));
            BigDecimal houseProfit = totalBet.subtract(stat.getTotalWon() != null ? stat.getTotalWon() : BigDecimal.ZERO);
            map.put("houseProfit", houseProfit);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(formattedStats);
    }

    @GetMapping({"/admin/users", "/api/admin/users", "/api/users"})
    public ResponseEntity<?> getAllUsers() {
        try {
            logger.info("Fetching all users with stats");
            List<UserManagementDto> usersWithStats = userService.getAllUsersWithStats();
            logger.info("Successfully fetched {} users", usersWithStats.size());
            return ResponseEntity.ok(usersWithStats);
        } catch (Exception e) {
            logger.error("Error fetching users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch users: " + e.getMessage()));
        }
    }
    
    @GetMapping({"/admin/transactions", "/api/admin/transactions"})
    public ResponseEntity<?> getAllTransactions() {
        try {
            logger.info("Fetching all transactions");
            List<Transaction> transactions = userService.getAllTransactions();
            List<TransactionDto> transactionDtos = transactions.stream()
                .map(TransactionDto::new)
                .collect(Collectors.toList());
            logger.info("Successfully fetched {} transactions", transactionDtos.size());
            return ResponseEntity.ok(transactionDtos);
        } catch (Exception e) {
            logger.error("Error fetching transactions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching transactions: " + e.getMessage());
        }
    }
    
    @GetMapping({"/admin/deposits", "/api/admin/deposits"})
    public ResponseEntity<?> getAllDeposits() {
        try {
            logger.info("Fetching all deposit transactions");
            List<Transaction> deposits = transactionService.getAllDeposits();
            List<TransactionDto> depositDtos = deposits.stream()
                .map(TransactionDto::new)
                .collect(Collectors.toList());
            logger.info("Successfully fetched {} deposit transactions", depositDtos.size());
            return ResponseEntity.ok(depositDtos);
        } catch (Exception e) {
            logger.error("Error fetching deposit transactions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching deposit transactions: " + e.getMessage());
        }
    }
    
    @GetMapping({"/admin/withdrawals", "/api/admin/withdrawals"})
    public ResponseEntity<?> getAllWithdrawals(@RequestParam(required = false) WithdrawalRequest.WithdrawalStatus status) {
        try {
            logger.info("Fetching withdrawal requests with status: {}", status);
            List<WithdrawalRequestDto> requests = withdrawalService.getAllWithdrawalRequests(status);
            logger.info("Successfully fetched {} withdrawal requests", requests.size());
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            logger.error("Error fetching withdrawal requests: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching withdrawal requests: " + e.getMessage());
        }
    }

    @PutMapping({"/admin/users/{userId}/status", "/api/admin/users/{userId}/status", "/api/users/{userId}/status"})
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam User.UserStatus status) {
        try {
            logger.info("Updating status for user {}: {}", userId, status);
            userService.updateUserStatus(userId, status);
            logger.info("Successfully updated status for user {}", userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error updating user status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating user status: " + e.getMessage());
        }
    }

    @PostMapping({"/admin/withdrawals/{requestId}/approve", "/api/admin/withdrawals/{requestId}/approve"})
    public ResponseEntity<?> approveWithdrawal(@PathVariable Long requestId) {
        try {
            logger.info("Approving withdrawal request: {}", requestId);
            withdrawalService.approveWithdrawal(requestId);
            logger.info("Successfully approved withdrawal request: {}", requestId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error approving withdrawal request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error approving withdrawal request: " + e.getMessage());
        }
    }

    @PostMapping({"/admin/withdrawals/{requestId}/reject", "/api/admin/withdrawals/{requestId}/reject"})
    public ResponseEntity<?> rejectWithdrawal(@PathVariable Long requestId) {
        try {
            logger.info("Rejecting withdrawal request: {}", requestId);
            withdrawalService.rejectWithdrawal(requestId);
            logger.info("Successfully rejected withdrawal request: {}", requestId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error rejecting withdrawal request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error rejecting withdrawal request: " + e.getMessage());
        }
    }

    @PutMapping({"/admin/users/{userId}/roles", "/api/admin/users/{userId}/roles", "/api/users/{userId}/roles"})
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestParam String role,
            @RequestParam String operation) {
        try {
            logger.info("Updating role for user {}: {} - {}", userId, role, operation);
            
            if (!operation.equals("add") && !operation.equals("remove")) {
                return ResponseEntity.badRequest().body("Operation must be either 'add' or 'remove'");
            }

            if (!role.equals("ADMIN") && !role.equals("ROLE_ADMIN")) {
                return ResponseEntity.badRequest().body("Invalid role specified");
            }

            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Set<String> roles = new HashSet<>(user.getRoles());

            if (operation.equals("add")) {
                roles.add(role);
            } else {
                roles.remove(role);
                roles.add("ROLE_USER");
            }

            user.setRoles(roles);
            user = userService.save(user);

            Long totalGames = gameRepository.countGamesByUserId(user.getId());
            BigDecimal profitLoss = gameRepository.calculateProfitLossByUserId(user.getId());
            if (profitLoss == null) {
                profitLoss = BigDecimal.ZERO;
            }

            logger.info("Successfully updated roles for user {}", userId);
            return ResponseEntity.ok(new UserManagementDto(user, totalGames, profitLoss));
        } catch (Exception e) {
            logger.error("Error updating user role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating user role: " + e.getMessage());
        }
    }
}