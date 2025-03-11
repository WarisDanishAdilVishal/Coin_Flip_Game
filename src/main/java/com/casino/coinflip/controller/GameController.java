package com.casino.coinflip.controller;

import com.casino.coinflip.dto.GameRequest;
import com.casino.coinflip.entity.Game;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {
    private final GameService gameService;

    @PostMapping("/play")
    public ResponseEntity<Game> playGame(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GameRequest request) {
        Game game = gameService.playGame(user, request.getBetAmount(), request.getChoice());
        return ResponseEntity.ok(game);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Game>> getGameHistory(@AuthenticationPrincipal User user) {
        List<Game> history = gameService.getGameHistory(user.getId());
        return ResponseEntity.ok(history);
    }
}