import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GameHistory } from '../models/game-history.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = `${environment.apiUrl}/game`;

  constructor(private http: HttpClient) {}

  playGame(betAmount: number, choice: string): Observable<GameHistory> {
    return this.http.post<GameHistory>(`${this.apiUrl}/play`, { betAmount, choice });
  }

  getGameHistory(): Observable<GameHistory[]> {
    return this.http.get<GameHistory[]>(`${this.apiUrl}/history`);
  }
}