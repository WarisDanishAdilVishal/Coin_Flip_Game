import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  username: string;
  balance: number;
  role: string;
  roles?: string[];  // Add roles array
}

// Add a new interface for the user profile API response
interface UserProfileResponse {
  username: string;
  balance: number;
  role: string;
  roles?: string[];  // Add roles array
  id?: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }
  
  private handleAuthResponse(response: AuthResponse): User {
    console.log('Auth response received:', response);
    
    const user: User = {
      username: response.username,
      balance: response.balance,
      role: response.role,
      roles: response.roles || [response.role]  // Use roles array if available, otherwise create array from single role
    };
    
    // Store token and user data
    if (response.token) {
      console.log('Storing token in localStorage');
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Double-check storage
      const storedToken = localStorage.getItem('token');
      console.log('Token stored successfully:', !!storedToken);
    } else {
      console.error('No token in auth response!');
    }
    
    // Update current user subject
    this.currentUserSubject.next(user);
    
    return user;
  }
  
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid username or password';
    } else if (error.status === 409) {
      errorMessage = 'Username already exists';
    }
    
    return throwError(() => new Error(errorMessage));
  }
  
  register(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, password })
      .pipe(
        map(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }
  
  login(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  getCurrentUser(): User | null {
    const value = this.currentUserSubject.value;
    console.log('AuthService.getCurrentUser() called, returning:', JSON.stringify(value, null, 2));
    return value;
  }
  
  updateCurrentUser(user: User): void {
    console.log('AuthService.updateCurrentUser() called with:', JSON.stringify(user, null, 2));
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('Updated localStorage with user data');
    
    // Update the behavior subject
    this.currentUserSubject.next(user);
    console.log('Updated currentUserSubject with new user data');
    
    // Verify the update
    const storedUser = localStorage.getItem('currentUser');
    console.log('Verification - currentUser in localStorage:', storedUser ? 'Present' : 'Missing');
  }
  
  updateUserBalance(amount: number): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        balance: (currentUser.balance || 0) + amount
      };
      this.updateCurrentUser(updatedUser);
    }
  }

  // Add a new method to refresh user data from the backend
  refreshCurrentUser(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserProfileResponse>(`${environment.apiUrl}/user/profile`, { headers })
      .pipe(
        map(response => {
          console.log('User profile response:', response);
          
          // Convert the types to match the User model
          const user: User = {
            username: response.username,
            balance: response.balance,
            role: response.role,
            roles: response.roles || [response.role], // Use roles array if available, otherwise create array from single role
            id: response.id?.toString(), // Convert number to string
            createdAt: response.createdAt ? new Date(response.createdAt) : undefined // Convert string to Date
          };
          
          // Update stored user data
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return user;
        }),
        catchError(error => {
          console.error('Failed to refresh user data:', error);
          // If unauthorized, log the user out
          if (error.status === 401) {
            this.logout();
          }
          return of(null);
        })
      );
  }
}