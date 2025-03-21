package com.casino.coinflip.repository;

import com.casino.coinflip.entity.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    List<WithdrawalRequest> findByUserIdOrderByTimestampDesc(Long userId);
    List<WithdrawalRequest> findByStatusOrderByTimestampAsc(WithdrawalRequest.WithdrawalStatus status);
    List<WithdrawalRequest> findByUserIdAndTimestampGreaterThanEqual(Long userId, LocalDateTime timestamp);
}