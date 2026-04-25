import { motion } from 'motion/react'
import { Video, MessageSquare, Clock, Star } from 'lucide-react'
import { type Spesialis, formatHarga } from '../data/spesialis'

// ─── Nutri-Green Color Palette ────────────────────────────────────────────────
const NUTRI_GREEN = '#628141'
const NUTRI_GREEN_LIGHT = '#F0F7E8'
const NUTRI_GREEN_BORDER = '#C8DBA8'

// ─── Specialization Color Map ─────────────────────────────────────────────────
const SPESIALISASI_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  'Spesialis Anak': { bg: '#ECFCCB', text: '#3F6212', border: '#D9F99D' },
  'Kehamilan': { bg: '#FEE2E2', text: '#9F1239', border: '#FECACA' },
  'Ibu Menyusui': { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },
  'Nutrisi Olahraga': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  'Tumbuh Kembang': { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  'MPASI': { bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
}

const getSpesialisasiColor = (spesialisasi: string) =>
  SPESIALISASI_COLOR[spesialisasi] ?? { bg: NUTRI_GREEN_LIGHT, text: NUTRI_GREEN, border: NUTRI_GREEN_BORDER }

interface CardSpesialisProps {
  spesialis: Spesialis
  onClick?: (id: number) => void
}

export const CardSpesialis = ({ spesialis, onClick }: CardSpesialisProps) => {
  const { id, nama, gelar, spesialisasi, pengalamanTahun, harga, foto, nextAvailable } = spesialis
  const catColor = getSpesialisasiColor(spesialisasi)

  const handleClick = () => {
    if (onClick) {
      onClick(id)
    } else {
      window.location.href = `/detail-spesialis/${id}`
    }
  }

  return (
    <motion.div
      onClick={handleClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1.5px solid #E7E5E4',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'border-color 0.2s',
      }}
      whileHover={{
        y: -6,
        borderColor: NUTRI_GREEN,
        boxShadow: '0 16px 40px rgba(98, 129, 65, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      {/* ── Doctor Photo ── */}
      <div
        style={{
          width: '100%',
          height: 220,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#F0F7E8',
          position: 'relative',
        }}
      >
        <img
          src={foto}
          alt={nama}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80'
          }}
        />

        {/* Specialization Badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 9999,
            background: catColor.bg,
            border: `1px solid ${catColor.border}`,
            backdropFilter: 'blur(6px)',
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              color: catColor.text,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
            }}
          >
            {spesialisasi}
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div
        style={{
          padding: '16px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
        }}
      >
        {/* Name & Degree */}
        <div>
          <h3
            style={{
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              color: '#1C1917',
              lineHeight: '22px',
            }}
          >
            {nama}
          </h3>
          <p
            style={{
              margin: '2px 0 0',
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 12,
              color: '#78716C',
              lineHeight: '18px',
            }}
          >
            {gelar} · {spesialisasi}
          </p>
        </div>

        {/* Experience */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <Star size={12} color={NUTRI_GREEN} fill={NUTRI_GREEN} strokeWidth={0} />
          <span
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 12,
              color: '#44403C',
            }}
          >
            {pengalamanTahun}+ tahun pengalaman
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#F0EDE8', margin: '6px 0' }} />

        {/* Price Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Video size={12} color={NUTRI_GREEN} strokeWidth={2} />
              <span
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 12,
                  color: '#78716C',
                }}
              >
                Video Call
              </span>
            </div>
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                color: '#1C1917',
              }}
            >
              {formatHarga(harga.videoCall)}
              <span
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontWeight: 400,
                  fontSize: 11,
                  color: '#78716C',
                }}
              >
                {' '}
                / sesi
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MessageSquare size={12} color={NUTRI_GREEN} strokeWidth={2} />
              <span
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 12,
                  color: '#78716C',
                }}
              >
                Text Chat
              </span>
            </div>
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                color: '#1C1917',
              }}
            >
              {formatHarga(harga.chat)}
              <span
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontWeight: 400,
                  fontSize: 11,
                  color: '#78716C',
                }}
              >
                {' '}
                / sesi
              </span>
            </span>
          </div>
        </div>

        {/* Next Available */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 5,
            marginTop: 4,
          }}
        >
          <Clock size={11} color='#22C55E' strokeWidth={2.5} />
          <span
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: '#16A34A',
            }}
          >
            Tersedia: {nextAvailable}
          </span>
        </div>
      </div>
    </motion.div>
  )
}