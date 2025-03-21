export interface WithdrawalRequest {
  id: number;
  amount: number;
  method: string;
  details: string;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: string;
} 