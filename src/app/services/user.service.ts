import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    return this.http.put<User>(`${environment.apiUrl}/api/users/${userId}/roles`, null, {
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
    return this.http.patch<User>(`${environment.apiUrl}/api/users/${userId}/status`, { status });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/users`);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/users/${userId}`);
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
} 