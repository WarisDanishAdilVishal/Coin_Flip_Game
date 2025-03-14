export interface GameHistory {
  id?: number;
  username?: string;
  choice: string;
  outcome: string;
  won: boolean;
  bet: number;        // Will be mapped from betAmount
  betAmount?: number; // From backend
  winAmount: number;
  timestamp: Date;    // Will be mapped from playedAt
  playedAt?: string;  // From backend
  gameType: string;
  balance: number;
}