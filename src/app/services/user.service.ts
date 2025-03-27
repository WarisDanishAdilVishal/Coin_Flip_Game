import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  balance: number;
  status: 'active' | 'suspended' | 'blocked';
  createdAt: string;
  stats?: {
    totalGames: number;
    profitLoss: number;
    lastActive: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserRoles(userId: string, role: string, operation: 'add' | 'remove'): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${userId}/roles`, null, {
      params: {
        role,
        operation
      }
    }).pipe(
      tap(user => {
        if (user.id === this.getCurrentUser()?.id) {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  updateUserStatus(userId: string, status: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/admin/users/${userId}/status`, { status });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/admin/users/${userId}`);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isSuperAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  forgotPassword(email: string): Observable<any> {
    console.log(`Sending forgot password request to: ${this.apiUrl}/auth/forgot-password`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
  
  validateResetToken(token: string): Observable<any> {
    console.log(`Validating reset token at: ${this.apiUrl}/auth/reset-password/validate?token=${token}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.get(`${this.apiUrl}/auth/reset-password/validate?token=${token}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
  
  resetPassword(token: string, newPassword: string): Observable<any> {
    console.log(`Sending reset password request to: ${this.apiUrl}/auth/reset-password`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 400) {
      errorMessage = 'Invalid request';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error';
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 