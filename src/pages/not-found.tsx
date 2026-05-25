import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAF9',
        padding: '40px 20px',
        fontFamily: 'var(--font-heading), sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '48px 32px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
          border: '1px solid #E7E5E4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Animated 404 Art */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'relative',
            width: 180,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F0F5EB',
            borderRadius: '50%',
            marginBottom: 8,
          }}
        >
          {/* Subtle decorative circles */}
          <div
            style={{
              position: 'absolute',
              width: '115%',
              height: '115%',
              borderRadius: '50%',
              border: '2px dashed #D9E4CE',
              opacity: 0.5,
              animation: 'spin 20s linear infinite',
            }}
          />
          
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              fontFamily: 'Montserrat, sans-serif',
              margin: 0,
              color: '#628141',
              letterSpacing: -2,
            }}
          >
            404
          </h1>
        </motion.div>

        {/* Text Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 22,
              fontWeight: 800,
              color: '#1C1917',
              margin: 0,
            }}
          >
            Halaman Tidak Ditemukan
          </h2>
          <p
            style={{
              fontSize: 14,
              color: '#78716C',
              lineHeight: '22px',
              margin: 0,
            }}
          >
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan ke alamat lain.
          </p>
        </div>

        {/* CTA Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            marginTop: 8,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '14px',
              background: '#628141',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(98, 129, 65, 0.25)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#4D6632')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#628141')}
          >
            <Home size={18} />
            Kembali ke Beranda
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '14px',
              background: '#FFFFFF',
              color: '#44403C',
              border: '1px solid #E7E5E4',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#F5F5F4'
              el.style.borderColor = '#D6D3D1'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#FFFFFF'
              el.style.borderColor = '#E7E5E4'
            }}
          >
            <ArrowLeft size={18} />
            Halaman Sebelumnya
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
