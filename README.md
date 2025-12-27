# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# Tumalove (v1.0.0) 🇰🇪

Tumalove (formerly Project Shikilia) is a direct-support platform enabling fans to tip Kenyan creators via M-Pesa. 

## 🏗 System Architecture

### 1. The Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (Lucide React for icons).
- **Backend:** Supabase (PostgreSQL, Auth, Realtime).
- **Compute:** Supabase Edge Functions (Deno).
- **Payments:** Safaricom M-Pesa Daraja API (STK Push).

### 2. Payment Flow (The "Triple-Strategy")
To solve the "Zombie Transaction" issue (where users pay but the UI freezes), we utilize a resilient 3-layer listener strategy:
1.  **Realtime (WebSocket):** Listens for `INSERT/UPDATE` on the `transactions` table. Primary success path.
2.  **Polling (Fallback):** Checks the DB every 2 seconds in case the WebSocket drops.
3.  **Timeout (Safety):** Hard reset after 150 seconds if M-Pesa fails to respond.

### 3. Security & Logic
- **Guest Access:** Public users can pay without login. `mpesa-stk-push` Edge Function has JWT Verification DISABLED.
- **Fraud Detection:** - The `mpesa-callback` Edge Function compares the `amount` paid vs `amount` requested.
    - Phone numbers are normalized (07xx -> 2547xx) before comparison.
- **Idempotency:** The callback handles duplicate requests from Safaricom gracefully.
- **Privacy:** Frontend queries explicitly exclude sensitive columns (phone numbers) from public views.

### 4. Database Schema (Key Tables)
- `transactions`: Stores payment state (`PENDING`, `COMPLETED`, `FAILED`).
- `profiles`: Creator details linked to Supabase Auth.
- `security_audit_log`: Tracks payment anomalies and errors.

## 🚀 Setup & Deploy

### Environment Variables
Required in `.env.local` and Supabase Secrets:
- `VITE_SUPABASE_URL`: Public API URL.
- `VITE_SUPABASE_ANON_KEY`: Public Anon Key.
- `SUPABASE_SERVICE_ROLE_KEY`: (Backend only) For Edge Functions.
- `MPESA_CONSUMER_KEY`: Daraja API.
- `MPESA_CONSUMER_SECRET`: Daraja API.
- `MPESA_PASSKEY`: Daraja API.

### Deployment
1. Frontend: Vercel / Netlify (`npm run build`).
2. Backend: `supabase functions deploy mpesa-stk-push` & `mpesa-callback`.

---
*© 2025 Tumalove Inc.*