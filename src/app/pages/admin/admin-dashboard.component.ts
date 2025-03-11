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
  template: `
    <div class="min-h-screen text-white flex flex-col bg-black">
      <div class="absolute inset-0 bg-gradient-to-b from-[#ff0080]/20 via-[#40e0d0]/20 to-[#ff8c00]/20 pointer-events-none bg-gradient-animate"></div>
      
      <app-header [showBalance]="false"></app-header>
      
      <div class="flex-1 flex py-2 sm:py-4 relative overflow-x-hidden">
        <!-- Left Sidebar -->
        <div class="w-64 lg:w-72 flex-shrink-0 pl-2 sm:pl-4">
          <div class="top-2">
            <div class="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-pink-500/30 shadow-neon mb-4">
              <div>
                <button 
                  (click)="navigateBack()" 
                  class="flex items-center gap-3 p-3 rounded-lg bg-black/30 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <lucide-icon name="arrow-left" [size]="18"></lucide-icon>
                </button>
              </div>
              <div class="flex flex-col items-center mb-6">
                <div class="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-purple-500 flex items-center justify-center mb-4">
                  <lucide-icon name="user" [size]="32" class="text-white"></lucide-icon>
                </div>
                <h2 class="text-xl font-bold text-white mb-1">Admin Dashboard</h2>
                <p class="text-pink-300 text-sm">Logged in as {{ username }}</p>
              </div>
              
              <div class="space-y-2">
                <a 
                  (click)="setActiveSection('stats')"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  [ngClass]="activeSection === 'stats' ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'"
                >
                  <lucide-icon name="bar-chart" [size]="18"></lucide-icon>
                  <span>Game Statistics</span>
                </a>
                <a 
                  (click)="setActiveSection('transactions')"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  [ngClass]="activeSection === 'transactions' ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'"
                >
                  <lucide-icon name="dollar-sign" [size]="18"></lucide-icon>
                  <span>Transactions</span>
                </a>
                <a 
                  (click)="setActiveSection('withdrawals')"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  [ngClass]="activeSection === 'withdrawals' ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'"
                >
                  <lucide-icon name="credit-card" [size]="18"></lucide-icon>
                  <span>Withdrawal Requests</span>
                </a>
                <a 
                  (click)="setActiveSection('users')"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  [ngClass]="activeSection === 'users' ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'"
                >
                  <lucide-icon name="users" [size]="18"></lucide-icon>
                  <span>User Management</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 px-2 sm:px-4">
          <div class="max-w-4xl">
            <!-- Game Statistics Section -->
            <section *ngIf="activeSection === 'stats'" class="mb-8">
              <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-pink-500/30 shadow-neon">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-pink-300">
                  <lucide-icon name="bar-chart" [size]="20"></lucide-icon>
                  Game Statistics
                </h2>
                
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div class="bg-black/30 p-4 rounded-lg border border-pink-500/20">
                    <p class="text-pink-300 text-sm mb-1">Total Games</p>
                    <p class="text-2xl font-bold">{{ totalGames }}</p>
                  </div>
                  <div class="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <p class="text-green-300 text-sm mb-1">Total Wagered</p>
                    <p class="text-2xl font-bold">₹{{ totalWagered.toLocaleString() }}</p>
                  </div>
                  <div class="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <p class="text-blue-300 text-sm mb-1">Total Won by Players</p>
                    <p class="text-2xl font-bold">₹{{ totalWon.toLocaleString() }}</p>
                  </div>
                  <div class="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <p class="text-purple-300 text-sm mb-1">House Profit/Loss</p>
                    <p class="text-2xl font-bold" [ngClass]="totalProfit >= 0 ? 'text-green-400' : 'text-red-400'">
                      {{ totalProfit >= 0 ? '+' : '' }}₹{{ totalProfit.toLocaleString() }}
                    </p>
                  </div>
                </div>
                
                <!-- Game Stats by Bet Amount -->
                <div class="overflow-x-auto -mx-4 sm:mx-0">
                  <div class="min-w-[600px] px-4 sm:px-0">
                    <table class="w-full">
                      <thead>
                        <tr class="text-pink-300 text-sm">
                          <th class="text-left pb-4">Bet Amount</th>
                          <th class="text-left pb-4">Games Played</th>
                          <th class="text-left pb-4">Total Wagered</th>
                          <th class="text-left pb-4">Total Won by Players</th>
                          <th class="text-right pb-4">House Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr 
                          *ngFor="let stat of gameStats" 
                          class="border-t border-pink-500/10"
                        >
                          <td class="py-4">₹{{ stat.betAmount.toLocaleString() }}</td>
                          <td>{{ stat.gamesPlayed }}</td>
                          <td>₹{{ stat.totalWagered.toLocaleString() }}</td>
                          <td>₹{{ stat.totalWon.toLocaleString() }}</td>
                          <td class="text-right font-medium" [ngClass]="stat.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'">
                            {{ stat.profitLoss >= 0 ? '+' : '' }}₹{{ stat.profitLoss.toLocaleString() }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- Transactions Section -->
            <section *ngIf="activeSection === 'transactions'" class="mb-8">
              <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-neon-blue">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-blue-300">
                  <lucide-icon name="dollar-sign" [size]="20"></lucide-icon>
                  Transaction History
                </h2>
                
                <!-- Search and Filter -->
                <div class="flex flex-col sm:flex-row gap-4 mb-6">
                  <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <lucide-icon name="search" [size]="18" class="text-blue-500/50"></lucide-icon>
                    </div>
                    <input 
                      type="text" 
                      [(ngModel)]="transactionSearch"
                      (input)="filterTransactions()"
                      class="w-full bg-black/50 border border-blue-500/30 rounded-md p-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Search by username or transaction ID"
                    />
                  </div>
                  <select 
                    [(ngModel)]="transactionTypeFilter"
                    (change)="filterTransactions()"
                    class="bg-black/50 border border-blue-500/30 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="game">Game Transactions</option>
                  </select>
                </div>
                
                <!-- Transactions Table -->
                <div class="overflow-x-auto -mx-4 sm:mx-0">
                  <div class="min-w-[700px] px-4 sm:px-0">
                    <table class="w-full">
                      <thead>
                        <tr class="text-blue-300 text-sm">
                          <th class="text-left pb-4">Date & Time</th>
                          <th class="text-left pb-4">User</th>
                          <th class="text-left pb-4">Type</th>
                          <th class="text-left pb-4">Amount</th>
                          <th class="text-left pb-4">Status</th>
                          <th class="text-left pb-4">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr 
                          *ngFor="let txn of filteredTransactions" 
                          class="border-t border-blue-500/10"
                        >
                          <td class="py-4">{{ formatDateTime(txn.timestamp) }}</td>
                          <td>{{ txn.username }}</td>
                          <td>
                            <span class="px-2 py-1 rounded-full text-xs font-medium"
                                  [ngClass]="{
                                    'bg-green-500/20 text-green-400': txn.type === 'deposit',
                                    'bg-red-500/20 text-red-400': txn.type === 'withdrawal',
                                    'bg-blue-500/20 text-blue-400': txn.type === 'game'
                                  }">
                              {{ formatTransactionType(txn.type) }}
                            </span>
                          </td>
                          <td [ngClass]="txn.amount >= 0 ? 'text-green-400' : 'text-red-400'">
                            {{ txn.amount >= 0 ? '+' : '' }}₹{{ Math.abs(txn.amount).toLocaleString() }}
                          </td>
                          <td>
                            <span class="px-2 py-1 rounded-full text-xs font-medium"
                                  [ngClass]="{
                                    'bg-green-500/20 text-green-400': txn.status === 'completed',
                                    'bg-yellow-500/20 text-yellow-400': txn.status === 'pending',
                                    'bg-red-500/20 text-red-400': txn.status === 'failed'
                                  }">
                              {{ formatStatus(txn.status) }}
                            </span>
                          </td>
                          <td class="text-white/70">{{ txn.details || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <!-- No Results Message -->
                <div *ngIf="filteredTransactions.length === 0" class="text-center py-8 text-white/50">
                  <p>No transactions found matching your criteria</p>
                </div>
              </div>
            </section>
            
            <!-- Withdrawal Requests Section -->
            <section *ngIf="activeSection === 'withdrawals'" class="mb-8">
              <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30 shadow-neon-yellow">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-yellow-300">
                  <lucide-icon name="credit-card" [size]="20"></lucide-icon>
                  Withdrawal Requests
                </h2>
                
                <!-- Filter -->
                <div class="flex flex-col sm:flex-row gap-4 mb-6">
                  <select 
                    [(ngModel)]="withdrawalStatusFilter"
                    (change)="filterWithdrawals()"
                    class="bg-black/50 border border-yellow-500/30 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <!-- Pending Withdrawals -->
                <div *ngIf="pendingWithdrawals.length > 0" class="mb-8">
                  <h3 class="text-lg font-medium text-yellow-300 mb-4">Pending Approval</h3>
                  
                  <div class="space-y-4">
                    <div *ngFor="let withdrawal of pendingWithdrawals" class="bg-black/30 rounded-lg p-4 border border-yellow-500/10">
                      <div class="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div class="flex items-center gap-2 mb-2">
                            <span class="font-medium text-white">{{ withdrawal.username }}</span>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              Pending
                            </span>
                          </div>
                          <p class="text-lg font-bold text-white mb-1">₹{{ withdrawal.amount.toLocaleString() }}</p>
                          <p class="text-sm text-white/70">
                            {{ formatDateTime(withdrawal.timestamp) }} via {{ formatPaymentMethod(withdrawal.method) }}
                          </p>
                          <p class="text-sm text-white/70 mt-1">
                            <span class="text-yellow-300">Details:</span> {{ withdrawal.details }}
                          </p>
                        </div>
                        <div class="flex gap-2 sm:self-center">
                          <app-button
                            (onClick)="approveWithdrawal(withdrawal.id)"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30"
                            fontSize="0.75rem"
                            padding="0.375rem 0.75rem"
                          >
                            <lucide-icon name="check-circle" [size]="14" class="mr-1"></lucide-icon> Approve
                          </app-button>
                          <app-button
                            (onClick)="rejectWithdrawal(withdrawal.id)"
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                            fontSize="0.75rem"
                            padding="0.375rem 0.75rem"
                          >
                            <lucide-icon name="x-circle" [size]="14" class="mr-1"></lucide-icon> Reject
                          </app-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- All Withdrawals Table -->
                <div class="overflow-x-auto -mx-4 sm:mx-0">
                  <div class="min-w-[700px] px-4 sm:px-0">
                    <table class="w-full">
                      <thead>
                        <tr class="text-yellow-300 text-sm">
                          <th class="text-left pb-4">Date & Time</th>
                          <th class="text-left pb-4">User</th>
                          <th class="text-left pb-4">Amount</th>
                          <th class="text-left pb-4">Method</th>
                          <th class="text-left pb-4">Status</th>
                          <th class="text-left pb-4">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr 
                          *ngFor="let withdrawal of filteredWithdrawals" 
                          class="border-t border-yellow-500/10"
                        >
                          <td class="py-4">{{ formatDateTime(withdrawal.timestamp) }}</td>
                          <td>{{ withdrawal.username }}</td>
                          <td>₹{{ withdrawal.amount.toLocaleString() }}</td>
                          <td>{{ formatPaymentMethod(withdrawal.method) }}</td>
                          <td>
                            <span class="px-2 py-1 rounded-full text-xs font-medium"
                                  [ngClass]="{
                                    'bg-green-500/20 text-green-400': withdrawal.status === 'approved',
                                    'bg-yellow-500/20 text-yellow-400': withdrawal.status === 'pending',
                                    'bg-red-500/20 text-red-400': withdrawal.status === 'rejected'
                                  }">
                              {{ formatWithdrawalStatus(withdrawal.status) }}
                            </span>
                          </td>
                          <td class="text-white/70">{{ withdrawal.details }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <!-- No Results Message -->
                <div *ngIf="filteredWithdrawals.length === 0" class="text-center py-8 text-white/50">
                  <p>No withdrawal requests found matching your criteria</p>
                </div>
              </div>
            </section>
            
            <!-- User Management Section -->
            <section *ngIf="activeSection === 'users'" class="mb-8">
              <div class="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-neon">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-purple-300">
                  <lucide-icon name="users" [size]="20"></lucide-icon>
                  User Management
                </h2>
                
                <!-- Search and Filter -->
                <div class="flex flex-col sm:flex-row gap-4 mb-6">
                  <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <lucide-icon name="search" [size]="18" class="text-purple-500/50"></lucide-icon>
                    </div>
                    <input 
                      type="text" 
                      [(ngModel)]="userSearch"
                      (input)="filterUsers()"
                      class="w-full bg-black/50 border border-purple-500/30 rounded-md p-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Search by username"
                    />
                  </div>
                  <select 
                    [(ngModel)]="userStatusFilter"
                    (change)="filterUsers()"
                    class="bg-black/50 border border-purple-500/30 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                
                <!-- Users List -->
                <div class="space-y-4">
                  <div *ngFor="let user of filteredUsers" class="bg-black/30 rounded-lg p-4 border border-purple-500/10">
                    <div class="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-2">
                          <span class="font-medium text-white">{{ user.username }}</span>
                          <span class="px-2 py-0.5 rounded-full text-xs font -medium"
                                  [ngClass]="{
                                    'bg-green-500/20 text-green-400': user.status === 'active',
                                    'bg-yellow-500/20 text-yellow-400': user.status === 'suspended',
                                    'bg-red-500/20 text-red-400': user.status === 'blocked'
                                  }">
                            {{ formatUserStatus(user.status) }}
                          </span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p class="text-sm text-purple-300">Balance</p>
                            <p class="font-medium">₹{{ user.balance.toLocaleString() }}</p>
                          </div>
                          <div>
                            <p class="text-sm text-purple-300">Total Games</p>
                            <p class="font-medium">{{ user.stats.totalGames }}</p>
                          </div>
                          <div>
                            <p class="text-sm text-purple-300">Profit/Loss</p>
                            <p class="font-medium" [ngClass]="user.stats.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'">
                              {{ user.stats.profitLoss >= 0 ? '+' : '' }}₹{{ user.stats.profitLoss.toLocaleString() }}
                            </p>
                          </div>
                        </div>
                        <div class="text-sm text-white/70">
                          <p>Member since {{ formatDate(user.createdAt) }}</p>
                          <p>Last active {{ formatDateTime(user.stats.lastActive) }}</p>
                        </div>
                      </div>
                      <div class="flex gap-2 sm:self-center">
                        <app-button
                          *ngIf="user.status !== 'active'"
                          (onClick)="updateUserStatus(user.id, 'active')"
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30"
                          fontSize="0.75rem"
                          padding="0.375rem 0.75rem"
                        >
                          <lucide-icon name="user-check" [size]="14" class="mr-1"></lucide-icon> Activate
                        </app-button>
                        <app-button
                          *ngIf="user.status !== 'suspended'"
                          (onClick)="updateUserStatus(user.id, 'suspended')"
                          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/30"
                          fontSize="0.75rem"
                          padding="0.375rem 0.75rem"
                        >
                          <lucide-icon name="alert-triangle" [size]="14" class="mr-1"></lucide-icon> Suspend
                        </app-button>
                        <app-button
                          *ngIf="user.status !== 'blocked'"
                          (onClick)="updateUserStatus(user.id, 'blocked')"
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                          fontSize="0.75rem"
                          padding="0.375rem 0.75rem"
                        >
                          <lucide-icon name="ban" [size]="14" class="mr-1"></lucide-icon> Block
                        </app-button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- No Results Message -->
                <div *ngIf="filteredUsers.length === 0" class="text-center py-8 text-white/50">
                  <p>No users found matching your criteria</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `
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
    this.gameStats = this.adminService.getGameStats();
    
    // Calculate totals
    this.totalGames = this.gameStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0);
    this.totalWagered = this.gameStats.reduce((sum, stat) => sum + stat.totalWagered, 0);
    this.totalWon = this.gameStats.reduce((sum, stat) => sum + stat.totalWon, 0);
    this.totalProfit = this.totalWagered - this.totalWon;
  }
  
  loadTransactions(): void {
    this.transactions = this.adminService.getTransactions();
    this.filterTransactions();
  }
  
  loadWithdrawals(): void {
    this.withdrawalRequests = this.adminService.getWithdrawalRequests();
    this.filterWithdrawals();
    this.pendingWithdrawals = this.withdrawalRequests.filter(w => w.status === 'pending');
  }
  
  loadUsers(): void {
    this.users = this.adminService.getUsers();
    this.filterUsers();
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