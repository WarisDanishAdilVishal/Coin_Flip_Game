import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { GameHistory } from '../models/game-history.model';
import { AuthService } from '../services/auth.service';

// Interface to match the backend response structure
interface GameHistoryResponse {
  id: number;
  username: string;
  betAmount: number;
  choice: string;
  outcome: string;
  won: boolean;
  playedAt: string;
  winAmount: number;
  gameType: string;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = `${environment.apiUrl}/game`;
  private _totalGamesCount: number = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Getter for the total count
  get totalGamesCount(): number {
    return this._totalGamesCount;
  }

  playGame(betAmount: number, choice: string): Observable<GameHistory> {
    console.log(`GameService - Making request to ${this.apiUrl}/play`);
    console.log('Request payload:', { betAmount, choice });
    
    // Get token directly from localStorage for reliability
    const token = localStorage.getItem('token');
    console.log('Game API - Token exists:', !!token);
    
    // Create headers with the token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    // Log the complete request for debugging
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token.substring(0, 10)}...` : 'none'
    });
    
    return this.http.post<GameHistoryResponse>(
      `${this.apiUrl}/play`, 
      { betAmount, choice },
      { headers: headers }
    ).pipe(
      map(response => {
        console.log('Raw game response from server:', response);
        
        // Transform backend DTO to frontend model
        const gameHistory: GameHistory = {
          id: response.id,
          username: response.username,
          choice: response.choice,
          outcome: response.outcome,
          won: response.won,
          bet: response.betAmount,
          betAmount: response.betAmount,
          winAmount: response.winAmount,
          timestamp: new Date(response.playedAt),
          playedAt: response.playedAt,
          gameType: response.gameType,
          balance: response.balance
        };
        
        return gameHistory;
      }),
      tap(mappedResponse => console.log('Mapped game response:', mappedResponse)),
      catchError(error => {
        console.error('Game API error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error details:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  getGameHistory(): Observable<GameHistory[]> {
    console.log(`GameService - Making request to ${this.apiUrl}/history to fetch all games`);
    
    // Get token directly from localStorage for reliability
    const token = localStorage.getItem('token');
    console.log('History API - Token exists:', !!token);
    
    // Create headers with the token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    // Request all games without pagination
    return this.http.get<GameHistoryResponse[]>(
      `${this.apiUrl}/history`,
      { headers: headers }
    ).pipe(
      map(response => {
        console.log('Raw history response from server:', response);
        
        // Transform backend DTO to frontend model
        const transformedGames = response.map(item => ({
          id: item.id,
          username: item.username,
          choice: item.choice,
          outcome: item.outcome,
          won: item.won,
          bet: item.betAmount,
          betAmount: item.betAmount,
          winAmount: item.winAmount,
          timestamp: new Date(item.playedAt),
          playedAt: item.playedAt,
          gameType: item.gameType,
          balance: item.balance
        }));
        
        // Sort games by timestamp in descending order (newest first)
        return transformedGames.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }),
      tap(games => console.log('Transformed game history:', games)),
      catchError(error => {
        console.error('Error fetching game history:', error);
        return throwError(() => error);
      })
    );
  }
}