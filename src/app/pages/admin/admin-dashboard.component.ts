import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, BarChart, Users, CreditCard, DollarSign, ArrowLeft, CheckCircle, XCircle, Search, AlertTriangle, Ban, UserCheck, Joystick } from 'lucide-angular';
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
  activeSection: 'stats' | 'transactions' | 'withdrawals' | 'users' | 'deposits' = 'stats';
  
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
  betAmountFilter: number | null = null;
  betAmountOptions: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalTransactionsCount: number = 0;
  isLoadingTransactions: boolean = false;
  
  // Withdrawals
  withdrawalRequests: WithdrawalRequest[] = [];
  filteredWithdrawals: WithdrawalRequest[] = [];
  paginatedWithdrawals: WithdrawalRequest[] = [];
  pendingWithdrawals: WithdrawalRequest[] = [];
  withdrawalStatusFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  withdrawalSearch: string = '';
  withdrawalCurrentPage: number = 1;
  withdrawalTotalPages: number = 1;
  withdrawalPageSize: number = 5;
  
  // Users
  users: UserManagement[] = [];
  filteredUsers: UserManagement[] = [];
  paginatedUsers: UserManagement[] = [];
  userSearch: string = '';
  userStatusFilter: string = 'all';
  userCurrentPage: number = 1;
  userTotalPages: number = 1;
  userPageSize: number = 10;
  
  // Deposits
  deposits: Transaction[] = [];
  filteredDeposits: Transaction[] = [];
  paginatedDeposits: Transaction[] = [];
  depositSearch: string = '';
  depositCurrentPage: number = 1;
  depositTotalPages: number = 1;
  depositPageSize: number = 10;
  isLoadingDeposits: boolean = false;
  
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
  
  private loadDataForSection(section: 'stats' | 'transactions' | 'withdrawals' | 'users' | 'deposits'): void {
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
      case 'deposits':
        this.loadDeposits();
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
        // Filter only game transactions and sort by timestamp (newest first)
        this.transactions = transactions
          .filter(t => typeof t.type === 'string' && t.type.toLowerCase() === 'game')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        console.log(`Loaded ${this.transactions.length} game transactions`);
        
        // Extract unique bet amounts for filter options
        this.updateBetAmountOptions();
        
        this.filterGameTransactions();
        this.isLoadingTransactions = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.error = 'Failed to load game transactions. Please try again.';
        this.isLoadingTransactions = false;
        this.isLoading = false;
      }
    });
  }
  
  filterGameTransactions(): void {
    // Apply search filter to game transactions
    this.filteredTransactions = this.transactions.filter(game => {
      // Filter by search term
      const searchMatch = !this.transactionSearch || 
        game.username.toLowerCase().includes(this.transactionSearch.toLowerCase()) ||
        String(game.id).toLowerCase().includes(this.transactionSearch.toLowerCase()) ||
        (game.details || '').toLowerCase().includes(this.transactionSearch.toLowerCase());
      
      // Filter by bet amount if specified
      const betAmountMatch = this.betAmountFilter === null || 
        Math.abs(game.amount) === this.betAmountFilter;
      
      return searchMatch && betAmountMatch;
    });
    
    // Update total pages based on filtered results
    this.totalPages = Math.max(1, Math.ceil(this.filteredTransactions.length / this.pageSize));
    
    // Reset to first page when filters change
    this.currentPage = 1;
    
    // Apply pagination
    this.applyPagination();
  }
  
  loadWithdrawals(): void {
    console.log('Loading withdrawals - Current search term:', this.withdrawalSearch);
    this.isLoading = true;
    this.error = null;
    
    // Only select status filter from server if not using search term
    const status = (this.withdrawalStatusFilter === 'all' || this.withdrawalSearch) ? undefined : this.withdrawalStatusFilter;
    console.log('Making request with status:', status);
    
    this.adminService.getWithdrawalRequests(status).subscribe({
      next: (requests) => {
        console.log('Received withdrawal requests:', requests.length);
        
        // Store the original search term before processing
        const searchTerm = this.withdrawalSearch;
        
        this.withdrawalRequests = requests;
        
        // If we had a search term, make sure it's preserved
        if (searchTerm) {
          this.withdrawalSearch = searchTerm;
          console.log('Preserving search term after loading:', this.withdrawalSearch);
        }
        
        // Apply filters with the preserved search term
        this.filterWithdrawals();
        
        this.pendingWithdrawals = requests.filter(w => {
          return w.status.toLowerCase() === 'pending';
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading withdrawals:', error);
        this.error = error.message || 'Failed to load withdrawal requests. Please try again.';
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
          this.paginatedUsers = [];
        } else if (users.length === 0) {
          console.log('Admin Dashboard: No users found');
          this.users = [];
          this.filteredUsers = [];
          this.paginatedUsers = [];
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
          
          // Initialize filtered users with all users and set up pagination
          this.filteredUsers = [...this.users];
          this.userTotalPages = Math.max(1, Math.ceil(this.filteredUsers.length / this.userPageSize));
          this.userCurrentPage = 1;
          this.updatePaginatedUsers();
          
          console.log('Admin Dashboard: Processed users:', this.users);
          console.log('Admin Dashboard: Filtered users:', this.filteredUsers);
          console.log('Admin Dashboard: Paginated users:', this.paginatedUsers);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Admin Dashboard: Error loading users:', error);
        this.error = error.message || 'Failed to load users. Please try again.';
        this.users = [];
        this.filteredUsers = [];
        this.paginatedUsers = [];
        this.isLoading = false;
      }
    });
  }
  
  loadDeposits(): void {
    this.isLoadingDeposits = true;
    this.adminService.getDeposits().subscribe({
      next: (deposits) => {
        // Sort deposit transactions by timestamp (newest first)
        this.deposits = deposits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        console.log(`Loaded ${this.deposits.length} deposit transactions`);
        
        this.filterDeposits();
        this.isLoadingDeposits = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading deposits:', error);
        this.error = 'Failed to load deposit transactions. Please try again.';
        this.isLoadingDeposits = false;
        this.isLoading = false;
      }
    });
  }
  
  filterDeposits(): void {
    // Apply search filter to deposit transactions
    this.filteredDeposits = this.deposits.filter(deposit => {
      // Filter by search term
      const searchMatch = !this.depositSearch || 
        deposit.username.toLowerCase().includes(this.depositSearch.toLowerCase()) ||
        String(deposit.id).toLowerCase().includes(this.depositSearch.toLowerCase()) ||
        (deposit.details || '').toLowerCase().includes(this.depositSearch.toLowerCase());
      
      return searchMatch;
    });
    
    // Update total pages based on filtered results
    this.depositTotalPages = Math.max(1, Math.ceil(this.filteredDeposits.length / this.depositPageSize));
    
    // Reset to first page when filters change
    this.depositCurrentPage = 1;
    
    // Apply pagination
    this.applyDepositPagination();
  }
  
  applyDepositPagination(): void {
    const startIndex = (this.depositCurrentPage - 1) * this.depositPageSize;
    const endIndex = startIndex + this.depositPageSize;
    this.paginatedDeposits = this.filteredDeposits.slice(startIndex, endIndex);
  }
  
  goToPreviousDepositPage(): void {
    if (this.depositCurrentPage > 1) {
      this.depositCurrentPage--;
      this.applyDepositPagination();
    }
  }
  
  goToNextDepositPage(): void {
    if (this.depositCurrentPage < this.depositTotalPages) {
      this.depositCurrentPage++;
      this.applyDepositPagination();
    }
  }
  
  filterTransactions(): void {
    // Log all transaction types to debug
    console.log('Available transaction types:');
    const uniqueTypes = [...new Set(this.transactions.map(t => t.type))];
    console.log(uniqueTypes);
    
    // First apply filters to the full dataset
    this.filteredTransactions = this.transactions.filter(txn => {
      // Filter by search term
      const searchMatch = !this.transactionSearch || 
        txn.username.toLowerCase().includes(this.transactionSearch.toLowerCase()) ||
        String(txn.id).toLowerCase().includes(this.transactionSearch.toLowerCase());
      
      // Filter by transaction type (case insensitive)
      const txnType = txn.type?.toLowerCase() || '';
      const filterType = this.transactionTypeFilter.toLowerCase();
      const typeMatch = this.transactionTypeFilter === 'all' || txnType === filterType;
      
      // Log withdrawal filtering when that type is selected
      if (this.transactionTypeFilter === 'withdrawal') {
        console.log(`Transaction type: "${txn.type}" - matches filter: ${typeMatch}`);
      }
      
      return searchMatch && typeMatch;
    });
    
    // Log filtered results
    if (this.transactionTypeFilter === 'withdrawal') {
      console.log(`Filtered to ${this.filteredTransactions.length} withdrawal transactions`);
    }
    
    // Update total pages based on filtered results
    this.totalPages = Math.max(1, Math.ceil(this.filteredTransactions.length / this.pageSize));
    
    // Reset to first page when filters change
    this.currentPage = 1;
    
    // Apply pagination
    this.applyPagination();
  }
  
  filterWithdrawals(): void {
    console.log('Filtering withdrawals - Search term:', this.withdrawalSearch, 'Status filter:', this.withdrawalStatusFilter);
    console.log('Total withdrawal requests before filtering:', this.withdrawalRequests.length);
    
    // First apply filters to the full dataset
    this.filteredWithdrawals = this.withdrawalRequests.filter(request => {
      // Convert search term to lowercase for case-insensitive comparison
      const searchTerm = this.withdrawalSearch?.toLowerCase() || '';
      
      // Convert all searchable fields to lowercase
      const username = request.username?.toLowerCase() || '';
      const id = String(request.id).toLowerCase();
      const details = request.details?.toLowerCase() || '';
      
      // Filter by search term
      const searchMatch = !searchTerm || 
                         username.includes(searchTerm) || 
                         id.includes(searchTerm) || 
                         details.includes(searchTerm);
      
      // Filter by status
      const statusMatch = this.withdrawalStatusFilter === 'all' || 
                         request.status.toLowerCase() === this.withdrawalStatusFilter;
      
      // For debugging
      if (searchTerm && username.includes(searchTerm)) {
        console.log('Username match found:', username, 'Search term:', searchTerm);
      }
      
      const result = searchMatch && statusMatch;
      
      // Log each item's matching result for debugging
      if (searchTerm) {
        console.log(`Withdrawal by ${username} - Search match: ${searchMatch}, Status match: ${statusMatch}, Final result: ${result}`);
      }
      
      return result;
    });
    
    console.log('Filtered withdrawals count after filtering:', this.filteredWithdrawals.length);
    
    // Apply pagination
    this.withdrawalTotalPages = Math.max(1, Math.ceil(this.filteredWithdrawals.length / this.withdrawalPageSize));
    this.withdrawalCurrentPage = 1; // Reset to first page when filter changes
    this.updatePaginatedWithdrawals();
    
    console.log('Paginated withdrawals count:', this.paginatedWithdrawals.length);
    console.log('Current page:', this.withdrawalCurrentPage, 'Total pages:', this.withdrawalTotalPages);
  }
  
  updatePaginatedWithdrawals(): void {
    const startIndex = (this.withdrawalCurrentPage - 1) * this.withdrawalPageSize;
    const endIndex = startIndex + this.withdrawalPageSize;
    this.paginatedWithdrawals = this.filteredWithdrawals.slice(startIndex, endIndex);
  }
  
  goToPreviousWithdrawalPage(): void {
    if (this.withdrawalCurrentPage > 1) {
      this.withdrawalCurrentPage--;
      this.updatePaginatedWithdrawals();
    }
  }
  
  goToNextWithdrawalPage(): void {
    if (this.withdrawalCurrentPage < this.withdrawalTotalPages) {
      this.withdrawalCurrentPage++;
      this.updatePaginatedWithdrawals();
    }
  }
  
  filterUsers(): void {
    console.log('Admin Dashboard: Starting to filter users');
    console.log('Admin Dashboard: Current search term:', this.userSearch);
    console.log('Admin Dashboard: Current status filter:', this.userStatusFilter);
    
    if (!this.users || this.users.length === 0) {
      console.log('Admin Dashboard: No users to filter');
      this.filteredUsers = [];
      this.paginatedUsers = [];
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
    
    // Apply pagination
    this.userTotalPages = Math.max(1, Math.ceil(this.filteredUsers.length / this.userPageSize));
    this.userCurrentPage = 1; // Reset to first page when filter changes
    this.updatePaginatedUsers();
    
    console.log('Admin Dashboard: Filtered users result:', this.filteredUsers);
    console.log('Admin Dashboard: Paginated users:', this.paginatedUsers);
  }
  
  updatePaginatedUsers(): void {
    const startIndex = (this.userCurrentPage - 1) * this.userPageSize;
    const endIndex = Math.min(startIndex + this.userPageSize, this.filteredUsers.length);
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }
  
  goToPreviousUserPage(): void {
    if (this.userCurrentPage > 1) {
      this.userCurrentPage--;
      this.updatePaginatedUsers();
    }
  }
  
  goToNextUserPage(): void {
    if (this.userCurrentPage < this.userTotalPages) {
      this.userCurrentPage++;
      this.updatePaginatedUsers();
    }
  }
  
  approveWithdrawal(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.adminService.approveWithdrawal(id).subscribe({
      next: () => {
        // Update local data
        const index = this.withdrawalRequests.findIndex(w => w.id === id);
        if (index !== -1) {
          this.withdrawalRequests[index].status = 'approved';
          this.filterWithdrawals();
          this.pendingWithdrawals = this.pendingWithdrawals.filter(w => w.id !== id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error approving withdrawal:', error);
        this.error = error.message || 'Failed to approve withdrawal request. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  rejectWithdrawal(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.adminService.rejectWithdrawal(id).subscribe({
      next: () => {
        // Update local data
        const index = this.withdrawalRequests.findIndex(w => w.id === id);
        if (index !== -1) {
          this.withdrawalRequests[index].status = 'rejected';
          this.filterWithdrawals();
          this.pendingWithdrawals = this.pendingWithdrawals.filter(w => w.id !== id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error rejecting withdrawal:', error);
        this.error = error.message || 'Failed to reject withdrawal request. Please try again.';
        this.isLoading = false;
      }
    });
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
  
  updateUserRole(userId: string, role: string, add: boolean): void {
    console.log(`Admin Dashboard: ${add ? 'Adding' : 'Removing'} role ${role} for user ${userId}`);
    this.isLoading = true;
    this.error = null;

    try {
      this.adminService.updateUserRole(userId, role, add).subscribe({
        next: () => {
          console.log(`Admin Dashboard: Successfully ${add ? 'added' : 'removed'} role ${role} for user ${userId}`);
          
          // Update local data
          const index = this.users.findIndex(u => u.id === userId);
          if (index !== -1) {
            // Initialize roles array if it doesn't exist
            if (!this.users[index].roles) {
              this.users[index].roles = ['ROLE_USER'];
            }
            
            if (add) {
              // Add role if it doesn't exist
              if (!this.users[index].roles?.includes(role)) {
                this.users[index].roles?.push(role);
              }
            } else {
              // Remove role
              this.users[index].roles = this.users[index].roles?.filter(r => r !== role) || ['ROLE_USER'];
            }
            
            this.filterUsers();
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error(`Admin Dashboard: Error ${add ? 'adding' : 'removing'} role:`, error);
          this.error = error.message || `Failed to ${add ? 'add' : 'remove'} role. Please try again.`;
          this.isLoading = false;
        }
      });
    } catch (err) {
      console.error('Admin Dashboard: Exception during role update:', err);
      this.error = 'An unexpected error occurred. Please try again.';
      this.isLoading = false;
    }
  }
  
  hasRole(user: UserManagement, role: string): boolean {
    return this.adminService.hasRole(user.roles, role);
  }
  
  setActiveSection(section: 'stats' | 'transactions' | 'withdrawals' | 'users' | 'deposits'): void {
    this.activeSection = section;
    
    // Clear search terms when switching sections
    if (section === 'withdrawals') {
      this.withdrawalSearch = '';
    } else if (section === 'transactions') {
      this.transactionSearch = '';
    } else if (section === 'users') {
      this.userSearch = '';
    } else if (section === 'deposits') {
      this.depositSearch = '';
    }
    
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

  onWithdrawalSearchChange(event: any): void {
    console.log('Search input changed:', event.target.value);
    this.withdrawalSearch = event.target.value;
    
    // Only filter existing data, don't reload from API
    if (this.withdrawalRequests && this.withdrawalRequests.length > 0) {
      this.filterWithdrawals();
    }
  }

  // Extract unique bet amounts from transactions
  updateBetAmountOptions(): void {
    // Use a Set to collect unique absolute amounts
    const uniqueAmounts = new Set<number>();
    
    // Add each unique absolute amount to the set
    this.transactions.forEach(game => {
      uniqueAmounts.add(Math.abs(game.amount));
    });
    
    // Convert set to array and sort in ascending order
    this.betAmountOptions = Array.from(uniqueAmounts).sort((a, b) => a - b);
    
    console.log('Available bet amounts:', this.betAmountOptions);
  }
}