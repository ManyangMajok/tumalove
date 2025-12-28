# 🏦 Financial Architecture & Ledger System

> **WARNING:** This system handles real money. Do not manually update balances in the database. All money movement must occur via the RPCs described below.

## 1. Core Concept: Double-Entry Ledger
We do not "calculate" balances by summing transactions on the fly. We maintain authoritative balance tables backed by a `ledger_entries` audit trail.

### The Accounting Equation
At any millisecond, this equation MUST hold true:

Escrow Balance (Assets) == Creator Liabilities + Platform Revenue (Equity)

If this breaks, stop all payouts immediately.

## 2. Key Database Tables

| Table | Purpose | Constraint |
| :--- | :--- | :--- |
| `platform_balances` | Tracks physical cash in Paybill (`escrow`) and our earnings (`revenue`). | `CHECK (balance >= 0)` |
| `creator_balances` | Tracks what we owe users. Separated into `available` (can withdraw) and `pending` (locked). | `CHECK (available >= 0)` |
| `withdrawals` | Queue of payout requests. | `idempotency_key` unique |
| `ledger_entries` | Immutable audit log of every cent moved. | Types: `deposit`, `credit`, `fee`, `withdrawal` |

## 3. Money Flow Lifecycle

### A. Incoming Payment (M-Pesa)
**Trigger:** `process_payment_callback` (RPC)
1.  **Escrow** increases by 100% of amount.
2.  **Revenue** increases by 5% (Platform Fee).
3.  **Creator Pending** increases by 95% (Net).
4.  **Ledger** records 3 entries.

### B. Settlement (Time-Based)
**Trigger:** `settle_pending_balances` (Cron / RPC)
1.  Finds transactions older than 24 hours.
2.  Moves money: `Creator Pending` -> `Creator Available`.
3.  Marks transaction as `is_settled`.

### C. Withdrawal Request
**Trigger:** `request_withdrawal` (RPC)
1.  Frontend generates a UUID `idempotency_key`.
2.  Backend locks the row (`FOR UPDATE`).
3.  Checks `available_balance >= amount`.
4.  Deducts `available_balance` immediately.
5.  Creates `PENDING` withdrawal record.

### D. Payout (B2C)
**Trigger:** `complete_withdrawal` (RPC - Admin/Bot)
1.  Money is sent via M-Pesa B2C.
2.  **Escrow** balance is decreased.
3.  Withdrawal marked `COMPLETED`.

## 4. Developer Rules ⚠️

1.  **Frontend is Read-Only:** Never calculate "how much money a user has" in React. Fetch `creator_balances`.
2.  **Use RPCs:** Never write `INSERT INTO withdrawals` or `UPDATE balances` directly from the client. Use `supabase.rpc()`.
3.  **Idempotency:** Always pass a UUID when requesting money to prevent double-clicks.
4.  **Reconciliation:** Check the `escrow_reconciliation` view daily. The `reconciliation_gap` column must always be 0.
3. Next Steps for the Team



# Admin System Architecture (v1.0)

## 1. Access Control Strategy
The Admin system uses a "Defense in Depth" strategy:
1.  **Obscurity:** The login route is hidden (Configurable in `src/features/admin/config.ts`).
2.  **Identity:** Access requires Email/Password + TOTP (Google Authenticator).
3.  **Network:** Access is restricted to whitelisted IPs via `admin_allowed_ips` table.
4.  **Data:** RLS policies block read access to admin tables unless the session is `aal2` verified.

## 2. Financial Workflow
Money movement follows a strict maker-checker flow:
1.  **Request:** Creator clicks "Withdraw" -> RPC `request_withdrawal` locks funds (moves from `Available` to `Pending`).
2.  **Queue:** Admin views `Pending` requests in the Payout Queue.
3.  **Approval:** Admin clicks "Approve" -> RPC `complete_withdrawal` executes the transfer and updates the Ledger.

## 3. Disaster Recovery
If the `LedgerAuditor` component turns RED (Reconciliation Gap != 0):
1.  System automatically logs the discrepancy.
2.  Admins must halt all payouts.
3.  Database "Circuit Breaker" can be toggled in `system_config` to freeze all RPCs.