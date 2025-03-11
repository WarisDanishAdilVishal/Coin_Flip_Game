import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GameStats, Transaction, WithdrawalRequest, UserManagement } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getGameStats(): Observable<GameStats[]> {
    return this.http.get<GameStats[]>(`${this.apiUrl}/stats`);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  getWithdrawalRequests(): Observable<WithdrawalRequest[]> {
    return this.http.get<WithdrawalRequest[]>(`${this.apiUrl}/withdrawals`);
  }

  getUsers(): Observable<UserManagement[]> {
    return this.http.get<UserManagement[]>(`${this.apiUrl}/users`);
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended' | 'blocked'): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/status`, { status });
  }

  approveWithdrawal(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/withdrawals/${id}/approve`, {});
  }

  rejectWithdrawal(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/withdrawals/${id}/reject`, {});
  }
}