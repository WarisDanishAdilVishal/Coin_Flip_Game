import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Coins, Plus, History, Sparkles, AlertTriangle } from 'lucide-angular';
import { ButtonComponent } from '../button/button.component';
import { CoinSvgComponent } from '../coin-svg/coin-svg.component';
import { PaymentPageComponent } from '../payment/payment-page.component';
import { HeaderComponent } from '../header/header.component';
import { GameHistory } from '../../models/game-history.model';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
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
  template: `
    <div class="min-h-screen text-white flex flex-col bg-black">
      <div class="absolute inset-0 bg-gradient-to-b from-[#ff0080]/20 via-[#40e0d0]/20 to-[#ff8c00]/20 pointer-events-none bg-gradient-animate"></div>
      
      <app-header [balance]="balance"></app-header>
      
      <div class="flex-1 flex flex-col items-center py-4 sm:py-8 relative overflow-hidden">
        <div class="relative w-full max-w-7xl mx-auto px-2 sm:px-4">
          <div class="neon-frame mt-4">
            <div class="neon-content">
              <div class="bg-black/90 p-4 sm:p-8 rounded-[20px] backdrop-blur-xl">
                <div class="mb-6 sm:mb-12">
                  <div class="bg-black/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 border border-pink-500/30 shadow-neon">
                    <div class="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div class="flex flex-col">
                        <span class="text-sm text-pink-300 neon-text">Balance</span>
                        <div class="flex items-center gap-2">
                          <lucide-icon name="coins" [size]="20" class="text-yellow-400 floating"></lucide-icon>
                          <span class="text-xl sm:text-2xl font-bold neon-text text-glow">₹{{ balance.toLocaleString() }}</span>
                        </div>
                      </div>
                      <div class="w-px h-12 bg-pink-500/20 hidden sm:block"></div>
                      <div class="flex flex-col">
                        <span class="text-sm text-pink-300 neon-text">Current Bet</span>
                        <span class="text-xl sm:text-2xl font-bold neon-text">₹{{ bet.toLocaleString() }}</span>
                      </div>
                    </div>
                    <app-button 
                      (onClick)="showAddFunds = true" 
                      className="w-full sm:w-auto bg-gradient-to-r from-pink-500/30 to-purple-500/30 hover:from-pink-500/50 hover:to-purple-500/50 text-pink-300 border border-pink-400/30 shadow-neon btn-pulse"
                      fontSize="0.875rem"
                      padding="0.625rem 1.25rem"
                    >
                      <lucide-icon name="plus" [size]="16" class="mr-2"></lucide-icon> Add Funds
                    </app-button>
                  </div>
                </div>
                
                <div class="flex flex-col gap-6 sm:gap-8">
                  <div class="flex flex-col lg:flex-row gap-6 sm:gap-8">
                    <div class="flex-1 flex flex-col gap-6 sm:gap-8">
                      <div class="bg-black/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-blue-500/30 shadow-neon-blue">
                        <h3 class="text-sm text-blue-300 mb-4 neon-text">Select Bet Amount</h3>
                        <div class="grid grid-cols-2 gap-3">
                          <app-button
                            *ngFor="let amount of betAmounts"
                            (onClick)="setBet(amount)"
                            [className]="bet === amount
                              ? 'h-12 sm:h-14 text-base sm:text-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-neon-blue w-full' 
                              : 'h-12 sm:h-14 text-base sm:text-lg font-medium transition-all duration-300 bg-black/30 hover:bg-black/50 text-blue-300 border border-blue-500/30 w-full'"
                            fontSize="1rem"
                            padding="0.5rem 1rem"
                          >
                            ₹{{ amount.toLocaleString() }}
                          </app-button>
                        </div>
                      </div>

                      <div class="bg-black/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-yellow-500/30 shadow-neon-yellow">
                        <h3 class="text-sm text-yellow-300 mb-4 neon-text">Make Your Choice</h3>
                        <div class="grid grid-cols-2 gap-3 sm:gap-4">
                          <app-button
                            (onClick)="handleFlip('heads')"
                            [disabled]="isFlipping || balance < bet"
                            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 h-14 sm:h-16 text-lg sm:text-xl font-medium disabled:opacity-50 shadow-neon-yellow w-full"
                            fontSize="1.25rem"
                            padding="0.75rem 1.5rem"
                          >
                            Heads
                          </app-button>
                          <app-button
                            (onClick)="handleFlip('tails')"
                            [disabled]="isFlipping || balance < bet"
                            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 h-14 sm:h-16 text-lg sm:text-xl font-medium disabled:opacity-50 shadow-neon-yellow w-full"
                            fontSize="1.25rem"
                            padding="0.75rem 1.5rem"
                          >
                            Tails
                          </app-button>
                        </div>
                      </div>
                    </div>

                    <div class="flex-1">
                      <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-pink-500/30 shadow-neon flex items-center justify-center relative h-80 sm:h-96 lg:h-full min-h-[320px]">
                        <div 
                          class="relative w-36 h-36 sm:w-48 sm:h-48 transition-all duration-[2000ms] ease-in-out transform"
                          [ngClass]="{'animate-flip': isFlipping}"
                          style="transform-style: preserve-3d; perspective: 1000px"
                        >
                          <div class="w-full h-full transition-all duration-500 transform"
                               [ngClass]="isFlipping ? 'scale-90' : 'scale-100'"
                          >
                            <app-coin-svg [side]="isFlipping ? null : result"></app-coin-svg>
                          </div>
                        </div>
                        <div *ngIf="latestWin" class="absolute top-4 left-0 right-0 flex justify-center result-message">
                          <div class="bg-green-500/20 text-green-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-neon text-sm sm:text-base">
                            <lucide-icon name="sparkles" [size]="16"></lucide-icon>
                            Won ₹{{ latestWin.toLocaleString() }}!
                          </div>
                        </div>
                        <div *ngIf="latestLoss" class="absolute top-4 left-0 right-0 flex justify-center result-message">
                          <div class="bg-red-500/20 text-red-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-neon-red text-sm sm:text-base">
                            <lucide-icon name="alert-triangle" [size]="16"></lucide-icon>
                            Lost ₹{{ latestLoss.toLocaleString() }}!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-black/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-blue-500/30 shadow-neon-blue">
                    <div class="flex items-center justify-between text-blue-300 mb-4">
                      <div class="flex items-center gap-2">
                        <lucide-icon name="history" [size]="16"></lucide-icon>
                        <span class="neon-text">Recent Games</span>
                      </div>
                      <span class="text-xs text-blue-300/70">Last 10 games</span>
                    </div>
                    <p *ngIf="history.length === 0" class="text-white/50 text-center py-4">No games played yet</p>
                    <div *ngIf="history.length > 0" class="overflow-x-auto -mx-4 sm:mx-0">
                      <div class="min-w-[600px] px-4 sm:px-0">
                        <table class="w-full">
                          <thead>
                            <tr class="text-blue-300 text-sm">
                              <th class="text-left pb-4">Date & Time</th>
                              <th class="text-left pb-4">Amount</th>
                              <th class="text-left pb-4">Choice</th>
                              <th class="text-left pb-4">Outcome</th>
                              <th class="text-right pb-4">Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr 
                              *ngFor="let h of history" 
                              [ngClass]="h.won ? 'text-green-300' : 'text-red-300'"
                              class="border-t border-blue-500/10"
                            >
                              <td class="py-4">{{ formatDateTime(h.timestamp) }}</td>
                              <td>₹{{ h.bet.toLocaleString() }}</td>
                              <td class="capitalize">{{ h.choice }}</td>
                              <td class="capitalize">{{ h.outcome }}</td>
                              <td class="text-right font-medium">
                                {{ h.won ? '+' : '-' }}₹{{ h.won ? h.winAmount.toLocaleString() : h.bet.toLocaleString() }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <app-payment-page 
        *ngIf="showAddFunds"
        (onClose)="showAddFunds = false"
        (onAddFunds)="addFunds($event)"
      ></app-payment-page>
    </div>
  `
})
export class CoinFlipGameComponent implements OnInit {
  username: string = '';
  balance: number = 0;
  bet: number = 100;
  isFlipping: boolean = false;
  result: string | null = null;
  history: GameHistory[] = [];
  showAddFunds: boolean = false;
  choice: string | null = null;
  latestWin: number | null = null;
  latestLoss: number | null = null;
  betAmounts: number[] = [100, 1000, 5000, 10000];
  gameType: string = 'Coin Flip';

  constructor(
    private authService: AuthService,
    private gameService: GameService,
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
    this.balance += amount;
    this.authService.updateUserBalance(amount);
    this.showAddFunds = false;
  }

  handleFlip(selectedChoice: string): void {
    if (this.balance < this.bet || this.isFlipping) return;
    
    this.choice = selectedChoice;
    this.isFlipping = true;
    this.latestWin = null;
    this.latestLoss = null;
    
    // Deduct bet amount from balance immediately for UI feedback
    this.balance -= this.bet;
    
    // Call the game service to play the game
    this.gameService.playGame(this.bet, selectedChoice).subscribe({
      next: (gameResult) => {
        console.log('Game API call succeeded:', gameResult);
        // Wait for animation to complete
        setTimeout(() => {
          this.result = gameResult.outcome;
          
          if (gameResult.won) {
            this.latestWin = gameResult.winAmount;
            // Update balance with winnings
            this.balance += gameResult.winAmount;
          } else {
            this.latestLoss = this.bet;
            // Balance already deducted
          }
          
          // Update user in auth service
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            const updatedUser: User = {
              username: currentUser.username,
              balance: this.balance,
              role: currentUser.role,
              id: currentUser.id,
              createdAt: currentUser.createdAt
            };
            this.authService.updateCurrentUser(updatedUser);
          }
          
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
        // Refund bet amount on error
        this.balance += this.bet;
        this.isFlipping = false;
      }
    });
  }
}