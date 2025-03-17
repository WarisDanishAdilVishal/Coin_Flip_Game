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
  transactionSearch: string = '';
  transactionTypeFilter: string = 'all';
  
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
  
  constructor(
    private adminService: AdminService,
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
    
    // Load initial data
    this.loadGameStats();
    this.loadTransactions();
    this.loadWithdrawals();
    this.loadUsers();
  }
  
  loadGameStats(): void {
    this.adminService.getGameStats().subscribe(stats => {
      this.gameStats = stats;
      
      // Calculate totals
      this.totalGames = this.gameStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0);
      this.totalWagered = this.gameStats.reduce((sum, stat) => sum + stat.totalWagered, 0);
      this.totalWon = this.gameStats.reduce((sum, stat) => sum + stat.totalWon, 0);
      this.totalProfit = this.totalWagered - this.totalWon;
    });
  }
  
  loadTransactions(): void {
    this.adminService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.filterTransactions();
    });
  }
  
  loadWithdrawals(): void {
    this.adminService.getWithdrawalRequests().subscribe(requests => {
      this.withdrawalRequests = requests;
      this.filterWithdrawals();
      this.pendingWithdrawals = this.withdrawalRequests.filter(w => w.status === 'pending');
    });
  }
  
  loadUsers(): void {
    this.adminService.getUsers().subscribe(users => {
      this.users = users;
      this.filterUsers();
    });
  }
  
  filterTransactions(): void {
    this.filteredTransactions = this.transactions.filter(txn => {
      // Filter by search term
      const searchMatch = !this.transactionSearch || 
        txn.username.toLowerCase().includes(this.transactionSearch.toLowerCase()) ||
        txn.id.toLowerCase().includes(this.transactionSearch.toLowerCase());
      
      // Filter by transaction type
      const typeMatch = this.transactionTypeFilter === 'all' || txn.type === this.transactionTypeFilter;
      
      return searchMatch && typeMatch;
    });
  }
  
  filterWithdrawals(): void {
    this.filteredWithdrawals = this.withdrawalRequests.filter(withdrawal => {
      return this.withdrawalStatusFilter === 'all' || withdrawal.status === this.withdrawalStatusFilter;
    });
  }
  
  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filter by search term
      const searchMatch = !this.userSearch || 
        user.username.toLowerCase().includes(this.userSearch.toLowerCase());
      
      // Filter by status
      const statusMatch = this.userStatusFilter === 'all' || user.status === this.userStatusFilter;
      
      return searchMatch && statusMatch;
    });
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
    if (this.adminService.updateUserStatus(userId, status)) {
      // Update local data
      const index = this.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        this.users[index].status = status;
        this.filterUsers();
      }
    }
  }
  
  setActiveSection(section: 'stats' | 'transactions' | 'withdrawals' | 'users'): void {
    this.activeSection = section;
  }
  
  navigateBack(): void {
    this.router.navigate(['/game']);
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
}