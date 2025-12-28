export interface AdminUser {
  user_id: string;
  email: string;
  role: 'admin' | 'super_admin';
}

export interface PlatformBalance {
  account_type: 'revenue' | 'escrow' | 'loss';
  balance: number;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    mpesa_number: string;
  };
}

export interface SecurityAlert {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  created_at: string;
}