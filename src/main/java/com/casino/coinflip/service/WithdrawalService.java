package com.casino.coinflip.service;

import com.casino.coinflip.dto.WithdrawalRequestDto;
import com.casino.coinflip.entity.WithdrawalRequest;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.entity.Transaction;
import com.casino.coinflip.repository.WithdrawalRequestRepository;
import com.casino.coinflip.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WithdrawalService {
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final UserService userService;
    private final TransactionRepository transactionRepository;
    
    // Constructor
    public WithdrawalService(WithdrawalRequestRepository withdrawalRequestRepository, UserService userService, TransactionRepository transactionRepository) {
        this.withdrawalRequestRepository = withdrawalRequestRepository;
        this.userService = userService;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public WithdrawalRequest createWithdrawalRequest(User user, BigDecimal amount, 
            WithdrawalRequest.PaymentMethod method, String details) {
        // Validate user
        if (user == null) {
            throw new RuntimeException("User not found");
        }
            
        // Validate amount
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Withdrawal amount must be greater than zero");
        }
        
        // Check minimum withdrawal amount (₹1000)
        if (amount.compareTo(new BigDecimal("1000")) < 0) {
            throw new RuntimeException("Minimum withdrawal amount is ₹1000");
        }
        
        // Check if user account is active
        if (user.getStatus() != null && user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("Your account is not active. Please contact support");
        }
        
        // Check for sufficient balance
        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance for this withdrawal");
        }

        // Check if user has already made a withdrawal request today
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<WithdrawalRequest> todayRequests = withdrawalRequestRepository.findByUserIdAndTimestampGreaterThanEqual(user.getId(), today);
        if (!todayRequests.isEmpty()) {
            WithdrawalRequest existingRequest = todayRequests.get(0);
            String status = existingRequest.getStatus().toString().toLowerCase();
            throw new RuntimeException("You can only make one withdrawal request per day. Your current " + 
                status + " request for ₹" + existingRequest.getAmount() + " was submitted " +
                "on " + existingRequest.getTimestamp().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, HH:mm")));
        }
        
        // Validate payment details based on method
        if (details == null || details.trim().isEmpty()) {
            throw new RuntimeException("Payment details are required");
        }
        
        // Note: The PaymentMethod enum in WithdrawalRequest only has UPI as a valid value
        // Other payment methods might be handled in the frontend but not properly defined in the backend
        if (method == WithdrawalRequest.PaymentMethod.UPI && !details.contains("@")) {
            throw new RuntimeException("Invalid UPI ID format");
        }
        
        // Additional validation for payment details length regardless of method
        if (details.length() < 5) {
            throw new RuntimeException("Payment details are too short - please provide complete information");
        }
        
        // Hold the balance by subtracting it from user's available balance
        userService.updateBalance(user, amount.negate());

        // Create withdrawal request
        WithdrawalRequest request = new WithdrawalRequest();
        request.setUser(user);
        request.setAmount(amount);
        request.setMethod(method);
        request.setDetails(details);
        request.setStatus(WithdrawalRequest.WithdrawalStatus.PENDING);

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(amount.negate()); // Negative amount for withdrawal
        transaction.setType(Transaction.TransactionType.WITHDRAWAL);
        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        transaction.setDetails("Withdrawal Request - " + method + ": " + details);
        transactionRepository.save(transaction);

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

        // Update transaction status
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTimestampDesc(request.getUser().getId());
        transactions.stream()
            .filter(t -> t.getType() == Transaction.TransactionType.WITHDRAWAL && 
                        t.getAmount().equals(request.getAmount().negate()) &&
                        t.getStatus() == Transaction.TransactionStatus.PENDING)
            .findFirst()
            .ifPresent(t -> {
                t.setStatus(Transaction.TransactionStatus.COMPLETED);
                transactionRepository.save(t);
            });

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

        // Return the balance to the user since the withdrawal is rejected
        userService.updateBalance(request.getUser(), request.getAmount());

        // Update transaction status
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTimestampDesc(request.getUser().getId());
        transactions.stream()
            .filter(t -> t.getType() == Transaction.TransactionType.WITHDRAWAL && 
                        t.getAmount().equals(request.getAmount().negate()) &&
                        t.getStatus() == Transaction.TransactionStatus.PENDING)
            .findFirst()
            .ifPresent(t -> {
                t.setStatus(Transaction.TransactionStatus.FAILED);
                transactionRepository.save(t);
            });

        request.setStatus(WithdrawalRequest.WithdrawalStatus.REJECTED);
        withdrawalRequestRepository.save(request);
    }

    public List<WithdrawalRequestDto> getWithdrawalHistory(Long userId) {
        return withdrawalRequestRepository.findByUserIdOrderByTimestampDesc(userId)
            .stream()
            .map(WithdrawalRequestDto::new)
            .collect(Collectors.toList());
    }
    
    public List<WithdrawalRequestDto> getAllWithdrawalRequests(WithdrawalRequest.WithdrawalStatus status) {
        List<WithdrawalRequest> requests;
        if (status != null) {
            requests = withdrawalRequestRepository.findByStatusOrderByTimestampAsc(status);
        } else {
            requests = withdrawalRequestRepository.findAll();
        }
        
        return requests.stream()
            .map(WithdrawalRequestDto::new)
            .collect(Collectors.toList());
    }

    public List<WithdrawalRequestDto> getWithdrawalRequestsByStatus(WithdrawalRequest.WithdrawalStatus status) {
        return withdrawalRequestRepository.findByStatusOrderByTimestampAsc(status)
            .stream()
            .map(WithdrawalRequestDto::new)
            .collect(Collectors.toList());
    }
}