import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Coins, Plus, History, Sparkles, AlertTriangle } from 'lucide-angular';
import { ButtonComponent } from '../../components/button/button.component';
import { CoinSvgComponent } from '../../components/coin-svg/coin-svg.component';
import { PaymentPageComponent } from '../../components/payment/payment-page.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GameHistory } from '../../models/game-history.model';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-coin-flip-game',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    ButtonComponent, 
    CoinSvgComponent,
    PaymentPageComponent,
    HeaderComponent
  ],
  templateUrl: './coin-flip-game.component.html',
  styleUrls: ['./coin-flip-game.component.css']
})
export class CoinFlipGameComponent implements OnInit {
  username: string = '';
  balance: number = 0;
  bet: number = 500;
  isFlipping: boolean = false;
  result: string | null = null;
  history: GameHistory[] = [];
  showAddFunds: boolean = false;
  choice: string | null = null;
  latestWin: number | null = null;
  latestLoss: number | null = null;
  betAmounts: number[] = [500, 2000, 5000, 10000];
  gameType: string = 'Coin Flip';
  isAddingFunds: boolean = false;
  fundAddError: string | null = null;

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private profileService: ProfileService,
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone
  ) {}
  
  ngOnInit(): void {
    // First get user from local storage
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Set initial values from localStorage
    this.username = currentUser.username;
    this.balance = currentUser.balance ?? 0;
    
    // Then refresh from the backend to get the latest data
    this.authService.refreshCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          console.log('User data refreshed from backend:', user);
          this.username = user.username;
          this.balance = user.balance ?? 0;
        }
      },
      error: (error) => {
        console.error('Failed to refresh user data:', error);
        // Continue with existing data from localStorage
      }
    });
    
    // Load game history
    this.loadGameHistory();
  }
  
  loadGameHistory(): void {
    console.log('CoinFlipGameComponent - Loading game history');
    
    // Check authentication status first
    if (!this.authService.isLoggedIn()) {
      console.error('User is not logged in, cannot load history');
      return;
    }

    // Add a loader or placeholder if needed
    this.history = [];
    
    this.gameService.getGameHistory().subscribe({
      next: (history) => {
        console.log('History loaded successfully, items:', history?.length || 0);
        
        if (Array.isArray(history)) {
          // Ensure all timestamps are properly converted to Date objects
          let processedHistory = history.map(item => {
            // Handle potential timestamp format issues
            if (item.timestamp && !(item.timestamp instanceof Date)) {
              return {
                ...item,
                timestamp: new Date(item.timestamp)
              };
            }
            return item;
          });
          
          // Sort history by timestamp (newest first)
          processedHistory.sort((a, b) => {
            const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
            const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
            return dateB.getTime() - dateA.getTime();
          });
          
          // Only show the 10 most recent games
          this.history = processedHistory.slice(0, 10);
        } else {
          console.error('History data is not an array:', history);
          this.history = [];
        }
      },
      error: (error) => {
        console.error('Failed to load game history:', error);
        
        // If token is invalid, try refreshing user session
        if (error.message === 'Session expired. Please log in again.') {
          this.authService.refreshCurrentUser().subscribe({
            next: (user) => {
              if (user) {
                // Try loading history again after refreshing user
                this.loadGameHistory();
              } else {
                this.router.navigate(['/login']);
              }
            },
            error: () => this.router.navigate(['/login'])
          });
        }
      }
    });
  }

  formatDateTime(date: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  }

  setBet(amount: number): void {
    this.bet = amount;
  }

  addFunds(amount: number): void {
    if (this.isAddingFunds) return;
    
    this.isAddingFunds = true;
    this.fundAddError = null;
    
    this.profileService.depositFunds(amount).subscribe({
      next: (user) => {
        this.balance = user.balance ?? 0;
        this.isAddingFunds = false;
        this.showAddFunds = false;
      },
      error: (error) => {
        console.error('Failed to add funds:', error);
        this.fundAddError = error.message || 'Failed to add funds. Please try again.';
        this.isAddingFunds = false;
      }
    });
  }

  handleFlip(selectedChoice: string): void {
    if (this.balance < this.bet || this.isFlipping) return;
    
    this.choice = selectedChoice;
    this.isFlipping = true;
    this.latestWin = null;
    this.latestLoss = null;
    
    // Call the game service to play the game
    this.gameService.playGame(this.bet, selectedChoice).subscribe({
      next: (gameResult) => {
        console.log('Game API call succeeded:', gameResult);
        // Wait for animation to complete
        setTimeout(() => {
          this.result = gameResult.outcome;
          
          if (gameResult.won) {
            this.latestWin = gameResult.winAmount;
          } else {
            this.latestLoss = this.bet;
          }
          
          // Refresh user data from backend to get the correct balance
          this.authService.refreshCurrentUser().subscribe({
            next: (user) => {
              if (user) {
                console.log('User data refreshed after game:', user);
                this.balance = user.balance ?? 0;
                
                // Update user in auth service with the new balance
                const currentUser = this.authService.getCurrentUser();
                if (currentUser) {
                  const updatedUser: User = {
                    ...currentUser,
                    balance: this.balance
                  };
                  this.authService.updateCurrentUser(updatedUser);
                }
              }
            },
            error: (error) => {
              console.error('Failed to refresh user data after game:', error);
            }
          });
          
          // Add new game to history and maintain the 10 item limit
          this.history.unshift(gameResult);
          if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
          }
          
          // Reset flipping state
          setTimeout(() => {
            this.isFlipping = false;
          }, 500);
        }, 2000); // Match the animation duration
      },
      error: (error) => {
        console.error('Game API call failed:', error);
        this.isFlipping = false;
      }
    });
  }
}