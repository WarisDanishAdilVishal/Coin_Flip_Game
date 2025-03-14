package com.casino.coinflip.controller;

import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.GameRepository;
import com.casino.coinflip.service.UserService;
import com.casino.coinflip.service.WithdrawalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
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
    public ResponseEntity<?> getGameStats() {
        return ResponseEntity.ok(gameRepository.getGameStatistics());
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