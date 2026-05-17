import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext' 

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
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import ScrollToTop from './components/scroll-to-top'

import AdminDashboard from './pages/admin/dashboard';
import TransaksiTeleNutri from './pages/admin/tele';
import TransaksiNutriShop from './pages/admin/nutrishop';
import UserManagement from "./pages/admin/user-management";
import ProductManagement from "./pages/admin/product-management";
import NutritionistManagement from "./pages/admin/nutritionist-management";
import ArticleManagement from "./pages/admin/article-management";

// ─── Layout Wrapper ──────────────────────────────────────────────────────────
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Redirect logged-in admin immediately to the admin console if they try to access any regular/public route.
    if (isLoggedIn && user?.role?.toUpperCase() === 'ADMIN' && !isAdminRoute && location.pathname !== '/auth/callback') {
      navigate('/admin', { replace: true });
    }
  }, [isLoggedIn, user, isAdminRoute, location.pathname, navigate]);

  return (
    <div className={isAdminRoute ? '' : 'min-h-screen bg-white flex flex-col'}>
      {/* Header global TIDAK tampil di halaman admin */}
      {!isAdminRoute && <Header />}

      <div className={isAdminRoute ? '' : 'flex-grow'}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"              element={<AboutUs />} />
          <Route path="/verify-email"  element={<VerifyEmail />} />  
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/nutrishop"     element={<NutriShop />} />
          <Route path="/product/:id"   element={<ProductDetail />} />
          <Route path="/checkout"      element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/artikel"       element={<Artikel />} />
          <Route path="/baca-artikel/:id" element={<BacaArtikel />} />

          {/* ── Auth only ── */}
          <Route path="/sign-in"        element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
          <Route path="/sign-up"        element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

          {/* ── Protected ── */}
          <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/growth-tracker" element={<ProtectedRoute><GrowthTracker /></ProtectedRoute>} />
          <Route path="/health-log"     element={<ProtectedRoute><HealthLog /></ProtectedRoute>} />
          <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cart"           element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders"         element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/order/:id"      element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/tele-nutritionist"       element={<TeleNutritionist />} />
          <Route path="/detail-spesialis/:id"    element={<DetailSpesialis />} />
          <Route path="/booking-konsultasi/:id"  element={<BookingKonsultasi />} />
          <Route path="/konsultasi-saya"         element={<KonsultasiSaya />} />

          
          <Route path="/admin"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/tele"         element={<AdminRoute><TransaksiTeleNutri /></AdminRoute>} />
          <Route path="/admin/nutrishop"    element={<AdminRoute><TransaksiNutriShop /></AdminRoute>} />
          <Route path="/admin/users"        element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/products"     element={<AdminRoute><ProductManagement /></AdminRoute>} />
          <Route path="/admin/nutritionists" element={<AdminRoute><NutritionistManagement /></AdminRoute>} />
          <Route path="/admin/articles"     element={<AdminRoute><ArticleManagement /></AdminRoute>} />
        </Routes>
      </div>

      {/* Footer global TIDAK tampil di halaman admin */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

// ─── Main App Component ───────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  )
}

export default App
