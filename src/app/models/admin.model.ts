export interface GameStats {
  betAmount: number;
  gamesPlayed: number;
  totalWagered: number;
  totalWon: number;
  profitLoss: number;
  houseProfit: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdrawal' | 'game';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  details?: string;
  method?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface UserStats {
  totalGames: number;
  totalWagered: number;
  totalWon: number;
  profitLoss: number;
  lastActive: string;
}

export interface UserManagement {
  id: string;
  username: string;
  balance: number;
  status: 'active' | 'suspended' | 'blocked';
  createdAt: string;
  roles?: string[];
  stats?: {
    totalGames: number;
    profitLoss: number;
    lastActive: string;
  };
}