import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, History, CreditCard, LogOut, ChevronRight, Calendar, ArrowRight } from 'lucide-angular';
import { HeaderComponent } from '../../components/header/header.component';
import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { GameHistory } from '../../models/game-history.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    HeaderComponent,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen text-white flex flex-col bg-black">
      <div class="absolute inset-0 bg-gradient-to-b from-[#ff0080]/20 via-[#40e0d0]/20 to-[#ff8c00]/20 pointer-events-none bg-gradient-animate"></div>
      
      <app-header [balance]="userBalance"></app-header>
      
      <div class="flex-1 flex py-2 sm:py-4 relative overflow-x-hidden">
        <!-- Left Sidebar - Moved up by reducing top padding -->
        <div class="w-64 lg:w-72 flex-shrink-0 pl-2 sm:pl-4">
          <div class="top-2">
            <div class="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-pink-500/30 shadow-neon mb-4">
            <div>
                <button 
                  (click)="Back()" 
                  class="flex items-center gap-3 p-3 rounded-lg bg-black/30 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <lucide-icon name="arrow-left" [size]="18"></lucide-icon>
                </button>
              </div>
              <div class="flex flex-col items-center mb-6">
              
                <div class="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-4">
                  <lucide-icon name="user" [size]="32" class="text-white"></lucide-icon>
                </div>
                <h2 class="text-xl font-bold text-white mb-1">{{ username }}</h2>
                <p class="text-pink-300 text-sm">Member since {{ memberSince }}</p>
              </div>
              
              <div class="space-y-2">
                <a 
                  (click)="setActiveSection('profile')"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  [ngClass]="activeSection === 'profile' ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'"
                >
                  <lucide-icon name="user" [size]="18"></lucide-icon>
                  <span>Profile</span>
                  <lucide-icon *ngIf="activeSection === 'profile'" name="chevron-right" [size]="16" class="ml-auto"></lucide-icon>
                </a>
                <a 
                  (click)="setActiveSection('history')"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  [ngClass]="activeSection === 'history' ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'"
                >
                  <lucide-icon name="history" [size]="18"></lucide-icon>
                  <span>Game History</span>
                  <lucide-icon *ngIf="activeSection === 'history'" name="chevron-right" [size]="16" class="ml-auto"></lucide-icon>
                </a>
                <a 
                  (click)="setActiveSection('withdrawal')"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  [ngClass]="activeSection === 'withdrawal' ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'"
                >
                  <lucide-icon name="credit-card" [size]="18"></lucide-icon>
                  <span>Withdraw Money</span>
                  <lucide-icon *ngIf="activeSection === 'withdrawal'" name="chevron-right" [size]="16" class="ml-auto"></lucide-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 px-2 sm:px-4">
          <div class="max-w-4xl">
            <!-- Profile Section - Shown by default -->
            <section id="profile" *ngIf="activeSection === 'profile'" class="mb-8">
              <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-pink-500/30 shadow-neon">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-pink-300">
                  <lucide-icon name="user" [size]="20"></lucide-icon>
                  Profile Information
                </h2>
                
                <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <p class="text-pink-300 text-sm">Username</p>
                      <p class="text-white font-medium">{{ username }}</p>
                    </div>
                    <div class="space-y-2">
                      <p class="text-pink-300 text-sm">Email</p>
                      <p class="text-white font-medium">{{ email }}</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <p class="text-pink-300 text-sm">Member Since</p>
                      <p class="text-white font-medium flex items-center gap-2">
                        <lucide-icon name="calendar" [size]="16"></lucide-icon>
                        {{ memberSince }}
                      </p>
                    </div>
                    <div class="space-y-2">
                      <p class="text-pink-300 text-sm">Total Played Games</p>
                      <p class="text-white font-medium">{{ totalGames }}</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <p class="text-pink-300 text-sm">Current Balance</p>
                      <p class="text-white font-bold text-xl">₹{{ userBalance.toLocaleString() }}</p>
                    </div>
                    <div class="space-y-2">
                      <p class="text-pink-300 text-sm">Lifetime Earnings</p>
                      <p class="text-white font-medium" [ngClass]="lifetimeEarnings >= 0 ? 'text-green-400' : 'text-red-400'">
                        {{ lifetimeEarnings >= 0 ? '+' : '' }}₹{{ lifetimeEarnings.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- Game History Section - Shown only when activeSection is 'history' -->
            <section id="history" *ngIf="activeSection === 'history'" class="mb-8">
              <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-neon-blue">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-blue-300">
                  <lucide-icon name="history" [size]="20"></lucide-icon>
                  Game History
                </h2>
                
                <div *ngIf="gameHistory.length === 0" class="text-center py-8 text-white/50">
                  <p>No games played yet</p>
                </div>
                
                <div *ngIf="gameHistory.length > 0" class="overflow-x-auto -mx-4 sm:mx-0">
                  <div class="min-w-[600px] px-4 sm:px-0">
                    <table class="w-full">
                      <thead>
                        <tr class="text-blue-300 text-sm">
                          <th class="text-left pb-4">Date & Time</th>
                          <!--<th class="text-left pb-4">Game</th>-->
                          <th class="text-left pb-4">Amount</th>
                          <th class="text-left pb-4">Choice</th>
                          <th class="text-left pb-4">Outcome</th>
                          <th class="text-right pb-4">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr 
                          *ngFor="let game of gameHistory" 
                          [ngClass]="game.won ? 'text-green-300' : 'text-red-300'"
                          class="border-t border-blue-500/10"
                        >
                          <td class="py-4">{{ formatDateTime(game.timestamp) }}</td>
                          <!-- <td>{{ game.gameType }}</td> -->
                          <td>₹{{ game.bet.toLocaleString() }}</td>
                          <td class="capitalize">
                            <span>
                              {{ game.choice }}
                            </span>
                          </td>
                          <td class="capitalize">
                            <span>
                              {{ game.outcome }}
                            </span>
                          </td>
                          <td class="text-right font-medium">
                            {{ game.won ? '+' : '-' }}₹{{ game.bet.toLocaleString() }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div *ngIf="hasMoreHistory" class="mt-6 text-center">
                  <app-button
                    (onClick)="loadMoreHistory()"
                    [disabled]="loadingMoreHistory"
                    className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 border border-blue-500/30"
                    fontSize="0.875rem"
                    padding="0.625rem 1.25rem"
                  >
                    <span *ngIf="!loadingMoreHistory">Load More</span>
                    <span *ngIf="loadingMoreHistory">Loading...</span>
                  </app-button>
                </div>
              </div>
            </section>
            
            <!-- Withdrawal Request Section - Shown only when activeSection is 'withdrawal' -->
            <section id="withdrawal" *ngIf="activeSection === 'withdrawal'" class="mb-8">
              <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30 shadow-neon-yellow">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-yellow-300">
                  <lucide-icon name="credit-card" [size]="20"></lucide-icon>
                  Withdraw Money
                </h2>
                
                <div *ngIf="withdrawalSuccess" class="mb-6 bg-green-500/20 text-green-400 p-4 rounded-lg flex items-start gap-3">
                  <lucide-icon name="check-circle" [size]="20" class="mt-0.5"></lucide-icon>
                  <div>
                    <p class="font-medium">Withdrawal Request Successful!</p>
                    <p class="text-sm mt-1">Your request for ₹{{ lastWithdrawalAmount.toLocaleString() }} has been submitted and will be processed within 24-48 hours.</p>
                  </div>
                </div>
                
                <div *ngIf="withdrawalError" class="mb-6 bg-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
                  <lucide-icon name="alert-triangle" [size]="20" class="mt-0.5"></lucide-icon>
                  <div>
                    <p class="font-medium">Withdrawal Request Failed</p>
                    <p class="text-sm mt-1">{{ withdrawalError }}</p>
                  </div>
                </div>
                
                <form (submit)="submitWithdrawal($event)" class="space-y-6">
                  <div>
                    <label for="amount" class="block text-yellow-300 text-sm mb-2">Withdrawal Amount (₹)</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">₹</span>
                      <input 
                        type="number"
                        id="amount"
                        name="amount"
                        [(ngModel)]="withdrawalAmount"
                        min="100"
                        [max]="userBalance"
                        required
                        class="w-full bg-black/30 border border-yellow-500/30 rounded-lg py-3 px-10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                        placeholder="Enter amount"
                      />
                    </div>
                    <p class="text-xs text-white/50 mt-1">Minimum withdrawal: ₹100</p>
                  </div>
                  
                  <div>
                    <label for="payment_method" class="block text-yellow-300 text-sm mb-2">Payment Method</label>
                    <select 
                      id="payment_method"
                      name="payment_method"
                      [(ngModel)]="paymentMethod"
                      required
                      class="w-full bg-black/30 border border-yellow-500/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                    >
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="paytm">Paytm</option>
                    </select>
                  </div>
                  
                  <div *ngIf="paymentMethod === 'upi'">
                    <label for="upi_id" class="block text-yellow-300 text-sm mb-2">UPI ID</label>
                    <input 
                      type="text"
                      id="upi_id"
                      name="upi_id"
                      [(ngModel)]="upiId"
                      required
                      class="w-full bg-black/30 border border-yellow-500/30 rounded-lg py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                      placeholder="e.g. yourname@upi"
                    />
                  </div>
                  
                  <div *ngIf="paymentMethod === 'bank_transfer'">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label for="account_number" class="block text-yellow-300 text-sm mb-2">Account Number</label>
                        <input 
                          type="text"
                          id="account_number"
                          name="account_number"
                          [(ngModel)]="accountNumber"
                          required
                          class="w-full bg-black/30 border border-yellow-500/30 rounded-lg py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                          placeholder="Enter account number"
                        />
                      </div>
                      <div>
                        <label for="ifsc" class="block text-yellow-300 text-sm mb-2">IFSC Code</label>
                        <input 
                          type="text"
                          id="ifsc"
                          name="ifsc"
                          [(ngModel)]="ifscCode"
                          required
                          class="w-full bg-black/30 border border-yellow-500/30 rounded-lg py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                          placeholder="e.g. SBIN0001234"
                        />
                      </div>
                    </div>
                    <div class="mt-4">
                      <label for="account_name" class="block text-yellow-300 text-sm mb-2">Account Holder Name</label>
                      <input 
                        type="text"
                        id="account_name"
                        name="account_name"
                        [(ngModel)]="accountName"
                        required
                        class="w-full bg-black/30 border border-yellow-500/30 rounded-lg py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                        placeholder="Enter account holder name"
                      />
                    </div>
                  </div>
                  
                  <div *ngIf="paymentMethod === 'paytm'">
                    <label for="paytm_number" class="block text-yellow-300 text-sm mb-2">Paytm Number</label>
                    <input 
                      type="text"
                      id="paytm_number"
                      name="paytm_number"
                      [(ngModel)]="paytmNumber"
                      required
                      class="w-full bg-black/30 border border-yellow-500/30 rounded-lg py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                      placeholder="Enter Paytm mobile number"
                    />
                  </div>
                  
                  <div class="pt-2">
                    <app-button
                      type="submit"
                      [disabled]="withdrawalProcessing || withdrawalAmount < 100 || withdrawalAmount > userBalance"
                      className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white disabled:opacity-50 shadow-neon-yellow"
                      fontSize="1rem"
                      padding="0.75rem 1.5rem"
                    >
                      <span *ngIf="!withdrawalProcessing" class="flex items-center justify-center gap-2">
                        Request Withdrawal <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
                      </span>
                      <span *ngIf="withdrawalProcessing">Processing...</span>
                    </app-button>
                  </div>
                </form>
                
                <div class="mt-6 pt-6 border-t border-yellow-500/20">
                  <h3 class="text-lg font-medium text-yellow-300 mb-4">Recent Withdrawals</h3>
                  
                  <div *ngIf="withdrawalHistory.length === 0" class="text-center py-4 text-white/50">
                    <p>No withdrawal history found</p>
                  </div>
                  
                  <div *ngIf="withdrawalHistory.length > 0" class="space-y-4">
                    <div *ngFor="let withdrawal of withdrawalHistory" class="bg-black/30 rounded-lg p-4 border border-yellow-500/10">
                      <div class="flex justify-between items-start">
                        <div>
                          <p class="font-medium text-white">₹{{ withdrawal.amount.toLocaleString() }}</p>
                          <p class="text-sm text-white/70 mt-1">
                            {{ formatDate(withdrawal.timestamp) }} via {{ formatPaymentMethod(withdrawal.method) }}
                          </p>
                        </div>
                        <div class="px-3 py-1 rounded-full text-xs font-medium" 
                             [ngClass]="{
                               'bg-green-500/20 text-green-400': withdrawal.status === 'completed',
                               'bg-yellow-500/20 text-yellow-400': withdrawal.status === 'pending',
                               'bg-red-500/20 text-red-400': withdrawal.status === 'failed'
                             }">
                          {{ formatStatus(withdrawal.status) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shadow-neon {
      box-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
    }
    
    .shadow-neon-blue {
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    }
    
    .shadow-neon-yellow {
      box-shadow: 0 0 10px rgba(234, 179, 8, 0.3);
    }
    
    .shadow-neon-red {
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
    }
    
    .neon-text {
      text-shadow: 0 0 5px rgba(236, 72, 153, 0.5);
    }
    
    .bg-gradient-animate {
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }
    
    @keyframes gradient {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = 'user@example.com'; // Default email
  memberSince: string = '';
  userBalance: number = 0;
  totalGames: number = 0;
  lifetimeEarnings: number = 0;
  
  // Active section tracking
  activeSection: 'profile' | 'history' | 'withdrawal' = 'profile';
  
  // Game History
  gameHistory: GameHistory[] = [];
  historyPage: number = 1;
  hasMoreHistory: boolean = true;
  loadingMoreHistory: boolean = false;
  
  // Withdrawal
  withdrawalAmount: number = 0;
  paymentMethod: string = 'upi';
  upiId: string = '';
  accountNumber: string = '';
  ifscCode: string = '';
  accountName: string = '';
  paytmNumber: string = '';
  withdrawalProcessing: boolean = false;
  withdrawalSuccess: boolean = false;
  withdrawalError: string | null = null;
  lastWithdrawalAmount: number = 0;
  withdrawalHistory: any[] = [];
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.username = currentUser.username;
    this.userBalance = currentUser.balance;
    
    // Initialize data on component load
    this.memberSince = new Date(2023, 8, 15).toLocaleDateString();
    this.totalGames = 47;
    this.lifetimeEarnings = 2500;
    
    // Load initial data for all sections
    this.loadGameHistory();
    this.loadWithdrawalHistory();
  }
  
  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }
  
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }
  
  formatPaymentMethod(method: string): string {
    switch (method) {
      case 'upi': return 'UPI';
      case 'bank_transfer': return 'Bank Transfer';
      case 'paytm': return 'Paytm';
      default: return method;
    }
  }
  
  formatStatus(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Processing';
      case 'failed': return 'Failed';
      default: return status;
    }
  }
  
  loadGameHistory(): void {
    // Don't reload if we already have data
    if (this.gameHistory.length > 0 && this.historyPage === 1) {
      return;
    }
    
    // Simulate API call
    this.loadingMoreHistory = true;
    setTimeout(() => {
      // Mock game history data
      const newGames = [
        {
          gameType: 'Coin Flip',
          bet: 100,
          choice: 'heads',
          outcome: 'heads',
          won: true,
          winAmount: 100,
          timestamp: new Date(2025, 2, 2, 14, 35)
        },
        {
          gameType: 'Coin Flip',
          bet: 500,
          choice: 'tails',
          outcome: 'heads',
          won: false,
          winAmount: -500,
          timestamp: new Date(2025, 2, 2, 12, 20)
        },
        {
          gameType: 'Coin Flip',
          bet: 1000,
          choice: 'heads',
          outcome: 'tails',
          won: false,
          winAmount: -1000,
          timestamp: new Date(2025, 2, 1, 18, 45)
        },
        {
          gameType: 'Coin Flip',
          bet: 100,
          choice: 'tails',
          outcome: 'tails',
          won: true,
          winAmount: 100,
          timestamp: new Date(2025, 2, 1, 16, 10)
        },
        {
          gameType: 'Coin Flip',
          bet: 500,
          choice: 'heads',
          outcome: 'heads',
          won: true,
          winAmount: 500,
          timestamp: new Date(2025, 2, 1, 12, 5)
        }
      ];
      
      // Add to game history
      this.gameHistory = [...this.gameHistory, ...newGames];
      this.loadingMoreHistory = false;
      
      // Check if more data is available (simulate pagination)
      if (this.historyPage >= 3) {
        this.hasMoreHistory = false;
      }
    }, 1000);
  }
  
  loadMoreHistory(): void {
    this.historyPage++;
    this.loadGameHistory();
  }
  
  loadWithdrawalHistory(): void {
    // Don't reload if we already have data
    if (this.withdrawalHistory.length > 0) {
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      // Mock withdrawal history data
      this.withdrawalHistory = [
        {
          amount: 5000,
          method: 'bank_transfer',
          status: 'completed',
          timestamp: new Date(2025, 1, 25)
        },
        {
          amount: 2000,
          method: 'upi',
          status: 'pending',
          timestamp: new Date(2025, 2, 2)
        }
      ];
    }, 800);
  }
  
  // Method that gets called when clicking on a section
  setActiveSection(section: 'profile' | 'history' | 'withdrawal'): void {
    this.activeSection = section;
  }
  
  submitWithdrawal(event: Event): void {
    event.preventDefault();
    
    // Input validation
    if (this.withdrawalAmount < 100) {
      this.withdrawalError = 'Minimum withdrawal amount is ₹100';
      return;
    }
    
    if (this.withdrawalAmount > this.userBalance) {
      this.withdrawalError = 'Withdrawal amount cannot exceed your current balance';
      return;
    }
    
    // Reset error state
    this.withdrawalError = null;
    this.withdrawalProcessing = true;
    
    // Simulate API call
    setTimeout(() => {
      // For demo purposes, assume successful withdrawal
      this.withdrawalProcessing = false;
      this.withdrawalSuccess = true;
      this.lastWithdrawalAmount = this.withdrawalAmount;
      
      // Add to withdrawal history
      this.withdrawalHistory.unshift({
        amount: this.withdrawalAmount,
        method: this.paymentMethod,
        status: 'pending',
        timestamp: new Date()
      });
      
      // Update balance
      this.userBalance -= this.withdrawalAmount;
      
      // Reset form
      this.withdrawalAmount = 0;
      this.upiId = '';
      this.accountNumber = '';
      this.ifscCode = '';
      this.accountName = '';
      this.paytmNumber = '';
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        this.withdrawalSuccess = false;
      }, 5000);
    }, 2000);
  }
  
  Back(): void {
    this.router.navigate(['/game']);
  }
}