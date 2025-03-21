import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

interface UserProfileResponse {
  username: string;
  balance: number;
  role: string;
  id: number;
  createdAt: string;
  email?: string;
  totalGames?: number | string; // Backend might send as string or number
  gamesWon?: number | string;
  gamesLost?: number | string;
  lifetimeEarnings?: number | string;
  highestWin?: number | string;
  status?: string;
  lastActive?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getBasicProfile(): Observable<User> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Not authenticated - no token found');
      return throwError(() => new Error('Not authenticated'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`, { headers })
      .pipe(
        map(response => {
          console.log('Basic profile response:', JSON.stringify(response, null, 2));
          return this.mapProfileResponseToUser(response);
        }),
        catchError(error => {
          console.error('Error fetching basic profile:', error);
          const fallbackUser = this.getFallbackUser();
          console.log('Using fallback user data:', fallbackUser);
          return of(fallbackUser);
        })
      );
  }

  getDetailedProfile(): Observable<User> {
    console.log('Requesting detailed profile data from server');
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return throwError(() => new Error('Not authenticated'));
    }

    console.log('Auth token for API request:', token.substring(0, 10) + '...');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile/detailed`, { headers })
      .pipe(
        map(response => {
          console.log('FULL DETAILED PROFILE RESPONSE:', JSON.stringify(response, null, 2));
          
          // Log specific fields for debugging
          console.log('Game stats directly from response:');
          console.log('- totalGames:', typeof response.totalGames, response.totalGames);
          console.log('- gamesWon:', typeof response.gamesWon, response.gamesWon);
          console.log('- gamesLost:', typeof response.gamesLost, response.gamesLost);
          console.log('- lifetimeEarnings:', typeof response.lifetimeEarnings, response.lifetimeEarnings);
          
          if (response.totalGames === null || response.totalGames === undefined) {
            console.warn('totalGames is missing from API response, will use default 0');
          }
          
          // Try to access nested data if that's how it's structured
          // Sometimes the backend might nest data differently than expected
          if (response && typeof response === 'object') {
            const nestedCheck = this.tryFindNestedData(response);
            if (nestedCheck) {
              console.log('Found nested data structure, using that instead');
              response = nestedCheck;
            }
          }
          
          const mappedUser = this.mapProfileResponseToUser(response);
          console.log('MAPPED USER OBJECT FULL:', JSON.stringify(mappedUser, null, 2));
          
          // Update the user in auth service to persist the data
          this.updateStoredUserData(mappedUser);
          
          return mappedUser;
        }),
        catchError(error => {
          console.error('Error fetching detailed profile:', error);
          console.error('Status:', error.status);
          console.error('Error message:', error.message || error);
          if (error.error) {
            console.error('Error details:', error.error);
          }
          
          // Get current user from localStorage as backup
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            console.log('Using current user from localStorage as fallback');
            // Ensure all game stats are numbers
            return of(this.ensureNumericStats(currentUser));
          }
          
          // If no current user, try basic profile as fallback
          console.log('Trying basic profile as fallback...');
          return this.getBasicProfile();
        })
      );
  }
  
  // Helper method to try to find nested data structure
  private tryFindNestedData(response: any): UserProfileResponse | null {
    // Check if there's a data property
    if (response.data && typeof response.data === 'object') {
      console.log('Found nested data in response.data');
      return response.data;
    }
    
    // Check if there's a user property
    if (response.user && typeof response.user === 'object') {
      console.log('Found nested data in response.user');
      return response.user;
    }
    
    // Check if there's a profile property
    if (response.profile && typeof response.profile === 'object') {
      console.log('Found nested data in response.profile');
      return response.profile;
    }
    
    return null;
  }
  
  // Helper method to ensure all user stats are numbers
  private ensureNumericStats(user: User): User {
    const result = { ...user };
    
    if (user.totalGames !== undefined) {
      result.totalGames = Number(user.totalGames) || 0;
    } else {
      result.totalGames = 0;
    }
    
    if (user.gamesWon !== undefined) {
      result.gamesWon = Number(user.gamesWon) || 0;
    } else {
      result.gamesWon = 0;
    }
    
    if (user.gamesLost !== undefined) {
      result.gamesLost = Number(user.gamesLost) || 0;
    } else {
      result.gamesLost = 0;
    }
    
    if (user.lifetimeEarnings !== undefined) {
      result.lifetimeEarnings = Number(user.lifetimeEarnings) || 0;
    } else {
      result.lifetimeEarnings = 0;
    }
    
    if (user.highestWin !== undefined) {
      result.highestWin = Number(user.highestWin) || 0;
    } else {
      result.highestWin = 0;
    }
    
    if (user.balance !== undefined) {
      result.balance = Number(user.balance) || 0;
    } else {
      result.balance = 0;
    }
    
    return result;
  }
  
  // Create a fallback user with default values
  private getFallbackUser(): User {
    const currentUser = this.authService.getCurrentUser();
    
    // Use current user as baseline if available
    if (currentUser) {
      return this.ensureNumericStats(currentUser);
    }
    
    // Otherwise create a basic user
    return {
      username: 'Guest User',
      balance: 0,
      role: 'USER',
      totalGames: 0,
      gamesWon: 0,
      gamesLost: 0,
      lifetimeEarnings: 0,
      highestWin: 0,
      status: 'ACTIVE'
    };
  }

  private mapProfileResponseToUser(response: UserProfileResponse): User {
    console.log('mapProfileResponseToUser called with response:', JSON.stringify(response, null, 2));
    
    // Check for missing or null fields
    if (!response.totalGames && response.totalGames !== 0) {
      console.warn('totalGames is missing or null in response!');
    }
    if (!response.gamesWon && response.gamesWon !== 0) {
      console.warn('gamesWon is missing or null in response!');
    }
    if (!response.gamesLost && response.gamesLost !== 0) {
      console.warn('gamesLost is missing or null in response!');
    }
    if (!response.lifetimeEarnings && response.lifetimeEarnings !== 0) {
      console.warn('lifetimeEarnings is missing or null in response!');
    }
    
    // SUPER AGGRESSIVE TYPE CONVERSION
    // Try multiple approaches to ensure we get valid numbers
    
    let totalGames = 0;
    if (response.totalGames !== undefined && response.totalGames !== null) {
      const converted = Number(response.totalGames);
      if (!isNaN(converted)) {
        totalGames = converted;
      } else {
        totalGames = parseInt(String(response.totalGames), 10) || 0;
      }
    }
    
    let gamesWon = 0;
    if (response.gamesWon !== undefined && response.gamesWon !== null) {
      const converted = Number(response.gamesWon);
      if (!isNaN(converted)) {
        gamesWon = converted;
      } else {
        gamesWon = parseInt(String(response.gamesWon), 10) || 0;
      }
    }
    
    let gamesLost = 0;
    if (response.gamesLost !== undefined && response.gamesLost !== null) {
      const converted = Number(response.gamesLost);
      if (!isNaN(converted)) {
        gamesLost = converted;
      } else {
        gamesLost = parseInt(String(response.gamesLost), 10) || 0;
      }
    }
    
    let lifetimeEarnings = 0;
    if (response.lifetimeEarnings !== undefined && response.lifetimeEarnings !== null) {
      const converted = Number(response.lifetimeEarnings);
      if (!isNaN(converted)) {
        lifetimeEarnings = converted;
      } else {
        lifetimeEarnings = parseFloat(String(response.lifetimeEarnings)) || 0;
      }
    }
    
    let highestWin = 0;
    if (response.highestWin !== undefined && response.highestWin !== null) {
      const converted = Number(response.highestWin);
      if (!isNaN(converted)) {
        highestWin = converted;
      } else {
        highestWin = parseFloat(String(response.highestWin)) || 0;
      }
    }
    
    // Force balance to be a number
    let balance = 0;
    if (response.balance !== undefined && response.balance !== null) {
      const converted = Number(response.balance);
      if (!isNaN(converted)) {
        balance = converted;
      } else {
        balance = parseFloat(String(response.balance)) || 0;
      }
    }
    
    console.log('Values after SUPER AGGRESSIVE conversion:');
    console.log('- totalGames:', totalGames, `(${typeof totalGames})`);
    console.log('- gamesWon:', gamesWon, `(${typeof gamesWon})`);
    console.log('- gamesLost:', gamesLost, `(${typeof gamesLost})`);
    console.log('- lifetimeEarnings:', lifetimeEarnings, `(${typeof lifetimeEarnings})`);
    console.log('- highestWin:', highestWin, `(${typeof highestWin})`);
    console.log('- balance:', balance, `(${typeof balance})`);
    
    const mappedUser: User = {
      id: response.id?.toString(),
      username: response.username || 'Unknown User',
      balance: balance,
      role: response.role || 'USER',
      createdAt: response.createdAt ? new Date(response.createdAt) : new Date(),
      email: response.email || '',
      totalGames: totalGames,
      gamesWon: gamesWon,
      gamesLost: gamesLost,
      lifetimeEarnings: lifetimeEarnings,
      highestWin: highestWin,
      status: response.status || 'ACTIVE',
      lastActive: response.lastActive ? new Date(response.lastActive) : new Date()
    };
    
    console.log('Mapped user result:', JSON.stringify(mappedUser, null, 2));
    return mappedUser;
  }

  // Helper method to update the stored user data
  private updateStoredUserData(user: User): void {
    // Get current user from localStorage
    const storedUserJson = localStorage.getItem('currentUser');
    if (storedUserJson) {
      try {
        const storedUser = JSON.parse(storedUserJson);
        
        // Update with new data while preserving existing fields
        const updatedUser = {
          ...storedUser,
          ...user,
          // Force these to be numbers again just to be extra safe
          totalGames: Number(user.totalGames) || 0,
          gamesWon: Number(user.gamesWon) || 0,
          gamesLost: Number(user.gamesLost) || 0,
          lifetimeEarnings: Number(user.lifetimeEarnings) || 0,
          highestWin: Number(user.highestWin) || 0,
          balance: Number(user.balance) || 0
        };
        
        console.log('Updating localStorage with user data:', JSON.stringify(updatedUser, null, 2));
        
        // Store back in localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Also update in auth service
        this.authService.updateCurrentUser(updatedUser);
      } catch (e) {
        console.error('Error updating stored user data:', e);
      }
    } else {
      console.log('No stored user found in localStorage, creating new entry');
      // Create new entry in localStorage
      const userToStore = {
        ...user,
        // Force these to be numbers again just to be extra safe
        totalGames: Number(user.totalGames) || 0,
        gamesWon: Number(user.gamesWon) || 0,
        gamesLost: Number(user.gamesLost) || 0,
        lifetimeEarnings: Number(user.lifetimeEarnings) || 0,
        highestWin: Number(user.highestWin) || 0,
        balance: Number(user.balance) || 0
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      this.authService.updateCurrentUser(userToStore);
    }
  }

  // Add method to deposit funds
  depositFunds(amount: number): Observable<User> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.apiUrl}/deposit`, 
      { amount }, 
      { headers }
    ).pipe(
      map(response => {
        // Extract user data from response
        const userData = response.user || response;
        
        // Map to User model
        const user: User = {
          username: userData.username,
          balance: userData.balance,
          role: userData.role,
          id: userData.id?.toString(),
          createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined
        };
        
        // Update stored user data
        this.updateStoredUserData(user);
        
        return user;
      }),
      catchError(error => {
        console.error('Deposit funds error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to deposit funds'));
      })
    );
  }
} 