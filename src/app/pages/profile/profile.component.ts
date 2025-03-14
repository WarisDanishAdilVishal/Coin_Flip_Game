import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, History, CreditCard, LogOut, ChevronRight, Calendar, ArrowRight, Award, TrendingUp, Percent } from 'lucide-angular';
import { HeaderComponent } from '../../components/header/header.component';
import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { GameService } from '../../services/game.service';
import { GameHistory } from '../../models/game-history.model';
import { User as UserModel } from '../../models/user.model';

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
    private router: Router
  ) {}
  
  ngOnInit(): void {
    console.log('ProfileComponent ngOnInit called');
    
    // Hard reset all values to zero to avoid any undefined or null issues
    this.totalGames = 0;
    this.gamesWon = 0;
    this.gamesLost = 0;
    this.lifetimeEarnings = 0;
    this.highestWin = 0;
    this.winRate = 0;
    
    // First get user from local storage for quick display
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No currentUser in AuthService, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('CurrentUser from localStorage:', JSON.stringify(currentUser, null, 2));
    
    // Set initial values from localStorage
    this.username = currentUser.username || 'Unknown User';
    this.userBalance = Number(currentUser.balance) || 0;
    if (currentUser.createdAt) {
      this.memberSince = this.formatDate(new Date(currentUser.createdAt));
    } else {
      this.memberSince = 'Today';
    }
    
    // SUPER AGGRESSIVE TYPE CONVERSION - force all values to be numbers
    try {
      // Convert all values to numbers using Number() constructor first, then parseInt/parseFloat as fallback
      if (currentUser.totalGames !== undefined && currentUser.totalGames !== null) {
        // Try multiple conversion approaches
        const converted = Number(currentUser.totalGames);
        this.totalGames = isNaN(converted) ? parseInt(String(currentUser.totalGames), 10) || 0 : converted;
      }
      
      if (currentUser.gamesWon !== undefined && currentUser.gamesWon !== null) {
        const converted = Number(currentUser.gamesWon);
        this.gamesWon = isNaN(converted) ? parseInt(String(currentUser.gamesWon), 10) || 0 : converted;
      }
      
      if (currentUser.gamesLost !== undefined && currentUser.gamesLost !== null) {
        const converted = Number(currentUser.gamesLost);
        this.gamesLost = isNaN(converted) ? parseInt(String(currentUser.gamesLost), 10) || 0 : converted;
      }
      
      if (currentUser.lifetimeEarnings !== undefined && currentUser.lifetimeEarnings !== null) {
        const converted = Number(currentUser.lifetimeEarnings);
        this.lifetimeEarnings = isNaN(converted) ? parseFloat(String(currentUser.lifetimeEarnings)) || 0 : converted;
      }
      
      if (currentUser.highestWin !== undefined && currentUser.highestWin !== null) {
        const converted = Number(currentUser.highestWin);
        this.highestWin = isNaN(converted) ? parseFloat(String(currentUser.highestWin)) || 0 : converted;
      }
      
      if (currentUser.status) {
        this.status = currentUser.status;
      }
      
      // Log everything with types for debugging
      console.log('After AGGRESSIVE type conversion - values from localStorage:', {
        totalGames: `${this.totalGames} (${typeof this.totalGames})`,
        gamesWon: `${this.gamesWon} (${typeof this.gamesWon})`,
        gamesLost: `${this.gamesLost} (${typeof this.gamesLost})`,
        lifetimeEarnings: `${this.lifetimeEarnings} (${typeof this.lifetimeEarnings})`,
        highestWin: `${this.highestWin} (${typeof this.highestWin})`,
      });
    } catch (error) {
      console.error('Error processing values from localStorage:', error);
      // Reset to defaults if there's an error
      this.totalGames = 0;
      this.gamesWon = 0;
      this.gamesLost = 0;
      this.lifetimeEarnings = 0;
      this.highestWin = 0;
      this.winRate = 0;
    }
    
    // Calculate win rate from localStorage data if available
    if (this.totalGames > 0) {
      this.winRate = Math.round((this.gamesWon / this.totalGames) * 100);
      console.log('Win rate calculated:', this.winRate);
    } else {
      this.winRate = 0;
    }
    
    // IMPORTANT: Force values to be valid numbers
    this.ensureNumericValues();
    
    // Cache initial data
    this.cacheProfileData();
    
    // First update attempt immediately
    this.forceUpdateDOMValues();
    
    // Multiple scheduled updates to ensure UI shows data
    const updateTimes = [50, 200, 500, 1000, 2000];
    updateTimes.forEach(time => {
      setTimeout(() => {
        if (this.isLoadingProfile && time >= 2000) {
          // Force clear loading state if it's been too long
          console.log('Force clearing loading state after timeout');
          this.isLoadingProfile = false;
        }
        
        // Always ensure values are numbers before updating
        this.ensureNumericValues();
        
        // And force DOM update
        this.forceUpdateDOMValues();
      }, time);
    });
    
    // Then fetch latest data from backend
    this.fetchProfileData();
    
    // Load appropriate data based on active section
    if (this.activeSection === 'history') {
      this.loadGameHistory();
    }
    
    // Additional final check after all data should be loaded
    setTimeout(() => {
      // Check if stats are still not showing
      const statContainers = document.querySelectorAll('.bg-black\\/50 p-4 .text-xl.font-bold');
      let needsUpdate = false;
      
      if (statContainers) {
        statContainers.forEach(container => {
          // If any container shows 0 or is empty, we need to update
          if (!container.textContent || container.textContent === '...' || container.textContent === '0' || container.textContent === '0%') {
            needsUpdate = true;
          }
        });
      }
      
      if (needsUpdate) {
        console.log('Stats still not showing properly, forcing update again');
        this.forceUpdateDOMValues();
      }
    }, 3500);
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
  
  submitWithdrawal(event: Event): void {
    event.preventDefault();
    
    if (this.withdrawalAmount <= 0) {
      this.withdrawalError = 'Please enter a valid amount';
      return;
    }
    
    if (this.withdrawalAmount > this.userBalance) {
      this.withdrawalError = 'Withdrawal amount exceeds your balance';
      return;
    }
    
    if (this.paymentMethod === 'upi' && !this.upiId) {
      this.withdrawalError = 'Please enter your UPI ID';
      return;
    } else if (this.paymentMethod === 'bank_transfer' && (!this.accountNumber || !this.ifscCode || !this.accountName)) {
      this.withdrawalError = 'Please enter all bank details';
      return;
    } else if (this.paymentMethod === 'paytm' && !this.paytmNumber) {
      this.withdrawalError = 'Please enter your Paytm number';
      return;
    }
    
    this.withdrawalError = null;
    this.withdrawalProcessing = true;
    
    setTimeout(() => {
      this.withdrawalProcessing = false;
      this.withdrawalSuccess = true;
      this.lastWithdrawalAmount = this.withdrawalAmount;
      
      this.withdrawalHistory.unshift({
        id: Math.floor(Math.random() * 1000000),
        amount: this.withdrawalAmount,
        method: this.paymentMethod,
        status: 'pending',
        timestamp: new Date()
      });
      
      this.withdrawalAmount = 0;
      this.upiId = '';
      this.accountNumber = '';
      this.ifscCode = '';
      this.accountName = '';
      this.paytmNumber = '';
      
      this.userBalance -= this.lastWithdrawalAmount;
    }, 2000);
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