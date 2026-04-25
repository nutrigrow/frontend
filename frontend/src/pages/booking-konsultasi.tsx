import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Video,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { DUMMY_SPESIALIS, formatHarga, type Spesialis } from '../data/spesialis'

// ─── Nutri-Green Palette ──────────────────────────────────────────────────────
const NG = {
  primary: '#628141',
  dark: '#4D6632',
  light: '#F0F7E8',
  lighter: '#F7FCF0',
  border: '#C8DBA8',
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

// Identik dengan artikel.tsx dan baca-artikel.tsx
const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '20px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}

// ─── Month Names ──────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const DAY_NAMES = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// ─── Calendar Component ───────────────────────────────────────────────────────
const CalendarPicker = ({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date | null
  onSelectDate: (d: Date) => void
}) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  const cells: { day: number; current: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false })
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const isSelected = (d: number) =>
    selectedDate !== null &&
    d === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear()
  const isPast = (d: number) => {
    const date = new Date(viewYear, viewMonth, d)
    date.setHours(0, 0, 0, 0)
    const todayCopy = new Date()
    todayCopy.setHours(0, 0, 0, 0)
    return date < todayCopy
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E7E5E4',
            background: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} color='#44403C' />
        </button>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: '#1C1917' }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E7E5E4',
            background: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} color='#44403C' />
        </button>
      </div>

      {/* Day names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-heading), sans-serif', fontSize: 11, fontWeight: 600, color: '#78716C', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, idx) => {
          const past = cell.current && isPast(cell.day)
          const selected = cell.current && isSelected(cell.day)
          const today_ = cell.current && isToday(cell.day)

          return (
            <button
              key={idx}
              disabled={!cell.current || past}
              onClick={() => {
                if (cell.current && !past) {
                  onSelectDate(new Date(viewYear, viewMonth, cell.day))
                }
              }}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 8,
                border: selected
                  ? `2px solid ${NG.primary}`
                  : today_
                  ? `1.5px solid ${NG.border}`
                  : 'none',
                background: selected ? NG.primary : today_ ? NG.lighter : 'transparent',
                color: selected ? '#fff' : !cell.current || past ? '#D6D3D1' : '#1C1917',
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 13,
                fontWeight: selected ? 700 : 400,
                cursor: !cell.current || past ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (cell.current && !past && !selected) {
                  ;(e.currentTarget as HTMLElement).style.background = NG.light
                }
              }}
              onMouseLeave={e => {
                if (cell.current && !past && !selected) {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Success Popup Modal ──────────────────────────────────────────────────────
const SuccessPopup = ({
  spesialis,
  selectedDate,
  selectedTime,
  formatDateDisplay,
  onGoToKonsultasi,
  onBackToList,
}: {
  spesialis: Spesialis
  selectedDate: Date | null
  selectedTime: string | null
  formatDateDisplay: (d: Date | null) => string
  onGoToKonsultasi: () => void
  onBackToList: () => void
}) => (
  <AnimatePresence>
    <motion.div
      key='popup-backdrop'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'brightness(0.7)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        key='popup-card'
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        }}
      >
        {/* Success icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: NG.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle2 size={36} color={NG.primary} />
        </div>

        <h2
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 24,
            color: '#1C1917',
            margin: '0 0 10px',
          }}
        >
          Pemesanan Berhasil!
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 14,
            color: '#78716C',
            margin: '0 0 28px',
            lineHeight: 1.7,
          }}
        >
          Konsultasi Anda bersama{' '}
          <strong style={{ color: '#1C1917' }}>{spesialis.nama}</strong> pada tanggal{' '}
          <strong style={{ color: '#1C1917' }}>{formatDateDisplay(selectedDate)}</strong> pukul{' '}
          <strong style={{ color: '#1C1917' }}>{selectedTime}</strong> telah dikonfirmasi.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onGoToKonsultasi}
            style={{
              padding: '13px',
              background: NG.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Lihat Konsultasi Saya
          </button>
          <button
            onClick={onBackToList}
            style={{
              padding: '13px',
              background: '#fff',
              color: '#44403C',
              border: '1.5px solid #E7E5E4',
              borderRadius: 12,
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Kembali ke Daftar Spesialis
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

// ─── Booking Konsultasi Page ──────────────────────────────────────────────────
export default function BookingKonsultasi() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const paddingInline = getPaddingInline(bp)

  const spesialis: Spesialis | undefined = DUMMY_SPESIALIS.find(s => s.id === Number(id))

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<'video' | 'chat'>('video')
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  if (!spesialis) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'var(--font-heading), sans-serif',
        }}
      >
        <div style={{ fontSize: 48 }}>🔍</div>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 24, color: '#1C1917', margin: 0 }}>
          Spesialis Tidak Ditemukan
        </h2>
        <button
          onClick={() => navigate('/tele-nutritionist')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
            background: NG.primary, color: '#fff', border: 'none', borderRadius: 10,
            cursor: 'pointer', fontFamily: 'var(--font-heading), sans-serif', fontSize: 14, fontWeight: 600,
          }}
        >
          <ArrowLeft size={15} />
          Kembali
        </button>
      </div>
    )
  }

  const formatDateDisplay = (d: Date | null): string => {
    if (!d) return '-'
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  }

  const biaya = selectedMethod === 'video' ? spesialis.harga.videoCall : spesialis.harga.chat
  const pajak = Math.round(biaya * 0.1)
  const total = biaya + pajak
  const canConfirm = selectedDate !== null && selectedTime !== null

  return (
    <>
      {/* ── Main Booking Page ── */}
      <div
        style={{ minHeight: '80vh', background: '#FAFAF9', fontFamily: 'var(--font-heading), sans-serif' }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            paddingInline,
            paddingTop: isMobile ? 20 : isTablet ? 28 : 36,
            paddingBottom: 80,
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
              <Link
                to={`/detail-spesialis/${spesialis.id}`}
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
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: isMobile ? 100 : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'bottom',
                  }}
                >
                  {spesialis.nama}
                </span>
              </Link>
              <ChevronRight size={13} color='#A8A29E' />
              <span
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1C1917',
                }}
              >
                Booking
              </span>
            </nav>

            <button
              onClick={() => navigate(`/detail-spesialis/${spesialis.id}`)}
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

          {/* ── Page Title ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
            style={{ marginBottom: isMobile ? 24 : isTablet ? 28 : 32 }}
          >
            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: isMobile ? 26 : isTablet ? 30 : 34,
                color: '#1C1917',
                margin: '0 0 8px',
                letterSpacing: '-0.5px',
              }}
            >
              Jadwal Konsultasi
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: isMobile ? 13 : 15,
                color: '#78716C',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Pilih tanggal, waktu, dan metode untuk sesi konsultasi personal Anda bersama spesialis gizi kami.
            </p>
          </motion.div>

          {/* ── Main Layout ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 360px',
              gap: isMobile ? 20 : isTablet ? 24 : 28,
              alignItems: 'start',
            }}
          >
            {/* ── LEFT SIDE ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Calendar + Time grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? 16 : 20,
                }}
              >
                {/* Calendar */}
                <div
                  style={{
                    background: '#fff',
                    border: '1.5px solid #E7E5E4',
                    borderRadius: 20,
                    padding: isMobile ? '20px 16px' : '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <h3 style={{ margin: '0 0 20px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>
                    Pilih Tanggal
                  </h3>
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onSelectDate={d => {
                      setSelectedDate(d)
                      setSelectedTime(null)
                    }}
                  />
                </div>

                {/* Time Slots */}
                <div
                  style={{
                    background: '#fff',
                    border: '1.5px solid #E7E5E4',
                    borderRadius: 20,
                    padding: isMobile ? '20px 16px' : '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <h3 style={{ margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>
                    Waktu Tersedia
                  </h3>
                  {selectedDate ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {spesialis.jadwal.waktu.map((w, i) => {
                        const isActive = selectedTime === w
                        const unavailable = i === spesialis.jadwal.waktu.length - 1
                        return (
                          <button
                            key={w}
                            disabled={unavailable}
                            onClick={() => setSelectedTime(w)}
                            style={{
                              padding: '10px 8px',
                              borderRadius: 10,
                              border: isActive
                                ? `2px solid ${NG.primary}`
                                : `1.5px solid ${unavailable ? '#F0EDE8' : '#E7E5E4'}`,
                              background: isActive ? NG.primary : unavailable ? '#FAFAF9' : '#fff',
                              color: isActive ? '#fff' : unavailable ? '#D6D3D1' : '#1C1917',
                              fontFamily: 'var(--font-heading), sans-serif',
                              fontSize: 13,
                              fontWeight: isActive ? 700 : 500,
                              cursor: unavailable ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s',
                              textDecoration: unavailable ? 'line-through' : 'none',
                            }}
                            onMouseEnter={e => {
                              if (!isActive && !unavailable)
                                (e.currentTarget as HTMLElement).style.background = NG.lighter
                            }}
                            onMouseLeave={e => {
                              if (!isActive && !unavailable)
                                (e.currentTarget as HTMLElement).style.background = '#fff'
                            }}
                          >
                            {w}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 16px',
                        gap: 12,
                        color: '#A8A29E',
                      }}
                    >
                      <Calendar size={32} color='#D6D3D1' />
                      <p style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, margin: 0, textAlign: 'center' }}>
                        Pilih tanggal terlebih dahulu untuk melihat waktu yang tersedia.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Consultation Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.18 }}
                style={{
                  background: '#fff',
                  border: '1.5px solid #E7E5E4',
                  borderRadius: 20,
                  padding: isMobile ? '20px 16px' : '24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <h3 style={{ margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>
                  Metode Konsultasi
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
                  {(['video', 'chat'] as const).map(method => {
                    const isVideo = method === 'video'
                    const isSelected = selectedMethod === method
                    return (
                      <button
                        key={method}
                        onClick={() => setSelectedMethod(method)}
                        style={{
                          padding: '16px 20px',
                          borderRadius: 14,
                          border: isSelected ? `2px solid ${NG.primary}` : '1.5px solid #E7E5E4',
                          background: isSelected ? NG.lighter : '#FAFAF9',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: isSelected ? NG.light : '#F5F5F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isVideo
                            ? <Video size={18} color={isSelected ? NG.primary : '#78716C'} strokeWidth={2} />
                            : <MessageSquare size={18} color={isSelected ? NG.primary : '#78716C'} strokeWidth={2} />
                          }
                        </div>
                        <div>
                          <p style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: isSelected ? NG.dark : '#1C1917' }}>
                            {isVideo ? 'Video Call' : 'Text Chat'}
                          </p>
                          <p style={{ margin: '3px 0 0', fontFamily: 'var(--font-heading), sans-serif', fontSize: 12, color: '#78716C' }}>
                            {isVideo ? 'Inspeksi visual mendetail' : 'Saran & perencanaan cepat'}
                          </p>
                          <p style={{ margin: '4px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13, color: NG.primary }}>
                            {formatHarga(isVideo ? spesialis.harga.videoCall : spesialis.harga.chat)}/sesi
                          </p>
                        </div>
                        {isSelected && (
                          <div style={{ marginLeft: 'auto' }}>
                            <CheckCircle2 size={20} color={NG.primary} fill={NG.lighter} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              {isTablet && (
                <BookingSummary
                  spesialis={spesialis}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedMethod={selectedMethod}
                  biaya={biaya}
                  pajak={pajak}
                  total={total}
                  canConfirm={canConfirm}
                  formatDateDisplay={formatDateDisplay}
                  onConfirm={() => setShowPopup(true)}
                  sticky={false}
                />
              )}
            </div>

            {/* ── RIGHT SIDE: Booking Summary (mobile + desktop) ── */}
            {!isTablet && (
              <motion.div
                initial={{ opacity: 0, x: isMobile ? 0 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              >
                <BookingSummary
                  spesialis={spesialis}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedMethod={selectedMethod}
                  biaya={biaya}
                  pajak={pajak}
                  total={total}
                  canConfirm={canConfirm}
                  formatDateDisplay={formatDateDisplay}
                  onConfirm={() => setShowPopup(true)}
                  sticky={!isMobile}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Success Popup ── */}
      {showPopup && (
        <SuccessPopup
          spesialis={spesialis}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          formatDateDisplay={formatDateDisplay}
          onGoToKonsultasi={() => navigate('/konsultasi-saya')}
          onBackToList={() => navigate('/tele-nutritionist')}
        />
      )}
    </>
  )
}

// ─── Booking Summary (extracted to avoid duplication) ─────────────────────────
function BookingSummary({
  spesialis,
  selectedDate,
  selectedTime,
  selectedMethod,
  biaya,
  pajak,
  total,
  canConfirm,
  formatDateDisplay,
  onConfirm,
  sticky,
}: {
  spesialis: Spesialis
  selectedDate: Date | null
  selectedTime: string | null
  selectedMethod: 'video' | 'chat'
  biaya: number
  pajak: number
  total: number
  canConfirm: boolean
  formatDateDisplay: (d: Date | null) => string
  onConfirm: () => void
  sticky: boolean
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #E7E5E4',
        borderRadius: 20,
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        position: sticky ? 'sticky' : 'static',
        top: 24,
      }}
    >
      <h3 style={{ margin: '0 0 20px', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, color: '#1C1917' }}>
        Ringkasan Pemesanan
      </h3>

      {/* Specialist Preview */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px',
          background: NG.lighter,
          borderRadius: 12,
          marginBottom: 20,
          border: `1px solid ${NG.border}`,
        }}
      >
        <img
          src={spesialis.foto}
          alt={spesialis.nama}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${NG.border}`,
            flexShrink: 0,
          }}
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80'
          }}
        />
        <div>
          <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 11, color: NG.dark, fontWeight: 600 }}>
            {spesialis.spesialisasi}
          </p>
          <p style={{ margin: '2px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: '#1C1917' }}>
            {spesialis.nama}
          </p>
          <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-heading), sans-serif', fontSize: 12, color: '#78716C' }}>
            {spesialis.gelar}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#F0EDE8', marginBottom: 20 }} />

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          {
            icon: <Calendar size={15} color={NG.primary} />,
            label: 'Tanggal',
            value: selectedDate ? formatDateDisplay(selectedDate) : 'Belum dipilih',
            empty: !selectedDate,
          },
          {
            icon: <Clock size={15} color={NG.primary} />,
            label: 'Waktu',
            value: selectedTime ? `${selectedTime} WIB` : 'Belum dipilih',
            empty: !selectedTime,
          },
          {
            icon: selectedMethod === 'video'
              ? <Video size={15} color={NG.primary} />
              : <MessageSquare size={15} color={NG.primary} />,
            label: 'Metode',
            value: selectedMethod === 'video' ? 'Video Call' : 'Text Chat',
            empty: false,
          },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: NG.lighter, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 11, color: '#78716C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {item.label}
              </p>
              <p style={{ margin: '2px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 14, color: item.empty ? '#A8A29E' : '#1C1917' }}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#F0EDE8', margin: '20px 0' }} />

      {/* Price Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Biaya Konsultasi', amount: biaya },
          { label: 'Pajak & Biaya Aplikasi', amount: pajak },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: '#78716C' }}>
              {row.label}
            </span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 14, color: '#1C1917' }}>
              {formatHarga(row.amount)}
            </span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0 0',
            borderTop: '1.5px solid #F0EDE8',
            marginTop: 4,
          }}
        >
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 15, color: '#1C1917' }}>
            Total
          </span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 18, color: NG.primary }}>
            {formatHarga(total)}
          </span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        disabled={!canConfirm}
        onClick={onConfirm}
        style={{
          width: '100%',
          marginTop: 20,
          padding: '15px',
          background: canConfirm
            ? `linear-gradient(135deg, ${NG.primary} 0%, ${NG.dark} 100%)`
            : '#E7E5E4',
          color: canConfirm ? '#fff' : '#A8A29E',
          border: 'none',
          borderRadius: 14,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: 700,
          cursor: canConfirm ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: canConfirm ? '0 4px 16px rgba(98,129,65,0.35)' : 'none',
        }}
      >
        Konfirmasi Pemesanan →
      </button>

      <p
        style={{
          margin: '12px 0 0',
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: 11,
          color: '#78716C',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Dengan mengkonfirmasi, Anda menyetujui{' '}
        <span style={{ color: NG.primary, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>
          Syarat & Ketentuan
        </span>{' '}
        layanan kami.
      </p>
    </div>
  )
}