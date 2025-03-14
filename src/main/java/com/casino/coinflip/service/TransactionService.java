package com.casino.coinflip.service;

import com.casino.coinflip.entity.Transaction;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    
    // Constructor
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Transaction createGameTransaction(User user, BigDecimal amount, boolean won) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(won ? amount : amount.negate());
        transaction.setType(Transaction.TransactionType.GAME);
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        transaction.setDetails("Coin Flip Game: " + (won ? "Won" : "Lost"));
        
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction createDepositTransaction(User user, BigDecimal amount) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setType(Transaction.TransactionType.DEPOSIT);
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        transaction.setDetails("Deposit");
        
        return transactionRepository.save(transaction);
    }
}