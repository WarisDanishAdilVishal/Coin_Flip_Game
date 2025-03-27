export interface User {
  id?: string;
  username: string;
  password?: string;
  balance?: number;
  createdAt?: Date;
  role?: string;
  roles?: string[];  // Array of roles
  email: string;  // Make email required
  
  // Game statistics fields (explicitly defined as numbers)
  totalGames?: number;
  gamesWon?: number;
  gamesLost?: number;
  lifetimeEarnings?: number;
  highestWin?: number;
  status?: string;
  lastActive?: Date;
}