package com.casino.coinflip.service;

import com.casino.coinflip.entity.WithdrawalRequest;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.WithdrawalRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class WithdrawalService {
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final UserService userService;
    
    // Constructor
    public WithdrawalService(WithdrawalRequestRepository withdrawalRequestRepository, UserService userService) {
        this.withdrawalRequestRepository = withdrawalRequestRepository;
        this.userService = userService;
    }

    @Transactional
    public WithdrawalRequest createWithdrawalRequest(User user, BigDecimal amount, 
            WithdrawalRequest.PaymentMethod method, String details) {
        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        WithdrawalRequest request = new WithdrawalRequest();
        request.setUser(user);
        request.setAmount(amount);
        request.setMethod(method);
        request.setDetails(details);
        request.setStatus(WithdrawalRequest.WithdrawalStatus.PENDING);

        return withdrawalRequestRepository.save(request);
    }

    @Transactional
    public void approveWithdrawal(Long requestId) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Withdrawal request not found"));

        if (request.getStatus() != WithdrawalRequest.WithdrawalStatus.PENDING) {
            throw new RuntimeException("Withdrawal request is not pending");
        }

        // Update user balance
        userService.updateBalance(request.getUser(), request.getAmount().negate());

        // Update request status
        request.setStatus(WithdrawalRequest.WithdrawalStatus.APPROVED);
        withdrawalRequestRepository.save(request);
    }

    @Transactional
    public void rejectWithdrawal(Long requestId) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Withdrawal request not found"));

        if (request.getStatus() != WithdrawalRequest.WithdrawalStatus.PENDING) {
            throw new RuntimeException("Withdrawal request is not pending");
        }

        request.setStatus(WithdrawalRequest.WithdrawalStatus.REJECTED);
        withdrawalRequestRepository.save(request);
    }

    public List<WithdrawalRequest> getWithdrawalHistory(Long userId) {
        return withdrawalRequestRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    public List<WithdrawalRequest> getAllWithdrawalRequests() {
        List<WithdrawalRequest> requests = withdrawalRequestRepository.findAll();
        
        // Force initialization of lazy-loaded user data
        requests.forEach(request -> {
            if (request.getUser() != null) {
                request.getUser().getUsername();
            }
        });
        
        return requests;
    }
}