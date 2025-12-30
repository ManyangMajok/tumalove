-- 20251230_finance_overhaul.sql
-- COMPLETE FINANCIAL ENGINE REFACTOR
-- Features: Instant Settlement, Split Ledger, RLS Locking, Atomic RPCs

-- 1. CLEANUP & SAFETY
DROP FUNCTION IF EXISTS record_successful_payment; -- Deprecated to prevent double-crediting
DROP FUNCTION IF EXISTS process_payment_callback(TEXT, NUMERIC, TEXT); -- Drop old signatures

-- 2. DATA INTEGRITY
-- Prevent duplicate processing of M-Pesa receipts
UPDATE transactions SET mpesa_code = NULL WHERE mpesa_code IN ('FAILED', 'CANCELLED', 'PENDING');
CREATE UNIQUE INDEX IF NOT EXISTS unique_mpesa_receipt_code ON transactions(mpesa_code) WHERE mpesa_code IS NOT NULL;

-- 3. RLS SECURITY POLICIES (The "Lockdown")
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- (Paste the RLS policies we agreed on here, or note them for the team)
-- [Creators: SELECT Own] [Admins: SELECT All] [No INSERT/UPDATE allowed from client]

-- 4. ATOMIC RPC: Request Withdrawal (Creator)
CREATE OR REPLACE FUNCTION request_withdrawal(p_creator_id UUID, p_amount DECIMAL, p_phone TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_withdrawal_id UUID;
  v_current_balance DECIMAL;
BEGIN
  SELECT available_balance INTO v_current_balance FROM creator_balances WHERE creator_id = p_creator_id FOR UPDATE;
  IF v_current_balance < p_amount THEN RAISE EXCEPTION 'Insufficient funds'; END IF;
  UPDATE creator_balances SET available_balance = available_balance - p_amount, pending_balance = pending_balance + p_amount WHERE creator_id = p_creator_id;
  INSERT INTO withdrawals (creator_id, amount, status, mpesa_number) VALUES (p_creator_id, p_amount, 'PENDING', p_phone) RETURNING id INTO v_withdrawal_id;
  RETURN v_withdrawal_id;
END;
$$;

-- 5. ATOMIC RPC: Complete Withdrawal (Admin)
CREATE OR REPLACE FUNCTION complete_withdrawal(p_withdrawal_id UUID, p_mpesa_reference TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_amount DECIMAL; v_creator_id UUID; v_status TEXT;
BEGIN
  SELECT amount, creator_id, status INTO v_amount, v_creator_id, v_status FROM withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
  IF v_status != 'PENDING' THEN RAISE EXCEPTION 'Already processed'; END IF;
  UPDATE withdrawals SET status = 'COMPLETED', mpesa_reference = p_mpesa_reference, updated_at = NOW() WHERE id = p_withdrawal_id;
  UPDATE creator_balances SET pending_balance = pending_balance - v_amount WHERE creator_id = v_creator_id;
  UPDATE platform_balances SET balance = balance - v_amount WHERE account_type = 'escrow';
  INSERT INTO ledger_entries (type, amount, account_type, description, reference_id) VALUES ('payout', v_amount, 'escrow', 'Manual Payout', p_withdrawal_id);
END;
$$;

-- 6. CORE LOGIC: M-Pesa Callback (Instant Settlement & Split Ledger)
CREATE OR REPLACE FUNCTION process_payment_callback(p_checkout_id TEXT, p_receipt_number TEXT, p_amount NUMERIC, p_phone TEXT DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_tx_id uuid; v_creator_id uuid; v_current_status text; v_fee numeric; v_net_amount numeric;
  v_new_escrow_balance numeric; v_new_revenue_balance numeric; v_new_creator_balance numeric;
BEGIN
  -- Idempotency
  SELECT id, status, creator_id INTO v_tx_id, v_current_status, v_creator_id FROM transactions WHERE checkout_request_id = p_checkout_id;
  IF v_tx_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'Transaction not found'); END IF;
  IF v_current_status = 'COMPLETED' THEN RETURN json_build_object('success', true, 'message', 'Already processed'); END IF;

  -- Math
  v_fee := floor(p_amount * 0.05); v_net_amount := p_amount - v_fee;

  -- Update Transaction
  UPDATE transactions SET status = 'COMPLETED', mpesa_code = p_receipt_number, updated_at = now(), net_amount = v_net_amount, platform_fee = v_fee WHERE id = v_tx_id;

  -- Split Ledger Accounting
  UPDATE platform_balances SET balance = balance + v_net_amount WHERE account_type = 'escrow' RETURNING balance INTO v_new_escrow_balance;
  UPDATE platform_balances SET balance = balance + v_fee WHERE account_type = 'revenue' RETURNING balance INTO v_new_revenue_balance;
  
  -- Instant Settlement
  INSERT INTO creator_balances (creator_id, available_balance, lifetime_earnings, updated_at) VALUES (v_creator_id, v_net_amount, v_net_amount, now())
  ON CONFLICT (creator_id) DO UPDATE SET available_balance = creator_balances.available_balance + v_net_amount, lifetime_earnings = creator_balances.lifetime_earnings + v_net_amount, updated_at = now()
  RETURNING available_balance INTO v_new_creator_balance;

  -- Ledger Entries
  INSERT INTO ledger_entries (creator_id, transaction_id, type, amount, balance_after, account_type, description) VALUES (NULL, v_tx_id, 'deposit', v_net_amount, v_new_escrow_balance, 'escrow', 'M-Pesa Inflow (Net)');
  INSERT INTO ledger_entries (creator_id, transaction_id, type, amount, balance_after, account_type, description) VALUES (v_creator_id, v_tx_id, 'credit', v_net_amount, v_new_creator_balance, 'creator', 'Net Earnings (Instant)');
  INSERT INTO ledger_entries (creator_id, transaction_id, type, amount, balance_after, account_type, description) VALUES (NULL, v_tx_id, 'fee', v_fee, v_new_revenue_balance, 'revenue', 'Platform Fee 5%');

  RETURN json_build_object('success', true);
END;
$$;