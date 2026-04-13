import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Header from './components/header'
import Footer from './components/footer'
import HealthLog from './pages/health-log'

// Mock user untuk Header
const mockUser = {
  name: "Mama Nutri",
  avatarUrl: "https://i.pravatar.cc/150?u=nutri"
}

// ─── Komponen Landing Page ──────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <main>
      {/* HERO SECTION */}
      <section className="px-5 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto">
          <span 
            className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full"
            style={{ background: 'var(--color-nutri-green-soft)', color: 'var(--color-nutri-green)' }}
          >
            🌱 Solusi Nutrisi Keluarga #1 di Indonesia
          </span>
          
          <h1 
            className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1]"
            style={{ fontFamily: 'var(--font-heading)', color: '#1e293b' }}
          >
            Tumbuh Maksimal dengan <br /> 
            <span style={{ color: 'var(--color-nutri-green)' }}>Nutrisi yang Tepat</span>
          </h1>
          
          <p 
            className="text-base md:text-lg lg:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-nutri-slate)', fontFamily: 'var(--font-main)' }}
          >
            Pantau tumbuh kembang si kecil, konsultasi dengan ahli gizi, dan temukan 
            produk nutrisi terbaik hanya dalam satu dashboard yang mudah digunakan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/sign-in" className="w-full sm:w-auto">
              <button 
                className="w-full px-8 py-4 rounded-full font-bold text-white transition-transform hover:scale-105"
                style={{ background: 'var(--color-nutri-green)', fontSize: '16px' }}
              >
                Mulai Gratis Sekarang
              </button>
            </Link>

            <button 
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold border-2 transition-colors hover:bg-gray-50"
              style={{ 
                borderColor: 'var(--color-nutri-border)', 
                color: 'var(--color-nutri-slate)',
                fontSize: '16px'
              }}
            >
              Lihat Katalog Produk
            </button>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section 
        className="py-12 border-y"
        style={{ borderColor: 'var(--color-nutri-border)', background: '#fcfcfc' }}
      >
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Pengguna Aktif", val: "10K+" },
              { label: "Nutrisi Terverifikasi", val: "500+" },
              { label: "Ahli Gizi", val: "50+" },
              { label: "Kota Terjangkau", val: "120+" }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-nutri-green)' }}>{stat.val}</p>
                <p className="text-xs md:text-sm font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--color-nutri-slate-light)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── Main App Component (Routing + Layout) ──────────────────────────────────
function App() {
  return (
    <Router>
      <div className='min-h-screen bg-white flex flex-col'>
        {/* Header */}
        <Header user={mockUser} />
        
        {/* Content Area */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/health-log" element={<HealthLog />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  )
}

export default App