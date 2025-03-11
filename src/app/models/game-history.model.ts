export interface GameHistory {
  choice: string;
  outcome: string;
  won: boolean;
  bet: number;
  winAmount: number;
  timestamp: Date;
  gameType: string;
}