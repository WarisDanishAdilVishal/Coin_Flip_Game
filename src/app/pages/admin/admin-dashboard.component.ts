import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, BarChart, Users, CreditCard, DollarSign, ArrowLeft, CheckCircle, XCircle, Search, AlertTriangle, Ban, UserCheck } from 'lucide-angular';
import { HeaderComponent } from '../../components/header/header.component';
import { ButtonComponent } from '../../components/button/button.component';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { GameStats, Transaction, WithdrawalRequest, UserManagement } from '../../models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'] 
})
export class AdminDashboardComponent implements OnInit {
  username: string = '';
  activeSection: 'stats' | 'transactions' | 'withdrawals' | 'users' = 'stats';
  
  // Game Statistics
  gameStats: GameStats[] = [];
  totalGames: number = 0;
  totalWagered: number = 0;
  totalWon: number = 0;
  totalProfit: number = 0;
  
  // Transactions
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  transactionSearch: string = '';
  transactionTypeFilter: string = 'all';
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalTransactionsCount: number = 0;
  isLoadingTransactions: boolean = false;
  
  // Withdrawals
  withdrawalRequests: WithdrawalRequest[] = [];
  filteredWithdrawals: WithdrawalRequest[] = [];
  pendingWithdrawals: WithdrawalRequest[] = [];
  withdrawalStatusFilter: string = 'all';
  
  // Users
  users: UserManagement[] = [];
  filteredUsers: UserManagement[] = [];
  userSearch: string = '';
  userStatusFilter: string = 'all';
  
  // For template use
  Math = Math;
  
  // Loading states
  isLoading: boolean = false;
  error: string | null = null;
  
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    console.log('Admin Dashboard: Initializing...');
    this.isLoading = true;
    
    const currentUser = this.authService.getCurrentUser();
    console.log('Admin Dashboard: Current user:', currentUser);
    
    if (!currentUser) {
      console.log('Admin Dashboard: No user found, redirecting to login');
      this.router.navigate(['/login']);
      this.isLoading = false;
      return;
    }
    
    // Check if user is admin using the AdminService
    if (!this.adminService.isAdmin(currentUser.username)) {
      console.log('Admin Dashboard: User is not admin, redirecting to game');
      this.router.navigate(['/game']);
      this.isLoading = false;
      return;
    }
    
    this.username = currentUser.username;
    console.log('Admin Dashboard: Loading data for section:', this.activeSection);
    
    // Load initial data for the active section
    this.loadDataForSection(this.activeSection);
  }
  
  private loadDataForSection(section: 'stats' | 'transactions' | 'withdrawals' | 'users'): void {
    console.log('Admin Dashboard: Loading data for section:', section);
    this.isLoading = true;
    this.error = null;
    
    switch (section) {
      case 'stats':
        this.loadGameStats();
        break;
      case 'transactions':
        this.loadTransactions();
        break;
      case 'withdrawals':
        this.loadWithdrawals();
        break;
      case 'users':
        this.loadUsers();
        break;
    }
  }
  
  loadGameStats(): void {
    console.log('Admin Dashboard: Loading game stats...');
    this.adminService.getGameStats().subscribe({
      next: (stats) => {
        console.log('Admin Dashboard: Game stats loaded:', stats);
        this.gameStats = stats;
        
        // Calculate totals
        this.totalGames = this.gameStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0);
        // Calculate total wagered as betAmount * gamesPlayed for each stat
        this.totalWagered = this.gameStats.reduce((sum, stat) => sum + (stat.betAmount * stat.gamesPlayed), 0);
        this.totalWon = this.gameStats.reduce((sum, stat) => sum + stat.totalWon, 0);
        // Use houseProfit from API response
        this.totalProfit = this.gameStats.reduce((sum, stat) => sum + stat.houseProfit, 0);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Admin Dashboard: Error loading game stats:', error);
        this.error = 'Failed to load game statistics. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  loadTransactions(): void {
    this.isLoadingTransactions = true;
    this.adminService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.totalTransactionsCount = transactions.length;
        this.filterTransactions();
        this.isLoadingTransactions = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.error = 'Failed to load transactions. Please try again.';
        this.isLoadingTransactions = false;
        this.isLoading = false;
      }
    });
  }
  
  loadWithdrawals(): void {
    this.adminService.getWithdrawalRequests().subscribe({
      next: (requests) => {
        this.withdrawalRequests = requests;
        this.filterWithdrawals();
        this.pendingWithdrawals = this.withdrawalRequests.filter(w => w.status === 'pending');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading withdrawals:', error);
        this.error = 'Failed to load withdrawal requests. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  loadUsers(): void {
    console.log('Admin Dashboard: Starting to load users...');
    this.isLoading = true;
    this.error = null;
    
    // Check if we have a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Admin Dashboard: No token found');
      this.error = 'Authentication required. Please log in again.';
      this.isLoading = false;
      return;
    }
    
    this.adminService.getUsers().subscribe({
      next: (users) => {
        console.log('Admin Dashboard: Users loaded successfully:', users);
        this.error = null;
        if (!users) {
          console.error('Admin Dashboard: Received null users data');
          this.error = 'Invalid data received from server';
          this.users = [];
          this.filteredUsers = [];
        } else if (users.length === 0) {
          console.log('Admin Dashboard: No users found');
          this.users = [];
          this.filteredUsers = [];
        } else {
          console.log('Admin Dashboard: Processing users data:', users);
          // Ensure all required fields are present and properly formatted
          this.users = users.map(user => {
            // Log each user's data for debugging
            console.log('Processing user:', user);
            
            // Ensure stats object exists and has all required fields
            const stats = {
              totalGames: Number(user.stats?.totalGames) || 0,
              profitLoss: Number(user.stats?.profitLoss) || 0,
              lastActive: user.stats?.lastActive || new Date().toISOString()
            };
            
            // Create a properly formatted user object
            const formattedUser = {
              id: user.id || '',
              username: user.username || 'Unknown User',
              balance: Number(user.balance) || 0,
              status: user.status || 'active',
              createdAt: user.createdAt || new Date().toISOString(),
              stats: stats
            };
            
            console.log('Formatted user:', formattedUser);
            return formattedUser;
          });
          
          // Initialize filtered users with all users
          this.filteredUsers = [...this.users];
          console.log('Admin Dashboard: Processed users:', this.users);
          console.log('Admin Dashboard: Filtered users:', this.filteredUsers);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Admin Dashboard: Error loading users:', error);
        this.error = error.message || 'Failed to load users. Please try again.';
        this.users = [];
        this.filteredUsers = [];
        this.isLoading = false;
      }
    });
  }
  
  filterTransactions(): void {
    // First apply filters to the full dataset
    this.filteredTransactions = this.transactions.filter(txn => {
      // Filter by search term
      const searchMatch = !this.transactionSearch || 
        txn.username.toLowerCase().includes(this.transactionSearch.toLowerCase()) ||
        txn.id.toLowerCase().includes(this.transactionSearch.toLowerCase());
      
      // Filter by transaction type
      const typeMatch = this.transactionTypeFilter === 'all' || txn.type === this.transactionTypeFilter;
      
      return searchMatch && typeMatch;
    });
    
    // Update total pages based on filtered results
    this.totalPages = Math.max(1, Math.ceil(this.filteredTransactions.length / this.pageSize));
    
    // Reset to first page when filters change
    this.currentPage = 1;
    
    // Apply pagination
    this.applyPagination();
  }
  
  filterWithdrawals(): void {
    this.filteredWithdrawals = this.withdrawalRequests.filter(withdrawal => {
      return this.withdrawalStatusFilter === 'all' || withdrawal.status === this.withdrawalStatusFilter;
    });
  }
  
  filterUsers(): void {
    console.log('Admin Dashboard: Starting to filter users');
    console.log('Admin Dashboard: Current search term:', this.userSearch);
    console.log('Admin Dashboard: Current status filter:', this.userStatusFilter);
    
    if (!this.users || this.users.length === 0) {
      console.log('Admin Dashboard: No users to filter');
      this.filteredUsers = [];
      return;
    }
    
    this.filteredUsers = this.users.filter(user => {
      // Filter by search term
      const searchMatch = !this.userSearch || 
        user.username.toLowerCase().includes(this.userSearch.toLowerCase());
      
      // Filter by status
      const statusMatch = this.userStatusFilter === 'all' || user.status === this.userStatusFilter;
      
      const matches = searchMatch && statusMatch;
      console.log(`Admin Dashboard: User ${user.username} matches filters:`, matches);
      return matches;
    });
    
    // If we have no results but did have a search term, clear any error message
    // This prevents showing error messages for valid searches with no results
    if (this.filteredUsers.length === 0 && (this.userSearch || this.userStatusFilter !== 'all')) {
      this.error = null;
    }
    
    console.log('Admin Dashboard: Filtered users result:', this.filteredUsers);
  }
  
  approveWithdrawal(id: string): void {
    if (this.adminService.approveWithdrawal(id)) {
      // Update local data
      const index = this.withdrawalRequests.findIndex(w => w.id === id);
      if (index !== -1) {
        this.withdrawalRequests[index].status = 'approved';
        this.filterWithdrawals();
        this.pendingWithdrawals = this.pendingWithdrawals.filter(w => w.id !== id);
      }
    }
  }
  
  rejectWithdrawal(id: string): void {
    if (this.adminService.rejectWithdrawal(id)) {
      // Update local data
      const index = this.withdrawalRequests.findIndex(w => w.id === id);
      if (index !== -1) {
        this.withdrawalRequests[index].status = 'rejected';
        this.filterWithdrawals();
        this.pendingWithdrawals = this.pendingWithdrawals.filter(w => w.id !== id);
      }
    }
  }
  
  updateUserStatus(userId: string, status: 'active' | 'suspended' | 'blocked'): void {
    console.log(`Admin Dashboard: Updating user ${userId} status to ${status}`);
    this.isLoading = true;
    this.error = null;

    // The backend expects a numeric ID, so ensure it's properly formatted
    try {
      this.adminService.updateUserStatus(userId, status).subscribe({
        next: () => {
          console.log(`Admin Dashboard: Successfully updated user ${userId} status to ${status}`);
          // Update local data
          const index = this.users.findIndex(u => u.id === userId);
          if (index !== -1) {
            this.users[index].status = status;
            this.filterUsers();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Admin Dashboard: Error updating user status:', error);
          this.error = error.message || 'Failed to update user status. Please try again.';
          this.isLoading = false;
        }
      });
    } catch (err) {
      console.error('Admin Dashboard: Exception during status update:', err);
      this.error = 'An unexpected error occurred. Please try again.';
      this.isLoading = false;
    }
  }
  
  setActiveSection(section: 'stats' | 'transactions' | 'withdrawals' | 'users'): void {
    this.activeSection = section;
    this.loadDataForSection(section);
  }
  
  navigateBack(): void {
    this.router.navigate(['/game']);
  }
  
  formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  }
  
  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  }
  
  formatTransactionType(type: string): string {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'game': return 'Game';
      default: return type;
    }
  }
  
  formatStatus(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  }
  
  formatWithdrawalStatus(status: string): string {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }
  
  formatUserStatus(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'suspended': return 'Suspended';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  }
  
  formatPaymentMethod(method: string): string {
    switch (method) {
      case 'upi': return 'UPI';
      case 'bank_transfer': return 'Bank Transfer';
      case 'paytm': return 'Paytm';
      default: return method;
    }
  }

  private applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(startIndex, endIndex);
  }

  private updatePageData(): void {
    this.applyPagination();
  }

  goToNextPage(): void {
    const nextPage = this.currentPage + 1;
    if (nextPage <= this.totalPages) {
      this.currentPage = nextPage;
      this.applyPagination();
    }
  }

  goToPreviousPage(): void {
    const prevPage = this.currentPage - 1;
    if (prevPage >= 1) {
      this.currentPage = prevPage;
      this.applyPagination();
    }
  }
}