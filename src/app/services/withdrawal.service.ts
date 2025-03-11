import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalService {
  private apiUrl = `${environment.apiUrl}/withdrawals`;

  constructor(private http: HttpClient) {}

  createWithdrawalRequest(amount: number, method: string, details: string): Observable<any> {
    return this.http.post(this.apiUrl, { amount, method, details });
  }

  getWithdrawalHistory(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}