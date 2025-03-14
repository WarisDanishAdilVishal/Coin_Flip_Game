package com.casino.coinflip.controller;

import com.casino.coinflip.dto.GameRequest;
import com.casino.coinflip.dto.GameResponse;
import com.casino.coinflip.entity.Game;
import com.casino.coinflip.entity.User;
import com.casino.coinflip.service.GameService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/game")
public class GameController {
    private final GameService gameService;
    
    // Constructor
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/play")
    public ResponseEntity<GameResponse> playGame(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GameRequest request) {
        Game game = gameService.playGame(user, request.getBetAmount(), request.getChoice());
        return ResponseEntity.ok(new GameResponse(game));
    }

    @GetMapping("/history")
    public ResponseEntity<List<GameResponse>> getGameHistory(@AuthenticationPrincipal User user) {
        List<Game> history = gameService.getGameHistory(user.getId());
        
        // Convert entities to DTOs
        List<GameResponse> responseList = history.stream()
                .map(GameResponse::new)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(responseList);
    }
}