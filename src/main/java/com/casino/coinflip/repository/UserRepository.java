package com.casino.coinflip.repository;

import com.casino.coinflip.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}