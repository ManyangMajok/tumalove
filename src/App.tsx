import { BrowserRouter, Routes, Route, Navigate, } from 'react-router-dom'

// Public & Creator Pages
import Home from './pages/Home'
import CreatorProfile from './pages/CreatorProfile'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import CheckEmail from './pages/CheckEmail'
import CreatorDashboard from './pages/Dashboard'
import CreatorSetup from './pages/CreatorSetup'
import Settings from './pages/Settings'
import Transactions from './pages/Transactions'
import HeadlessAuth from './layouts/HeadlessAuth';


// Admin Pages
import AdminLogin from './features/admin/pages/AdminLogin'
import AdminDashboard from './features/admin/pages/Dashboard'
import AdminPayouts from './features/admin/pages/Payouts'
import AdminSecurity from './features/admin/pages/Security'
import MfaSetup from './features/admin/pages/MfaSetup'
import AdminVerifications from './features/admin/pages/VerificationRequests'
import AdminLayout from './features/admin/layouts/AdminLayout'
import AdminAnalytics from './features/admin/pages/Analytics'

// --- SECRET ADMIN PATH ---
import { ADMIN_ROOT } from './features/admin/config'
// -------------------------

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/check-email" element={<CheckEmail />} />

        {/* Creator */}
        <Route element={<HeadlessAuth />}>
         <Route path="/dashboard" element={<CreatorDashboard />} />
         <Route path="/transactions" element={<Transactions />} />
         <Route path="/setup" element={<CreatorSetup />} />
         <Route path="/settings" element={<Settings />} />
        </Route>
      

        {/* Admin Secret Portal */}
        <Route path={`${ADMIN_ROOT}/login`} element={<AdminLogin />} />
        <Route path={`${ADMIN_ROOT}/analytics`} element={<AdminAnalytics />} />

        {/* WRAPPER ROUTE: Keeps AdminLayout alive */}
        <Route element={<AdminLayout />}>
          <Route path={`${ADMIN_ROOT}/dashboard`} element={<AdminDashboard />} />
          <Route path={`${ADMIN_ROOT}/payouts`} element={<AdminPayouts />} />
          <Route path={`${ADMIN_ROOT}/security`} element={<AdminSecurity />} />
          <Route path={`${ADMIN_ROOT}/setup-2fa`} element={<MfaSetup />} />
          <Route path={`${ADMIN_ROOT}/verifications`} element={<AdminVerifications />} />
        </Route>

        {/* Security Redirects */}
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/admin/*" element={<Navigate to="/" replace />} />

        {/* Dynamic Profiles (Last) */}
        <Route path="/:username" element={<CreatorProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
