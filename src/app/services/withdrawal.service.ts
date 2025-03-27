import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server sent a specific error message - use it directly
      // This handles withdrawal limit errors properly
      errorMessage = error.error.message;
    } else {
      // Server-side error without specific message
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid withdrawal request';
          break;
        case 401:
          // Only show login error if there's no specific message
          errorMessage = 'You must be logged in to make a withdrawal';
          break;
        case 403:
          errorMessage = 'You do not have permission to make this withdrawal';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later';
          break;
        default:
          errorMessage = `Unknown error occurred: ${error.message}`;
      }
    }
    
    return throwError(() => ({ status: error.status, message: errorMessage }));
  }

  createWithdrawalRequest(amount: number, method: string, details: string): Observable<WithdrawalRequest> {
    const headers = this.getHeaders();
    const methodUpperCase = method.toUpperCase();
    return this.http.post<WithdrawalRequest>(`${this.apiUrl}/request`, 
      { amount, method: methodUpperCase, details },
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getWithdrawalHistory(): Observable<WithdrawalRequest[]> {
    const headers = this.getHeaders();
    return this.http.get<WithdrawalRequest[]>(`${this.apiUrl}/history`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
}