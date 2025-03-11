export interface GameStats {
  betAmount: number;
  gamesPlayed: number;
  totalWagered: number;
  totalWon: number;
  profitLoss: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdrawal' | 'game';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  details?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export interface UserStats {
  totalGames: number;
  totalWagered: number;
  totalWon: number;
  profitLoss: number;
  lastActive: Date;
}

export interface UserManagement {
  id: string;
  username: string;
  balance: number;
  createdAt: Date;
  status: 'active' | 'suspended' | 'blocked';
  stats: UserStats;
}