package com.casino.coinflip.service;

import com.casino.coinflip.entity.User;
import com.casino.coinflip.entity.Transaction;
import com.casino.coinflip.repository.UserRepository;
import com.casino.coinflip.repository.TransactionRepository;
import com.casino.coinflip.repository.GameRepository;
import com.casino.coinflip.dto.UserManagementDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final GameRepository gameRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Constructor
    public UserService(UserRepository userRepository, TransactionRepository transactionRepository, 
                        GameRepository gameRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.gameRepository = gameRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User createUser(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setBalance(new BigDecimal("0")); // Starting balance
        user.setRoles(new HashSet<>(java.util.Arrays.asList("ROLE_USER")));
        user.setCreatedAt(LocalDateTime.now());
        user.setLastActive(LocalDateTime.now());

        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public void updateBalance(User user, BigDecimal amount) {
        user.setBalance(user.getBalance().add(amount));
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void updateUserStatus(Long userId, User.UserStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<UserManagementDto> getAllUsersWithStats() {
        List<User> users = userRepository.findAll();
        
        return users.stream().map(user -> {
            Long totalGames = gameRepository.countGamesByUserId(user.getId());
            BigDecimal profitLoss = gameRepository.calculateProfitLossByUserId(user.getId());
            
            // Handle null values for new users
            if (profitLoss == null) {
                profitLoss = BigDecimal.ZERO;
            }
            
            return new UserManagementDto(user, totalGames, profitLoss);
        }).collect(Collectors.toList());
    }
    
    public List<Transaction> getAllTransactions() {
        List<Transaction> transactions = transactionRepository.findAll();
        
        // Force initialization of lazy-loaded user data and ensure it's properly loaded
        transactions.forEach(transaction -> {
            if (transaction.getUser() != null) {
                transaction.getUser().getUsername(); // Force load username
                transaction.getUser().getId(); // Force load ID
            }
        });
        
        return transactions;
    }
}