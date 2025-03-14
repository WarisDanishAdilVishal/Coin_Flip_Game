export interface User {
  id?: string;
  username: string;
  password?: string;
  balance?: number;
  createdAt?: Date;
  role?: string;
  
  // Game statistics fields (explicitly defined as numbers)
  email?: string;
  totalGames?: number;
  gamesWon?: number;
  gamesLost?: number;
  lifetimeEarnings?: number;
  highestWin?: number;
  status?: string;
  lastActive?: Date;
}