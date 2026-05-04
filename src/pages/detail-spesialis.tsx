import { useEffect, useState, type ElementType, type ReactNode } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  Award,
  GraduationCap,
  ShieldCheck,
  Stethoscope,
  Video,
  MessageSquare,
  Clock,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { formatHarga } from '../data/spesialis'
import { teleNutritionistService, type Spesialis } from '../services/teleNutritionist.service'

// ─── Nutri-Green Palette ──────────────────────────────────────────────────────
const NG = {
  primary: '#628141',
  dark: '#4D6632',
  darker: '#3F6212',
  light: '#F0F7E8',
  lighter: '#F7FCF0',
  border: '#C8DBA8',
  mid: '#8DB96A',
}

// ─── Breakpoint Helper ────────────────────────────────────────────────────────
const useBreakpoint = () => {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return bp
}

const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '20px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}

// ─── Specialization Color Map ─────────────────────────────────────────────────
const SPESIALISASI_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  'Spesialis Anak': { bg: '#ECFCCB', text: '#3F6212', border: '#D9F99D' },
  Kehamilan: { bg: '#FEE2E2', text: '#9F1239', border: '#FECACA' },
  'Ibu Menyusui': { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },
  'Nutrisi Olahraga': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  'Tumbuh Kembang': { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  MPASI: { bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
}

// ─── Info Card (colored) ──────────────────────────────────────────────────────
const InfoCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  accent,
}: {
  icon: ElementType
  title: string
  subtitle?: string
  children?: ReactNode
  accent: { bg: string; iconBg: string; iconColor: string; border: string; titleColor: string }
}) => (
  <div
    style={{
      background: accent.bg,
      border: `1.5px solid ${accent.border}`,
      borderRadius: 16,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: accent.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={accent.iconColor} strokeWidth={2} />
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: accent.titleColor,
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              margin: '2px 0 0',
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 12,
              color: accent.titleColor,
              opacity: 0.75,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {children}
  </div>
)

// ─── Not Found ────────────────────────────────────────────────────────────────
function SpesialisNotFound() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 56 }}>🔍</div>
      <div>
        <h2
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 28,
            color: '#1C1917',
            margin: '0 0 8px',
          }}
        >
          Spesialis Tidak Ditemukan
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 15,
            color: '#78716C',
            margin: 0,
          }}
        >
          Profil spesialis yang Anda cari tidak tersedia.
        </p>
      </div>
      <button
        onClick={() => navigate('/tele-nutritionist')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 28px',
          background: NG.primary,
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} />
        Kembali ke Daftar Spesialis
      </button>
    </motion.div>
  )
}

// ─── Detail Spesialis Page ────────────────────────────────────────────────────
export default function DetailSpesialis() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const paddingInline = getPaddingInline(bp)

  const [spesialis, setSpesialis] = useState<Spesialis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    
    const fetchDetail = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await teleNutritionistService.getSpecialistById(id)
        setSpesialis(data)
      } catch (error) {
        console.error('Failed to fetch specialist detail:', error)
        setSpesialis(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#78716C', fontFamily: 'var(--font-heading), sans-serif' }}>Memuat profil spesialis...</p>
      </div>
    )
  }

  if (!spesialis) return <SpesialisNotFound />

  const catColor =
    SPESIALISASI_COLOR[spesialis.spesialisasi] ?? {
      bg: NG.light,
      text: NG.darker,
      border: NG.border,
    }

  const accentPengalaman = {
    bg: NG.lighter,
    iconBg: NG.light,
    iconColor: NG.darker,
    border: NG.border,
    titleColor: NG.darker,
  }
  const accentPendidikan = {
    bg: '#F0FDF4',
    iconBg: '#DCFCE7',
    iconColor: '#15803D',
    border: '#BBF7D0',
    titleColor: '#166534',
  }
  const accentMedis = {
    bg: '#F0F9FF',
    iconBg: '#E0F2FE',
    iconColor: '#0369A1',
    border: '#BAE6FD',
    titleColor: '#0C4A6E',
  }
  const accentBidang = {
    bg: '#FFF7ED',
    iconBg: '#FFEDD5',
    iconColor: '#C2410C',
    border: '#FED7AA',
    titleColor: '#9A3412',
  }

  return (
    <div
      style={{
        minHeight: '80vh',
        background: '#FAFAF9',
        fontFamily: 'var(--font-heading), sans-serif',
      }}
    >
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingTop: isMobile ? 20 : isTablet ? 28 : 36,
          paddingBottom: 80,
          paddingInline,
          boxSizing: 'border-box',
        }}
      >
        {/* ── Breadcrumb & Back ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: isMobile ? 24 : isTablet ? 28 : 36,
          }}
        >
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Link
              to='/tele-nutritionist'
              style={{
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: '#78716C',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = NG.primary)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#78716C')}
            >
              Tele-Nutritionist
            </Link>
            <ChevronRight size={13} color='#A8A29E' />
            <span
              style={{
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#1C1917',
                maxWidth: isMobile ? 140 : 280,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {spesialis.nama}
            </span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate('/tele-nutritionist')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: '#fff',
              border: '1.5px solid #E7E5E4',
              borderRadius: 9999,
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#44403C',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = NG.primary
              el.style.color = NG.primary
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#E7E5E4'
              el.style.color = '#44403C'
            }}
          >
            <ArrowLeft size={14} />
            Kembali
          </button>
        </motion.div>

        {/* ── Main Layout: Left Photo + Right Detail ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '340px 1fr',
            gap: isMobile ? 24 : isTablet ? 28 : 40,
            alignItems: 'start',
          }}
        >
          {/* ── LEFT: Photo + Price Card ── */}
          <motion.div
            initial={{ opacity: 0, x: isMobile || isTablet ? 0 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Doctor Photo */}
            <div
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.18)',
                aspectRatio: isMobile || isTablet ? '4/3' : '3/4',
                background: NG.light,
                maxHeight: isMobile || isTablet ? 300 : 440,
              }}
            >
              <img
                src={spesialis.foto}
                alt={spesialis.nama}
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
            </div>

            {/* Price & Booking Card */}
            <div
              style={{
                background: '#fff',
                border: '1.5px solid #E7E5E4',
                borderRadius: 20,
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                position: isMobile || isTablet ? 'static' : 'sticky',
                top: 24,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {/* Biaya Video Call */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: NG.lighter,
                    borderRadius: 10,
                    border: `1px solid ${NG.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Video size={15} color={NG.primary} strokeWidth={2} />
                    <span
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 13,
                        color: '#44403C',
                      }}
                    >
                      Biaya Video Call
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 800,
                      fontSize: 15,
                      color: '#1C1917',
                    }}
                  >
                    {formatHarga(spesialis.harga.videoCall)}
                    <span
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontWeight: 400,
                        fontSize: 11,
                        color: '#78716C',
                      }}
                    >
                      /sesi
                    </span>
                  </span>
                </div>

                {/* Biaya Chat */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#F8FFFE',
                    borderRadius: 10,
                    border: '1px solid #CCECE6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={15} color='#0891B2' strokeWidth={2} />
                    <span
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 13,
                        color: '#44403C',
                      }}
                    >
                      Biaya Chat
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 800,
                      fontSize: 15,
                      color: '#1C1917',
                    }}
                  >
                    {formatHarga(spesialis.harga.chat)}
                    <span
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontWeight: 400,
                        fontSize: 11,
                        color: '#78716C',
                      }}
                    >
                      /sesi
                    </span>
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => navigate(`/booking-konsultasi/${spesialis.id}`)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: `linear-gradient(135deg, ${NG.primary} 0%, ${NG.dark} 100%)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 16px rgba(98,129,65,0.35)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-1px)'
                  el.style.boxShadow = '0 8px 24px rgba(98,129,65,0.4)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 4px 16px rgba(98,129,65,0.35)'
                }}
              >
                Book Consultation →
              </button>

              {/* Next Available */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 10,
                }}
              >
                <Clock size={13} color='#22C55E' strokeWidth={2.5} />
                <span
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 12,
                    color: '#16A34A',
                    fontWeight: 600,
                  }}
                >
                  {spesialis.nextAvailable ? `Tersedia: ${spesialis.nextAvailable}` : 'Jadwal tidak tersedia'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Detail Info ── */}
          <motion.div
            initial={{ opacity: 0, x: isMobile || isTablet ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Specialty Badge + Name */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 14px',
                  borderRadius: 9999,
                  background: catColor.bg,
                  border: `1px solid ${catColor.border}`,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    color: catColor.text,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                  }}
                >
                  {spesialis.spesialisasi}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: isMobile ? 28 : isTablet ? 32 : 44,
                  color: '#1C1917',
                  margin: 0,
                  lineHeight: 1.15,
                  letterSpacing: '-0.5px',
                }}
              >
                {spesialis.nama}
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 15,
                  color: '#78716C',
                  margin: '6px 0 0',
                }}
              >
                {spesialis.gelar}
              </p>
            </div>

            {/* ── Info Cards Grid ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: 14,
              }}
            >
              {/* Pengalaman */}
              <InfoCard
                icon={Award}
                title='Pengalaman'
                subtitle={`${spesialis.pengalamanTahun}+ Tahun Praktek`}
                accent={accentPengalaman}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    color: NG.darker,
                    lineHeight: 1.6,
                    opacity: 0.85,
                  }}
                >
                  Berpengalaman {spesialis.pengalamanTahun}+ tahun dalam praktik klinis dan konsultasi
                  nutrisi personal.
                </p>
              </InfoCard>

              {/* Pendidikan */}
              <InfoCard
                icon={GraduationCap}
                title='Pendidikan'
                subtitle={spesialis.pendidikan[0]?.split(',')[0]}
                accent={accentPendidikan}
              >
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {spesialis.pendidikan.map((p, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 12,
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                        opacity: 0.9,
                      }}
                    >
                      <span style={{ marginTop: 2, flexShrink: 0 }}>•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </InfoCard>

              {/* Medical Registration */}
              <InfoCard
                icon={ShieldCheck}
                title='Registrasi Medis'
                subtitle={spesialis.registrasiMedis || "STR Terverifikasi"}
                accent={accentMedis}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 13,
                      color: NG.darker,
                      lineHeight: 1.6,
                      opacity: 0.85,
                    }}
                  >
                    Telah terdaftar secara resmi di Konsil Tenaga Kesehatan Indonesia (KTKI) 
                    dengan status praktik aktif dan legal.
                  </p>
                </div>
              </InfoCard>

              {/* Jadwal */}
              <InfoCard
                icon={Calendar}
                title='Jadwal Praktik'
                subtitle={spesialis.jadwal.hari.join(', ')}
                accent={accentBidang}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {spesialis.jadwal.waktu.slice(0, 3).map((w, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 9999,
                        background: '#FFF7ED',
                        border: '1px solid #FED7AA',
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 11,
                        color: '#9A3412',
                        fontWeight: 600,
                      }}
                    >
                      {w}
                    </span>
                  ))}
                  {spesialis.jadwal.waktu.length > 3 && (
                    <span
                      style={{
                        padding: '4px 10px',
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 11,
                        color: '#9A3412',
                        alignSelf: 'center',
                        fontWeight: 500
                      }}
                    >
                      +{spesialis.jadwal.waktu.length - 3} Sesi Lainnya
                    </span>
                  )}
                </div>
              </InfoCard>
            </div>

            {/* ── Specialized Areas ── */}
            <div
              style={{
                background: '#fff',
                border: '1.5px solid #E7E5E4',
                borderRadius: 16,
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: NG.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Stethoscope size={18} color={NG.primary} strokeWidth={2} />
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#1C1917',
                  }}
                >
                  Area Spesialisasi
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {spesialis.bidangKeahlian.map((b, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 9999,
                      background: NG.lighter,
                      border: `1.5px solid ${NG.border}`,
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      color: NG.darker,
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* ── About Section ── */}
            <div
              style={{
                background: '#fff',
                border: '1.5px solid #E7E5E4',
                borderRadius: 16,
                padding: '20px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 14px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 18,
                  color: '#1C1917',
                }}
              >
                Tentang {spesialis.nama}
              </h3>
              {spesialis.tentang.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  style={{
                    margin: i > 0 ? '12px 0 0' : 0,
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: isMobile ? 13 : 14,
                    color: '#44403C',
                    lineHeight: 1.8,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}