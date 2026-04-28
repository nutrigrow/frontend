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
import Dashboard from './pages/dashboard'
import NutriShop from './pages/nutrishop'
import ProductDetail from './pages/product-detail'
import Checkout from './pages/checkout'
import OrderDetail from './pages/order-detail'
import Profile from './pages/profile'
import Cart from './pages/cart'
import Artikel from './pages/artikel'
import BacaArtikel from './pages/baca-artikel'
import TeleNutritionist from './pages/tele-nutritionist'
import DetailSpesialis from './pages/detail-spesialis'
import BookingKonsultasi from './pages/booking-konsultasi'
import KonsultasiSaya from './pages/konsultasi-saya'
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
              <Route path="/nutrishop"     element={<NutriShop />} />
              <Route path="/product/:id"   element={<ProductDetail />} />
              <Route path="/checkout"      element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/artikel" element={<Artikel />} />
              <Route path="/baca-artikel/:id" element={<BacaArtikel />} />

              {/* ── Auth only: redirect ke /dashboard jika sudah login ── */}
              <Route path="/sign-in"        element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
              <Route path="/sign-up"        element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

              {/* ── Protected: redirect ke /about-us jika belum login ── */}
              <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/growth-tracker" element={<ProtectedRoute><GrowthTracker /></ProtectedRoute>} />
              <Route path="/health-log"     element={<ProtectedRoute><HealthLog /></ProtectedRoute>} />
              <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/cart"           element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/orders"         element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/order/:id"      element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/tele-nutritionist" element={<TeleNutritionist />} />
              <Route path="/detail-spesialis/:id" element={<DetailSpesialis />} />
              <Route path="/booking-konsultasi/:id" element={<BookingKonsultasi />} />
              <Route path="/konsultasi-saya" element={<KonsultasiSaya />} />
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