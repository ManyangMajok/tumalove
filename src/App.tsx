import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public pages
import Home from './pages/Home'
import CreatorProfile from './pages/CreatorProfile'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import CheckEmail from './pages/CheckEmail'

// Creator (private) pages
import Dashboard from './pages/Dashboard'
import CreatorSetup from './pages/CreatorSetup'
import Settings from './pages/Settings'

// Admin
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminAuth from './components/AdminAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ───────── PUBLIC ROUTES ───────── */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/check-email" element={<CheckEmail />} />

        {/* ───────── CREATOR ROUTES ───────── */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setup" element={<CreatorSetup />} />
        <Route path="/settings" element={<Settings />} />

        {/* ───────── ADMIN ROUTES ───────── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminAuth>
              <AdminDashboard />
            </AdminAuth>
          }
        />

        {/* Redirect /admin → /admin/dashboard */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* ───────── DYNAMIC PUBLIC PROFILES (MUST BE LAST) ───────── */}
        <Route path="/:username" element={<CreatorProfile />} />

        {/* ───────── OPTIONAL FALLBACK ───────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
