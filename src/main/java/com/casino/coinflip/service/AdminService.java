package com.casino.coinflip.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.dto.UserManagementDto;
import java.math.BigDecimal;

@Service
public class AdminService {

    @Autowired
    private UserService userService;

    public UserManagementDto updateUserRole(String userId, String role, String operation) {
        User user = userService.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (operation.equals("add")) {
            user = userService.addRole(user, role);
        } else if (operation.equals("remove")) {
            user = userService.removeRole(user, role);
        } else {
            throw new IllegalArgumentException("Invalid operation: " + operation);
        }

        // Create UserManagementDto with required parameters (user, totalGames=0L, profitLoss=0)
        return new UserManagementDto(user, 0L, BigDecimal.ZERO);
    }
} 