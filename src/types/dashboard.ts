export interface Transaction {
  id: string;
  amount: number;
  supporter_name: string;
  supporter_message: string;
  created_at: string;
  status: string;
  mpesa_code: string;
  net_amount?: number;   // What you actually earn
  platform_fee?: number; // The 5% fee
}

export interface Profile {
    id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  goal_current: number;
  bio: string;
  mpesa_number: string;
  verification_status: 'unverified' | 'pending' | 'verified';
}

export interface TopSupporter {
  name: string;
  totalAmount: number;
  count: number;
}