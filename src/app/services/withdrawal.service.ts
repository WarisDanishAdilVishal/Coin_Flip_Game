import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WithdrawalRequest } from '../models/withdrawal.model';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalService {
  private apiUrl = `${environment.apiUrl}/withdrawals`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createWithdrawalRequest(amount: number, method: string, details: string): Observable<WithdrawalRequest> {
    const headers = this.getHeaders();
    const methodUpperCase = method.toUpperCase();
    return this.http.post<WithdrawalRequest>(`${this.apiUrl}/request`, 
      { amount, method: methodUpperCase, details },
      { headers }
    );
  }

  getWithdrawalHistory(): Observable<WithdrawalRequest[]> {
    const headers = this.getHeaders();
    return this.http.get<WithdrawalRequest[]>(`${this.apiUrl}/history`, { headers });
  }
}