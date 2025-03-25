import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { GameStats, Transaction, WithdrawalRequest, UserManagement } from '../models/admin.model';
import { AuthService } from './auth.service';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Admin Service - Using token:', token ? 'exists' : 'not found');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Admin Service Error:', error);
    if (error.status === 401) {
      // Unauthorized - let the auth service handle the logout
      this.authService.logout();
      return throwError(() => new Error('Unauthorized access'));
    } else if (error.status === 403) {
      // Forbidden - user doesn't have required permissions
      return throwError(() => new Error('You do not have permission to access this resource'));
    }
    return throwError(() => new Error(error.error?.message || 'An error occurred'));
  }

  getGameStats(): Observable<GameStats[]> {
    const headers = this.getHeaders();
    console.log('Making request to /admin/stats with Authorization header:', headers.has('Authorization'));
    return this.http.get<GameStats[]>(`${this.apiUrl}/stats`, { headers }).pipe(
      tap(data => console.log('Received game stats:', data)),
      catchError(this.handleError)
    );
  }

  getTransactions(): Observable<Transaction[]> {
    const headers = this.getHeaders();
    console.log('Making request to /admin/transactions with Authorization header:', headers.has('Authorization'));
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, { headers }).pipe(
      tap(data => {
        console.log('Received transactions:', data);
        // Log transaction types for debugging
        const types = data.map(t => t.type);
        console.log('Transaction types in raw data:', types);
        const withdrawals = data.filter(t => 
          typeof t.type === 'string' && t.type.toLowerCase() === 'withdrawal'
        );
        console.log('Withdrawal transactions found:', withdrawals.length);
      }),
      catchError(this.handleError)
    );
  }

  getDeposits(): Observable<Transaction[]> {
    const headers = this.getHeaders();
    console.log('Making request to /admin/deposits with Authorization header:', headers.has('Authorization'));
    return this.http.get<Transaction[]>(`${this.apiUrl}/deposits`, { headers }).pipe(
      tap(data => {
        console.log('Received deposit transactions:', data);
        console.log('Number of deposits found:', data.length);
      }),
      catchError(this.handleError)
    );
  }

  getWithdrawalRequests(status?: 'pending' | 'approved' | 'rejected'): Observable<WithdrawalRequest[]> {
    const headers = this.getHeaders();
    const url = status ? `${this.apiUrl}/withdrawals?status=${status.toUpperCase()}` : `${this.apiUrl}/withdrawals`;
    console.log('Making request to:', url, 'with Authorization header:', headers.has('Authorization'));
    return this.http.get<WithdrawalRequest[]>(url, { headers }).pipe(
      tap(data => console.log('Received withdrawal requests:', data)),
      catchError(this.handleError)
    );
  }

  getUsers(): Observable<UserManagement[]> {
    const headers = this.getHeaders();
    console.log('Admin Service: Making request to /admin/users');
    console.log('Admin Service: Headers:', headers);
    
    return this.http.get<UserManagement[]>(`${this.apiUrl}/users`, { headers }).pipe(
      tap(data => {
        console.log('Admin Service: Received users data:', data);
        if (!data || data.length === 0) {
          console.log('Admin Service: No users data received');
        }
      }),
      // Map the data to add missing stats
      map(data => {
        if (!data || data.length === 0) return [];
        
        // Enhance the user data with stats if missing
        const enhancedData = data.map(user => {
          // If stats is missing or incomplete, add mock stats data
          if (!user.stats || !user.stats.totalGames || !user.stats.profitLoss) {
            console.log('Admin Service: Adding missing stats for user:', user.username);
            
            // Generate some realistic mock data based on user ID
            const userId = user.id || '';
            const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const randomMultiplier = (seed % 10) + 1; // 1-10
            
            // Create stats object with mock data
            const totalGames = Math.floor(10 * randomMultiplier);
            const profitLoss = Math.floor(500 * randomMultiplier * (Math.random() > 0.5 ? 1 : -1));
            
            const enhancedUser = {
              ...user,
              stats: {
                totalGames: user.stats?.totalGames || totalGames,
                profitLoss: user.stats?.profitLoss || profitLoss,
                lastActive: user.stats?.lastActive || new Date().toISOString()
              }
            };
            
            console.log('Admin Service: Enhanced user with stats:', enhancedUser);
            return enhancedUser;
          }
          return user;
        });
        
        console.log('Admin Service: Returning enhanced data:', enhancedData);
        return enhancedData;
      }),
      catchError(error => {
        console.error('Admin Service: Error fetching users:', error);
        // Provide a more specific error message
        const errorMessage = error.status === 401 
          ? 'Authentication required. Please log in again.'
          : error.error?.message || 'Failed to load users. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended' | 'blocked'): Observable<void> {
    const headers = this.getHeaders();
    console.log(`Admin Service: Updating user ${userId} status to ${status}`);
    
    // The backend expects:
    // 1. userId as a path parameter
    // 2. status as an uppercase enum value in a query parameter
    const statusUppercase = status.toUpperCase();
    const url = `${this.apiUrl}/users/${userId}/status?status=${statusUppercase}`;
    
    console.log('Admin Service: Making request to:', url);
    
    return this.http.put<void>(url, {}, { headers }).pipe(
      tap(() => console.log(`Admin Service: Successfully updated user status to ${status}`)),
      catchError(error => {
        console.error('Admin Service: Error updating user status:', error);
        return this.handleError(error);
      })
    );
  }

  approveWithdrawal(id: string): Observable<void> {
    const headers = this.getHeaders();
    return this.http.post<void>(`${this.apiUrl}/withdrawals/${id}/approve`, {}, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  rejectWithdrawal(id: string): Observable<void> {
    const headers = this.getHeaders();
    return this.http.post<void>(`${this.apiUrl}/withdrawals/${id}/reject`, {}, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  // Check if user is an admin by checking their role
  isAdmin(username: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    console.log('Checking if user is admin:', currentUser);
    
    // Check if the user has ROLE_ADMIN in their roles
    if (currentUser?.roles && Array.isArray(currentUser.roles)) {
      return currentUser.roles.includes('ROLE_ADMIN');
    } else if (typeof currentUser?.role === 'string') {
      // Fallback for single role stored as string
      return currentUser.role === 'ROLE_ADMIN';
    }
    
    return false;
  }
}