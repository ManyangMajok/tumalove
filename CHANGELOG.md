# Changelog

All notable changes to the "Tumalove" platform will be documented in this file.

## [v1.0.0] - 2025-12-28 "Fort Knox Release"

### 🚀 Major Features
- **Double-Entry Ledger:** Implemented a custodial ledger system to track `platform_balances` (Assets/Equity) vs. `creator_balances` (Liabilities).
- **Admin Mission Control:** A separate, secure portal for managing payouts and monitoring system health.
- **2FA Enforcement:** Mandatory Time-based One-Time Password (TOTP) for all admin accounts.

### 🛡️ Security Architecture
- **Secret Routing:** Admin portal moved behind a configurable secret URL (`/portal-x...`) to prevent bot enumeration.
- **IP Allowlisting:** Database-level blocking of unauthorized IP addresses for admin accounts.
- **Database-Level MFA:** RLS policies now enforce `aal2` (Authenticator Assurance Level 2) session checks for sensitive tables.
- **Immutable Audit Logs:** All critical actions (Payouts, Logins, Security Events) are logged to `security_audit_log`.

### ⚡ Technical Improvements
- **Atomic Operations:** Migrated financial logic (Withdrawals, Payouts) to Postgres RPCs to prevent race conditions.
- **Solvency Auditor:** Added `LedgerAuditor` widget that polls `escrow_reconciliation` view to ensure `Assets - Liabilities = 0`.
- **Zero-Trust Frontend:** Removed client-side balance calculations; the frontend now strictly reads authoritative database views.

### 🔧 Database Changes
- Added tables: `admin_users`, `admin_allowed_ips`, `platform_balances`, `creator_balances`.
- Added RPCs: `request_withdrawal`, `complete_withdrawal`, `get_creator_balance`.
- Added Views: `escrow_reconciliation`.