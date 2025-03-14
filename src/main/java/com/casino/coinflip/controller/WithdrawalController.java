package com.casino.coinflip.controller;

import com.casino.coinflip.dto.WithdrawalRequestDto;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.entity.WithdrawalRequest;
import com.casino.coinflip.service.WithdrawalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/withdrawals")
public class WithdrawalController {
    private final WithdrawalService withdrawalService;
    
    // Constructor
    public WithdrawalController(WithdrawalService withdrawalService) {
        this.withdrawalService = withdrawalService;
    }

    @PostMapping
    public ResponseEntity<WithdrawalRequest> createWithdrawalRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody WithdrawalRequestDto request) {
        WithdrawalRequest withdrawalRequest = withdrawalService.createWithdrawalRequest(
            user,
            request.getAmount(),
            WithdrawalRequest.PaymentMethod.valueOf(request.getMethod().toUpperCase()),
            request.getDetails()
        );
        return ResponseEntity.ok(withdrawalRequest);
    }

    @GetMapping
    public ResponseEntity<List<WithdrawalRequest>> getWithdrawalHistory(
            @AuthenticationPrincipal User user) {
        List<WithdrawalRequest> history = withdrawalService.getWithdrawalHistory(user.getId());
        return ResponseEntity.ok(history);
    }
}