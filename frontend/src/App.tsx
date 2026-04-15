<<<<<<< HEAD
=======
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Header from './components/header'
import Footer from './components/footer'
import AboutUs from './pages/about-us'
import Dashboard from "./pages/Dashboard";

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
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  )
>>>>>>> origin/feature/about-us
}

export default App;