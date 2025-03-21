import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, History, CreditCard, LogOut, ChevronRight, Calendar, ArrowRight, Award, TrendingUp, Percent } from 'lucide-angular';
import { HeaderComponent } from '../../components/header/header.component';
import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { GameService } from '../../services/game.service';
import { GameHistory } from '../../models/game-history.model';
import { User as UserModel } from '../../models/user.model';
import { WithdrawalService } from '../../services/withdrawal.service';
import { WithdrawalRequest } from '../../models/withdrawal.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  memberSince: string = '';
  userBalance: number = 0;
  totalGames: number = 0;
  gamesWon: number = 0;
  gamesLost: number = 0;
  lifetimeEarnings: number = 0;
  highestWin: number = 0;
  status: string = 'ACTIVE';
  lastActive?: Date;
  winRate: number = 0;
  
  // Enable debug mode to see data details
  debugMode: boolean = false;
  
  activeSection: 'profile' | 'history' | 'withdrawal' = 'profile';
  
  gameHistory: GameHistory[] = [];
  allGames: GameHistory[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  loadingMoreHistory: boolean = false;
  historyLoadError: boolean = false;
  historyErrorMessage: string = '';
  pageSize: number = 7;
  totalGamesCount: number = 0;
  isLoadingHistory: boolean = false;
  errorMessage: string = '';
  
  withdrawalForm: FormGroup;
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
  withdrawalHistory: WithdrawalRequest[] = [];
  
  // Loading states
  isLoadingProfile: boolean = true;
  profileLoadError: boolean = false;
  
  // Add data caching mechanism to prevent data loss between tab switches
  private cachedProfileData: {
    hasLoaded: boolean;
    username: string;
    email: string;
    memberSince: string;
    userBalance: number;
    totalGames: number;
    gamesWon: number;
    gamesLost: number;
    lifetimeEarnings: number;
    highestWin: number;
    status: string;
    winRate: number;
  } = {
    hasLoaded: false,
    username: '',
    email: '',
    memberSince: '',
    userBalance: 0,
    totalGames: 0,
    gamesWon: 0,
    gamesLost: 0,
    lifetimeEarnings: 0,
    highestWin: 0,
    status: 'ACTIVE',
    winRate: 0
  };
  
  // Make Math available to the template
  Math = Math;
  
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private gameService: GameService,
    private withdrawalService: WithdrawalService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.withdrawalForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1000)]],
      method: ['upi'],
      details: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    console.log('Profile Component: Initializing...');
    this.isLoadingProfile = true;
    
    const currentUser = this.authService.getCurrentUser();
    console.log('Profile Component: Current user:', currentUser);
    
    if (!currentUser) {
      console.log('Profile Component: No user found, redirecting to login');
      this.router.navigate(['/login']);
      this.isLoadingProfile = false;
      return;
    }
    
    this.username = currentUser.username;
    this.userBalance = currentUser.balance || 0;
    
    // Load profile data
    this.fetchProfileData();
    
    // Load withdrawal history
    this.loadWithdrawalHistory();
    
    // Load game history
    this.loadGameHistory();
  }
  
  formatWithdrawalStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }
  
  loadProfileData(): void {
    this.fetchProfileData();
  }
  
  // New helper method to ensure all values are valid numbers
  private ensureNumericValues(): void {
    console.log('Ensuring all values are valid numbers');
    
    // Use Number constructor for clean conversion, with fallback to 0
    this.totalGames = Number(this.totalGames) || 0;
    this.gamesWon = Number(this.gamesWon) || 0;
    this.gamesLost = Number(this.gamesLost) || 0;
    this.lifetimeEarnings = Number(this.lifetimeEarnings) || 0;
    this.highestWin = Number(this.highestWin) || 0;
    this.winRate = Number(this.winRate) || 0;
    this.userBalance = Number(this.userBalance) || 0;
    
    console.log('After final number conversion:', {
      totalGames: this.totalGames,
      gamesWon: this.gamesWon,
      gamesLost: this.gamesLost,
      lifetimeEarnings: this.lifetimeEarnings,
      highestWin: this.highestWin,
      winRate: this.winRate,
      userBalance: this.userBalance
    });
  }
  
  fetchProfileData(): void {
    console.log('Fetching profile data from backend');
    this.isLoadingProfile = true;
    this.profileLoadError = false;
    
    // For debugging, dump localStorage contents
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    console.log('localStorage check before API call:');
    console.log('- token exists:', !!storedToken);
    console.log('- currentUser exists:', !!storedUser);
    
    // Force values to valid numbers before API call
    this.ensureNumericValues();
    
    this.profileService.getDetailedProfile().subscribe({
      next: (user: UserModel) => {
        console.log('API response received:', JSON.stringify(user, null, 2));
        
        if (!user) {
          console.error('Received empty user from API');
          this.profileLoadError = true;
          this.isLoadingProfile = false;
          // Even with error, try to force DOM update
          setTimeout(() => this.forceUpdateDOMValues(), 200);
          return;
        }
        
        // Update all profile fields with data from API - forcing number conversions
        this.username = user.username || this.username || 'Unknown User';
        this.email = user.email || this.email || (this.username + '@example.com');
        
        // Force convert balance to number
        if (user.balance !== undefined && user.balance !== null) {
          const balanceNum = Number(user.balance);
          this.userBalance = isNaN(balanceNum) ? 0 : balanceNum;
        }
        
        if (user.createdAt) {
          this.memberSince = this.formatDate(new Date(user.createdAt));
        }
        
        // Force values to be numbers with strict type checking and multiple fallbacks
        try {
          if (user.totalGames !== undefined && user.totalGames !== null) {
            const converted = Number(user.totalGames);
            this.totalGames = isNaN(converted) ? parseInt(String(user.totalGames), 10) || 0 : converted;
          }
          
          if (user.gamesWon !== undefined && user.gamesWon !== null) {
            const converted = Number(user.gamesWon);
            this.gamesWon = isNaN(converted) ? parseInt(String(user.gamesWon), 10) || 0 : converted;
          }
          
          if (user.gamesLost !== undefined && user.gamesLost !== null) {
            const converted = Number(user.gamesLost);
            this.gamesLost = isNaN(converted) ? parseInt(String(user.gamesLost), 10) || 0 : converted;
          }
          
          if (user.lifetimeEarnings !== undefined && user.lifetimeEarnings !== null) {
            const converted = Number(user.lifetimeEarnings);
            this.lifetimeEarnings = isNaN(converted) ? parseFloat(String(user.lifetimeEarnings)) || 0 : converted;
          }
          
          if (user.highestWin !== undefined && user.highestWin !== null) {
            const converted = Number(user.highestWin);
            this.highestWin = isNaN(converted) ? parseFloat(String(user.highestWin)) || 0 : converted;
          }
          
          if (user.status) {
            this.status = user.status;
          }
          
          // Final sanity check - ensure all values are numbers
          this.ensureNumericValues();
          
          // Calculate win rate - ensure we don't divide by zero
          if (this.totalGames > 0) {
            this.winRate = Math.round((this.gamesWon / this.totalGames) * 100);
            console.log('Win rate calculated after API update:', this.winRate);
          } else {
            this.winRate = 0;
          }
        } catch (error) {
          console.error('Error processing values from API:', error);
          // Don't reset values here - keep what we had from localStorage
        }
        
        // Re-log after updates to verify data is set
        console.log('After API update - Profile values:', {
          totalGames: this.totalGames,
          gamesWon: this.gamesWon,
          gamesLost: this.gamesLost,
          lifetimeEarnings: this.lifetimeEarnings,
          highestWin: this.highestWin
        });
        
        // Cache the updated data
        this.cacheProfileData();
        
        this.isLoadingProfile = false;
        
        // Multi-phased UI update strategy
        
        // 1. Immediate DOM update
        this.forceUpdateDOMValues();
        
        // 2. Delayed DOM update
        setTimeout(() => this.forceUpdateDOMValues(), 200);
        
        // 3. Comprehensive check after a delay
        setTimeout(() => {
          // Check if data is still not visible
          const statContainers = document.querySelectorAll('.bg-black\\/50 p-4 .text-xl.font-bold');
          let needsUpdate = false;
          
          if (statContainers) {
            statContainers.forEach(container => {
              if (!container.textContent || container.textContent === '...' || container.textContent === '0' || container.textContent === '0%') {
                needsUpdate = true;
              }
            });
          }
          
          if (needsUpdate) {
            console.log('Data still not showing after initial updates, trying tab refresh strategy');
            
            // Last resort: Simulate tab switch to force Angular to refresh the view
            if (this.activeSection === 'profile') {
              // Find and click the profile tab button to force Angular to re-render
              const profileTabButton = document.querySelector('a[class*="flex items-center gap-3 p-3 rounded-lg cursor-pointer"]:first-child');
              if (profileTabButton && profileTabButton instanceof HTMLElement) {
                // Store current state
                const currentSection = this.activeSection;
                
                // Switch away from profile briefly
                this.activeSection = 'history';
                
                // Force DOM update in this state
                setTimeout(() => {
                  // Switch back to profile
                  this.activeSection = 'profile';
                  
                  // Aggressive DOM update
                  setTimeout(() => this.forceUpdateDOMValues(), 50);
                }, 50);
              } else {
                // Just force DOM update again if we can't find the tab button
                this.forceUpdateDOMValues();
              }
            }
          }
        }, 500);
      },
      error: (error) => {
        console.error('Error fetching profile data:', error);
        this.profileLoadError = true;
        this.isLoadingProfile = false;
        
        // Even on error, ensure we have valid numbers
        this.ensureNumericValues();
        
        // And try to force DOM update anyway
        setTimeout(() => this.forceUpdateDOMValues(), 200);
      }
    });
  }
  
  formatDateTime(date: Date | string): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  }
  
  formatDate(date: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
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
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  }
  
  loadGameHistory(page: number = 1): void {
    this.isLoadingHistory = true;
    this.currentPage = page;
    console.log('Loading game history for page:', page);
    
    // Only fetch all games if we don't have them yet
    if (this.allGames.length === 0) {
      this.gameService.getGameHistory().subscribe({
        next: (allGames) => {
          console.log('Received all game history:', allGames);
          this.allGames = allGames;
          this.updatePageData();
        },
        error: (error) => {
          console.error('Error loading game history:', error);
          this.isLoadingHistory = false;
          this.errorMessage = 'Failed to load game history';
        }
      });
    } else {
      // If we already have the data, just update the page
      this.updatePageData();
    }
  }
  
  private updatePageData(): void {
    this.totalGamesCount = this.allGames.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalGamesCount / this.pageSize));
    
    // Calculate start and end indices for the current page
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    // Slice the data to show only the current page
    this.gameHistory = this.allGames.slice(startIndex, endIndex);
    
    this.isLoadingHistory = false;
    console.log('Pagination details:', {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalGames: this.totalGamesCount,
      gamesOnPage: this.gameHistory.length,
      pageSize: this.pageSize,
      startIndex,
      endIndex
    });
  }
  
  goToNextPage(): void {
    if (this.isLoadingHistory) {
      return;
    }

    const nextPage = this.currentPage + 1;
    if (nextPage <= this.totalPages) {
      this.currentPage = nextPage;
      this.updatePageData();
    }
  }
  
  goToPreviousPage(): void {
    if (this.isLoadingHistory) {
      return;
    }

    const prevPage = this.currentPage - 1;
    if (prevPage >= 1) {
      this.currentPage = prevPage;
      this.updatePageData();
    }
  }
  
  setActiveSection(section: 'profile' | 'history' | 'withdrawal'): void {
    const previousSection = this.activeSection;
    this.activeSection = section;
    
    // If switching to history tab, initialize pagination state
    if (section === 'history') {
      // Reset all history-related state
      this.gameHistory = [];
      this.currentPage = 1;
      this.totalPages = 1;
      this.totalGamesCount = 0;
      this.loadingMoreHistory = false;
      this.historyLoadError = false;
      this.historyErrorMessage = '';
      
      // Load first page of history
      this.loadGameHistory(1);
    }
    
    // If switching back to profile, make sure data is still there
    if (section === 'profile' && previousSection !== 'profile') {
      console.log('Switched back to profile section - ensuring data is visible');
      
      // If we had previously loaded data, restore from cache
      if (this.cachedProfileData.hasLoaded) {
        console.log('Restoring data from cache after tab switch');
        this.restoreFromCache();
      }
      
      // Check if we had a problem loading data previously or if data is empty
      if (this.profileLoadError || (this.totalGames === 0 && !this.isLoadingProfile)) {
        // Try loading profile data again
        this.fetchProfileData();
      }
      
      // Multiple update strategy for stubborn UI
      // 1. Immediate update attempt
      this.ensureNumericValues();
      this.forceUpdateDOMValues();
      
      // 2. Staggered updates to catch different timing issues
      setTimeout(() => this.forceUpdateDOMValues(), 50);
      setTimeout(() => this.forceUpdateDOMValues(), 300);
      setTimeout(() => {
        // Additional check - if data still not visible, try one more time
        console.log('Final data visibility check after section change');
        this.ensureNumericValues();
        this.forceUpdateDOMValues();
        
        // If we still don't see values, try to force more aggressively
        setTimeout(() => {
          const statContainers = document.querySelectorAll('.bg-black\\/50 p-4 .text-xl.font-bold');
          if (statContainers) {
            console.log('Super aggressive DOM update');
            // Force values directly on all stat containers
            statContainers.forEach((container, index) => {
              if (!container.textContent || container.textContent === '...' || container.textContent === '0' || container.textContent === '0%') {
                switch(index) {
                  case 0: // Total Games
                    container.textContent = String(this.totalGames || 0);
                    break;
                  case 1: // Games Won  
                    container.textContent = String(this.gamesWon || 0);
                    break;
                  case 2: // Games Lost
                    container.textContent = String(this.gamesLost || 0);
                    break;
                  case 3: // Win Rate
                    container.textContent = `${this.winRate || 0}%`;
                    break;
                }
              }
            });
          }
        }, 100);
      }, 500);
    }
  }
  
  submitWithdrawal() {
    if (!this.withdrawalForm.valid) {
      return;
    }

    const amount = this.withdrawalForm.get('amount')?.value;
    const method = this.withdrawalForm.get('method')?.value;
    const details = this.withdrawalForm.get('details')?.value;

    // Validate amount
    if (amount < 1000) {
      alert('Minimum withdrawal amount is ₹1000');
      return;
    }

    if (amount > this.userBalance) {
      alert('Insufficient balance');
      return;
    }

    // Validate payment method details
    if (!details) {
      alert('Please enter payment details');
      return;
    }

    // Convert method to uppercase to match backend enum
    const methodUpperCase = method.toUpperCase();

    this.withdrawalService.createWithdrawalRequest(amount, methodUpperCase, details).subscribe({
      next: (response) => {
        alert('Withdrawal request submitted successfully');
        this.withdrawalHistory.unshift({
          id: response.id,
          amount: response.amount,
          method: response.method,
          details: response.details,
          status: response.status.toLowerCase() as 'approved' | 'pending' | 'rejected',
          timestamp: response.timestamp
        });
        this.withdrawalForm.reset();
        this.userBalance -= amount;
        this.cacheProfileData();
      },
      error: (error) => {
        console.error('Error submitting withdrawal:', error);
        alert(error.error?.message || 'Failed to submit withdrawal request');
      }
    });
  }
  
  loadWithdrawalHistory(): void {
    this.withdrawalService.getWithdrawalHistory().subscribe({
      next: (history) => {
        this.withdrawalHistory = history.map(withdrawal => ({
          id: withdrawal.id,
          amount: withdrawal.amount,
          method: withdrawal.method,
          details: withdrawal.details,
          status: withdrawal.status.toLowerCase() as 'approved' | 'pending' | 'rejected',
          timestamp: withdrawal.timestamp
        }));
      },
      error: (error) => {
        console.error('Error loading withdrawal history:', error);
      }
    });
  }
  
  Back(): void {
    this.router.navigate(['/game']);
  }
  
  // Helper methods for caching profile data
  private cacheProfileData(): void {
    console.log('Caching profile data');
    this.cachedProfileData = {
      hasLoaded: true,
      username: this.username,
      email: this.email,
      memberSince: this.memberSince,
      userBalance: this.userBalance,
      totalGames: this.totalGames,
      gamesWon: this.gamesWon,
      gamesLost: this.gamesLost,
      lifetimeEarnings: this.lifetimeEarnings,
      highestWin: this.highestWin,
      status: this.status,
      winRate: this.winRate
    };
    
    // Also update localStorage through authService
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const updatedUser: UserModel = {
        ...currentUser,
        username: this.username,
        balance: this.userBalance,
        totalGames: this.totalGames,
        gamesWon: this.gamesWon,
        gamesLost: this.gamesLost,
        lifetimeEarnings: this.lifetimeEarnings,
        highestWin: this.highestWin,
        status: this.status
      };
      
      console.log('Updating user in AuthService:', JSON.stringify(updatedUser, null, 2));
      this.authService.updateCurrentUser(updatedUser);
    }
  }
  
  private restoreFromCache(): void {
    console.log('Restoring data from cache');
    if (this.cachedProfileData.hasLoaded) {
      this.username = this.cachedProfileData.username;
      this.email = this.cachedProfileData.email;
      this.memberSince = this.cachedProfileData.memberSince;
      this.userBalance = this.cachedProfileData.userBalance;
      this.totalGames = this.cachedProfileData.totalGames;
      this.gamesWon = this.cachedProfileData.gamesWon;
      this.gamesLost = this.cachedProfileData.gamesLost;
      this.lifetimeEarnings = this.cachedProfileData.lifetimeEarnings;
      this.highestWin = this.cachedProfileData.highestWin;
      this.status = this.cachedProfileData.status;
      this.winRate = this.cachedProfileData.winRate;
      
      console.log('Data restored from cache:', {
        totalGames: this.totalGames,
        gamesWon: this.gamesWon,
        gamesLost: this.gamesLost,
        lifetimeEarnings: this.lifetimeEarnings,
        highestWin: this.highestWin,
        winRate: this.winRate
      });
    } else {
      console.warn('Cannot restore from cache - no data cached yet');
    }
  }
  
  // Helper method to safely get the type of a variable in the template
  getType(value: any): string {
    return typeof value;
  }
  
  // Last resort method - directly update DOM if Angular binding fails
  private forceUpdateDOMValues(): void {
    console.log('LAST RESORT: Forcing update of DOM values directly');
    
    setTimeout(() => {
      try {
        // Find all stat display elements using multiple selector strategies
        
        // Strategy 1: Direct class selectors (as before)
        const totalGamesEl = document.querySelector('.bg-black\\/50 p-4 .text-white.text-xl.font-bold');
        if (totalGamesEl) totalGamesEl.textContent = String(this.totalGames || 0);
        
        const gamesWonEl = document.querySelector('.bg-black\\/50 p-4 .text-green-400.text-xl.font-bold');
        if (gamesWonEl) gamesWonEl.textContent = String(this.gamesWon || 0);
        
        const gamesLostEl = document.querySelector('.bg-black\\/50 p-4 .text-red-400.text-xl.font-bold');
        if (gamesLostEl) gamesLostEl.textContent = String(this.gamesLost || 0);
        
        const winRateEl = document.querySelector('.bg-black\\/50 p-4 .text-blue-400.text-xl.font-bold');
        if (winRateEl) winRateEl.textContent = `${this.winRate || 0}%`;
        
        // Strategy 2: Using parent container and finding all stat elements
        const statBoxes = document.querySelectorAll('.bg-black\\/50 p-4 .text-xl.font-bold');
        statBoxes.forEach((box, index) => {
          if (box && (!box.textContent || box.textContent === '...' || box.textContent === '0' || box.textContent === '0%')) {
            switch(index) {
              case 0: // Total Games
                box.textContent = String(this.totalGames || 0);
                break;
              case 1: // Games Won
                box.textContent = String(this.gamesWon || 0);
                break;
              case 2: // Games Lost
                box.textContent = String(this.gamesLost || 0);
                break;
              case 3: // Win Rate
                box.textContent = `${this.winRate || 0}%`;
                break;
            }
          }
        });
        
        // Strategy 3: Finding all elements at once by their relative position
        const gameStatGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-4');
        if (gameStatGrid) {
          const statContainers = gameStatGrid.querySelectorAll('.bg-black\\/50');
          statContainers.forEach((container, index) => {
            const valueEl = container.querySelector('.text-xl.font-bold');
            if (valueEl && (!valueEl.textContent || valueEl.textContent === '...' || valueEl.textContent === '0' || valueEl.textContent === '0%')) {
              switch(index) {
                case 0: // Total Games
                  valueEl.textContent = String(this.totalGames || 0);
                  break;
                case 1: // Games Won
                  valueEl.textContent = String(this.gamesWon || 0);
                  break;
                case 2: // Games Lost
                  valueEl.textContent = String(this.gamesLost || 0);
                  break;
                case 3: // Win Rate
                  valueEl.textContent = `${this.winRate || 0}%`;
                  break;
              }
            }
          });
        }
        
        // Update other values too (using multiple strategies)
        
        // Balance
        const balanceEl = document.querySelector('.text-white.font-bold.text-xl');
        if (balanceEl) balanceEl.textContent = `₹${this.userBalance || 0}`;
        
        // Lifetime Earnings
        const earningsSelectors = [
          '[class*="text-green-400"].font-medium', 
          '[class*="text-red-400"].font-medium',
          '.space-y-2 .text-white.font-medium[class*="text-green-400"]',
          '.space-y-2 .text-white.font-medium[class*="text-red-400"]'
        ];
        
        for (const selector of earningsSelectors) {
          const earningsEl = document.querySelector(selector);
          if (earningsEl) {
            const prefix = (this.lifetimeEarnings || 0) >= 0 ? '+' : '';
            earningsEl.textContent = `${prefix}₹${this.lifetimeEarnings || 0}`;
            break; // Stop once we've found and updated an element
          }
        }
        
        // Highest Win - if visible
        if (this.highestWin > 0) {
          const highestWinEl = document.querySelector('.text-green-400.font-medium.text-lg');
          if (highestWinEl) highestWinEl.textContent = `₹${this.highestWin || 0}`;
        }
        
        console.log('DOM update attempt completed using multiple strategies');
      } catch (error) {
        console.error('Error during direct DOM update:', error);
      }
    }, 100); // Short delay to let Angular try first
  }
}