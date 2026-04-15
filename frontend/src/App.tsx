import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' 

import Header from './components/header'
import Footer from './components/footer'
import AboutUs from './pages/about-us'
import SignIn from './pages/auth/sign-in'
import SignUp from './pages/auth/sign-up'
import ResetPassword from './pages/auth/reset-password'
import GrowthTracker from './pages/growth-tracker'
import HealthLog from './pages/health-log'
import VerifyEmail from './pages/auth/verify-email'
import OAuthCallback from './pages/auth/oauth-callback' 
import Dashboard from './pages/Dashboard'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'

// ─── Main App Component (Routing + Layout) ──────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className='min-h-screen bg-white flex flex-col'>
          {/* Header */}
          <Header />
          
          {/* Content Area */}
          <div className="flex-grow">
            <Routes>
              {/* ── Public: siapa saja bisa akses ── */}
              <Route path="/"             element={<AboutUs />} />
              <Route path="/verify-email" element={<VerifyEmail />} />  
              <Route path="/auth/callback" element={<OAuthCallback />} /> 

              {/* ── Auth only: redirect ke /dashboard jika sudah login ── */}
              <Route path="/sign-in"        element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
              <Route path="/sign-up"        element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

              {/* ── Protected: redirect ke /about-us jika belum login ── */}
              <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/growth-tracker" element={<ProtectedRoute><GrowthTracker /></ProtectedRoute>} />
              <Route path="/health-log"     element={<ProtectedRoute><HealthLog /></ProtectedRoute>} />
            </Routes>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App