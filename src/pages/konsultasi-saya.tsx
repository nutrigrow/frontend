import { useEffect, useState, type ElementType } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Phone,
  RotateCcw,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

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

const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '20px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}

// ─── Status Config ────────────────────────────────────────────────────────────
type StatusType = 'Akan Datang' | 'Selesai' | 'Rescheduled' | 'Canceled'

const STATUS_CONFIG: Record<
  StatusType,
  { bg: string; text: string; border: string; icon: ElementType; label: string; accent: string }
> = {
  'Akan Datang': {
    bg: '#F0F7E8', text: NG.dark, border: NG.border, accent: '#22C55E',
    icon: Clock, label: 'Akan Datang',
  },
  Selesai: {
    bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', accent: '#22C55E',
    icon: CheckCircle2, label: 'Selesai',
  },
  Rescheduled: {
    bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', accent: '#F59E0B',
    icon: RefreshCw, label: 'Dijadwalkan Ulang',
  },
  Canceled: {
    bg: '#FEF2F2', text: '#9F1239', border: '#FECACA', accent: '#EF4444',
    icon: AlertCircle, label: 'Dibatalkan',
  },
}

// ─── Dummy Consultation Data ──────────────────────────────────────────────────
interface Konsultasi {
  id: string
  status: StatusType
  spesialis: { nama: string; spesialisasi: string; foto: string }
  tanggal: string
  waktu: string
  metode: 'Video Call' | 'Text Chat'
  catatan?: string
}

const INIT_KONSULTASI: Konsultasi[] = [
  {
    id: 'LM-8492', status: 'Akan Datang',
    spesialis: { nama: 'Dr. Sarah Jenkins', spesialisasi: 'Spesialis Anak', foto: 'https://images.unsplash.com/photo-1675270690434-aa99f4871e8a?w=100&q=80' },
    tanggal: '15 Oktober 2025', waktu: '10:00 AM - 11:00 AM WIB', metode: 'Video Call',
  },
  {
    id: 'LM-8501', status: 'Akan Datang',
    spesialis: { nama: 'Dr. Michael Chen', spesialisasi: 'Ibu Menyusui', foto: 'https://images.unsplash.com/photo-1758691463605-f4a3a92d6d37?w=100&q=80' },
    tanggal: '22 Oktober 2025', waktu: '2:00 PM - 2:45 PM WIB', metode: 'Text Chat',
    catatan: 'Chat dibuka 5 menit sebelum sesi dimulai',
  },
  {
    id: 'LM-8355', status: 'Selesai',
    spesialis: { nama: 'Elena Rodriguez', spesialisasi: 'Spesialis Anak', foto: 'https://images.unsplash.com/photo-1612944095914-33fd0a85fcfc?w=100&q=80' },
    tanggal: '3 September 2025', waktu: '09:00 AM - 10:00 AM WIB', metode: 'Video Call',
  },
  {
    id: 'LM-8201', status: 'Selesai',
    spesialis: { nama: 'Marcus Thorne', spesialisasi: 'Nutrisi Olahraga', foto: 'https://images.unsplash.com/photo-1756699279298-c89cdef354ab?w=100&q=80' },
    tanggal: '12 Agustus 2025', waktu: '14:00 PM - 15:00 PM WIB', metode: 'Video Call',
  },
  {
    id: 'LM-8410', status: 'Rescheduled',
    spesialis: { nama: 'Dr. Fatimah Azzahra', spesialisasi: 'Kehamilan', foto: 'https://images.unsplash.com/photo-1737792837727-fd46ff71acf2?w=100&q=80' },
    tanggal: '28 September 2025', waktu: '11:00 AM - 12:00 PM WIB', metode: 'Text Chat',
    catatan: 'Dijadwalkan ulang ke 5 November 2025',
  },
  {
    id: 'LM-8099', status: 'Canceled',
    spesialis: { nama: 'Dr. Andi Wijaya', spesialisasi: 'Tumbuh Kembang', foto: 'https://images.unsplash.com/photo-1746813628081-0c8c1611aace?w=100&q=80' },
    tanggal: '18 Juli 2025', waktu: '16:00 PM - 17:00 PM WIB', metode: 'Video Call',
    catatan: 'Dibatalkan oleh pasien',
  },
]

const STATUS_TABS: StatusType[] = ['Akan Datang', 'Selesai', 'Rescheduled', 'Canceled']

// ─── Month/Day for mini calendar ─────────────────────────────────────────────
const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const DAY_NAMES_SHORT = ['Ming','Sen','Sel','Rab','Kam','Jum','Sab']

// ─── Mini Inline Calendar for Reschedule ─────────────────────────────────────
const MiniCalendar = ({
  selected,
  onSelect,
}: {
  selected: Date | null
  onSelect: (d: Date) => void
}) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()

  const cells: { day: number; current: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true })
  while (cells.length < 42) cells.push({ day: cells.length - daysInMonth - firstDay + 2, current: false })

  const isPast = (d: number) => {
    const dt = new Date(viewYear, viewMonth, d); dt.setHours(0,0,0,0)
    const t = new Date(); t.setHours(0,0,0,0)
    return dt < t
  }
  const isSelected = (d: number) =>
    selected !== null && d === selected.getDate() &&
    viewMonth === selected.getMonth() && viewYear === selected.getFullYear()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button
          onClick={() => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1)}
          style={{ width: 28, height: 28, border: '1px solid #E7E5E4', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        ><ChevronLeft size={13} /></button>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13, color: '#1C1917' }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y+1)) : setViewMonth(m => m+1)}
          style={{ width: 28, height: 28, border: '1px solid #E7E5E4', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        ><ChevronRight size={13} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_NAMES_SHORT.map(d => (
          <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-heading), sans-serif', fontSize: 10, fontWeight: 600, color: '#78716C', padding: '3px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, idx) => {
          const past = cell.current && isPast(cell.day)
          const sel = cell.current && isSelected(cell.day)
          return (
            <button
              key={idx}
              disabled={!cell.current || past}
              onClick={() => cell.current && !past && onSelect(new Date(viewYear, viewMonth, cell.day))}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 6,
                border: sel ? `2px solid ${NG.primary}` : 'none',
                background: sel ? NG.primary : 'transparent',
                color: sel ? '#fff' : !cell.current || past ? '#D6D3D1' : '#1C1917',
                fontFamily: 'var(--font-heading), sans-serif', fontSize: 12,
                fontWeight: sel ? 700 : 400,
                cursor: !cell.current || past ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >{cell.day}</button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
const TIME_SLOTS = ['09:00 - 10:00','10:00 - 11:00','11:30 - 12:30','13:00 - 14:00','14:30 - 15:30','16:00 - 17:00']

const RescheduleModal = ({
  konsultasi,
  onClose,
  onConfirm,
}: {
  konsultasi: Konsultasi
  onClose: () => void
  onConfirm: (newDate: string, newTime: string) => void
}) => {
  const [pickedDate, setPickedDate] = useState<Date | null>(null)
  const [pickedTime, setPickedTime] = useState<string | null>(null)

  const formatDate = (d: Date) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  const canConfirm = pickedDate !== null && pickedTime !== null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '28px',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, color: '#1C1917' }}>
              Jadwalkan Ulang
            </h3>
            <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: '#78716C' }}>
              {konsultasi.spesialis.nama}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <X size={20} color='#78716C' />
          </button>
        </div>

        {/* Current schedule info */}
        <div
          style={{
            padding: '12px 14px', borderRadius: 10,
            background: '#FFFBEB', border: '1px solid #FDE68A',
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 12, color: '#92400E' }}>
            <strong>Jadwal saat ini:</strong> {konsultasi.tanggal} · {konsultasi.waktu}
          </p>
        </div>

        {/* Calendar */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: '#1C1917' }}>
            Pilih Tanggal Baru
          </p>
          <MiniCalendar
            selected={pickedDate}
            onSelect={d => { setPickedDate(d); setPickedTime(null) }}
          />
        </div>

        {/* Time Slots */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: '#1C1917' }}>
            Pilih Waktu Baru
          </p>
          {pickedDate ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {TIME_SLOTS.map(slot => {
                const isActive = pickedTime === slot
                return (
                  <button
                    key={slot}
                    onClick={() => setPickedTime(slot)}
                    style={{
                      padding: '9px 6px',
                      borderRadius: 8,
                      border: isActive ? `2px solid ${NG.primary}` : '1.5px solid #E7E5E4',
                      background: isActive ? NG.primary : '#fff',
                      color: isActive ? '#fff' : '#1C1917',
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = NG.lighter }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#fff' }}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          ) : (
            <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: '16px 0' }}>
              Pilih tanggal dahulu
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', background: '#fff',
              border: '1.5px solid #E7E5E4', borderRadius: 10,
              fontFamily: 'var(--font-heading), sans-serif', fontSize: 14,
              fontWeight: 600, color: '#44403C', cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm(formatDate(pickedDate!), pickedTime!)}
            style={{
              flex: 1, padding: '12px',
              background: canConfirm ? `linear-gradient(135deg, ${NG.primary} 0%, ${NG.dark} 100%)` : '#E7E5E4',
              border: 'none', borderRadius: 10,
              fontFamily: 'Montserrat, sans-serif', fontSize: 14,
              fontWeight: 700, color: canConfirm ? '#fff' : '#A8A29E',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            Konfirmasi
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
const CancelModal = ({
  konsultasi,
  onClose,
  onConfirm,
}: {
  konsultasi: Konsultasi
  onClose: () => void
  onConfirm: () => void
}) => {
  const [reason, setReason] = useState('')
  const REASONS = [
    'Jadwal berubah', 'Merasa sudah lebih baik',
    'Ingin ganti spesialis', 'Alasan keuangan', 'Lainnya',
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '28px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, color: '#1C1917' }}>
              Batalkan Konsultasi
            </h3>
            <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: '#78716C' }}>
              {konsultasi.spesialis.nama}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <X size={20} color='#78716C' />
          </button>
        </div>

        {/* Warning */}
        <div
          style={{
            padding: '12px 14px', borderRadius: 10,
            background: '#FEF2F2', border: '1px solid #FECACA',
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: '#9F1239', lineHeight: 1.6 }}>
            ⚠️ Pembatalan tidak dapat diurungkan. Silakan periksa kebijakan pengembalian dana kami.
          </p>
        </div>

        {/* Reason selection */}
        <p style={{ margin: '0 0 10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: '#1C1917' }}>
          Alasan Pembatalan
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              style={{
                padding: '10px 14px', borderRadius: 9,
                border: reason === r ? `1.5px solid #EF4444` : '1.5px solid #E7E5E4',
                background: reason === r ? '#FEF2F2' : '#FAFAF9',
                color: reason === r ? '#9F1239' : '#44403C',
                fontFamily: 'var(--font-heading), sans-serif', fontSize: 13,
                fontWeight: reason === r ? 700 : 500, cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', background: '#fff',
              border: '1.5px solid #E7E5E4', borderRadius: 10,
              fontFamily: 'var(--font-heading), sans-serif', fontSize: 14,
              fontWeight: 600, color: '#44403C', cursor: 'pointer',
            }}
          >
            Kembali
          </button>
          <button
            disabled={!reason}
            onClick={() => reason && onConfirm()}
            style={{
              flex: 1, padding: '12px',
              background: reason ? '#EF4444' : '#E7E5E4',
              border: 'none', borderRadius: 10,
              fontFamily: 'Montserrat, sans-serif', fontSize: 14,
              fontWeight: 700, color: reason ? '#fff' : '#A8A29E',
              cursor: reason ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
            }}
          >
            Ya, Batalkan
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Consultation Card ────────────────────────────────────────────────────────
const KonsultasiCard = ({
  konsultasi,
  isMobile,
  onReschedule,
  onCancel,
}: {
  konsultasi: Konsultasi
  isMobile: boolean
  isTablet: boolean
  onReschedule: (k: Konsultasi) => void
  onCancel: (k: Konsultasi) => void
}) => {
  const statusCfg = STATUS_CONFIG[konsultasi.status]
  const StatusIcon = statusCfg.icon
  const isAkanDatang = konsultasi.status === 'Akan Datang'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        background: '#fff',
        border: '1.5px solid #E7E5E4',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        marginBottom: 16,
      }}
    >
      {/* ── Card Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #F0EDE8',
          gap: 8,
          minWidth: 0,
        }}
      >
        {/* Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 12px',
            borderRadius: 9999,
            background: statusCfg.bg,
            border: `1.5px solid ${statusCfg.border}`,
          }}
        >
          <StatusIcon size={13} color={statusCfg.text} strokeWidth={2.5} />
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: statusCfg.text,
            }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* ID */}
        <span
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 12,
            color: '#A8A29E',
            flexShrink: 0,
          }}
        >
          ID: {konsultasi.id}
        </span>
      </div>

      {/* ── Specialist Info ── */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            border: `2px solid ${NG.border}`,
          }}
        >
          <img
            src={konsultasi.spesialis.foto}
            alt={konsultasi.spesialis.nama}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => {
              ;(e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80'
            }}
          />
        </div>
        <div>
          <p style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>
            {konsultasi.spesialis.nama}
          </p>
          <p style={{ margin: '3px 0 0', fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: NG.primary, fontWeight: 600 }}>
            {konsultasi.spesialis.spesialisasi}
          </p>
        </div>
      </div>

      {/* ── Appointment Details ── */}
      <div
        style={{
          margin: '0 20px 16px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 8 : 10,
        }}
      >
        {/* Card Tanggal */}
        <div
          style={{
            background: '#F5F5F4',
            border: '1px solid #E7E5E4',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Calendar size={16} color={NG.primary} strokeWidth={2} style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 11, color: '#78716C', fontWeight: 600 }}>Tanggal</p>
            <p style={{ margin: '2px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: isMobile ? 13 : 14, color: '#1C1917' }}>
              {konsultasi.tanggal}
            </p>
          </div>
        </div>

        {/* Card Waktu */}
        <div
          style={{
            background: '#F5F5F4',
            border: '1px solid #E7E5E4',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Clock size={16} color={NG.primary} strokeWidth={2} style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 11, color: '#78716C', fontWeight: 600 }}>Waktu</p>
            <p style={{ margin: '2px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: isMobile ? 13 : 14, color: '#1C1917' }}>
              {konsultasi.waktu}
            </p>
          </div>
        </div>

        {/* Card Metode */}
        <div
          style={{
            background: '#F5F5F4',
            border: '1px solid #E7E5E4',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {konsultasi.metode === 'Video Call'
            ? <Video size={16} color={NG.primary} strokeWidth={2} style={{ flexShrink: 0 }} />
            : <MessageSquare size={16} color={NG.primary} strokeWidth={2} style={{ flexShrink: 0 }} />
          }
          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: 11, color: '#78716C', fontWeight: 600 }}>Metode</p>
            <p style={{ margin: '2px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: isMobile ? 13 : 14, color: '#1C1917' }}>
              {konsultasi.metode}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {konsultasi.catatan && (
        <p style={{ margin: '0 20px 14px', fontFamily: 'var(--font-heading), sans-serif', fontSize: 12, color: '#78716C', fontStyle: 'italic' }}>
          *{konsultasi.catatan}
        </p>
      )}

      {/* ── Action Buttons ── */}
      {isAkanDatang && (
        <div
          style={{
            padding: '14px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Hubungi */}
          <button
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '12px 16px',
              background: `linear-gradient(135deg, ${NG.primary} 0%, ${NG.dark} 100%)`,
              color: '#fff', border: 'none', borderRadius: 10,
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(98,129,65,0.25)',
            }}
          >
            <Phone size={14} strokeWidth={2.5} />
            Hubungi Nutritionist
          </button>

          {/* Reschedule & Batalkan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Reschedule */}
            <button
              onClick={() => onReschedule(konsultasi)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '11px 16px',
                background: '#fff', color: '#78716C', border: '1.5px solid #E7E5E4',
                borderRadius: 10, fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#D1D5DB'; el.style.background = '#FAFAF9'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#E7E5E4'; el.style.background = '#fff'
              }}
            >
              <RotateCcw size={13} strokeWidth={2.5} />
              Reschedule
            </button>

            {/* Batalkan */}
            <button
              onClick={() => onCancel(konsultasi)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '11px 16px',
                background: '#fff', color: '#9F1239', border: '1.5px solid #FECACA',
                borderRadius: 10, fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <X size={13} strokeWidth={2.5} />
              Batalkan
            </button>
          </div>
        </div>
      )}

      {/* Selesai */}
      {konsultasi.status === 'Selesai' && (
        <div style={{ padding: '14px 20px 20px' }}>
          <button
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '11px 16px',
              background: `linear-gradient(135deg, ${NG.primary} 0%, ${NG.dark} 100%)`,
              color: '#fff', border: 'none', borderRadius: 10,
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(98,129,65,0.25)',
            }}
          >
            <Phone size={14} strokeWidth={2.5} />
            Hubungi Nutritionist
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── Empty State Component ────────────────────────────────────────────────────
const EmptyState = ({
  activeStatus,
  navigate,
  isMobile,
}: {
  activeStatus: StatusType
  navigate: (path: string) => void
  isMobile: boolean
}) => (
  <div
    style={{
      background: '#fff',
      border: '1.5px solid #E7E5E4',
      borderRadius: 20,
      padding: isMobile ? '48px 24px' : '60px 40px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 64, height: 64, borderRadius: '50%',
        background: NG.light, display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 16px',
      }}
    >
      <Calendar size={28} color={NG.primary} />
    </div>
    <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: isMobile ? 16 : 18, color: '#1C1917', margin: '0 0 8px' }}>
      Tidak Ada Konsultasi
    </h3>
    <p style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 14, color: '#78716C', margin: '0 0 24px' }}>
      Belum ada konsultasi dengan status "{STATUS_CONFIG[activeStatus].label}".
    </p>
    <button
      onClick={() => navigate('/tele-nutritionist')}
      style={{
        padding: '11px 24px', background: NG.primary,
        color: '#fff', border: 'none', borderRadius: 10,
        fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer',
      }}
    >
      Cari Spesialis
    </button>
  </div>
)

// ─── Konsultasi Saya Page ─────────────────────────────────────────────────────
export default function KonsultasiSaya() {
  const navigate = useNavigate()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const paddingInline = getPaddingInline(bp)

  const [activeStatus, setActiveStatus] = useState<StatusType>('Akan Datang')
  const [konsultasiList, setKonsultasiList] = useState<Konsultasi[]>(INIT_KONSULTASI)

  const [rescheduleTarget, setRescheduleTarget] = useState<Konsultasi | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Konsultasi | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const filteredKonsultasi = konsultasiList.filter(k => k.status === activeStatus)
  const countByStatus = (status: StatusType) => konsultasiList.filter(k => k.status === status).length

  const handleRescheduleConfirm = (newDate: string, newTime: string) => {
    setKonsultasiList(prev =>
      prev.map(k =>
        k.id === rescheduleTarget?.id
          ? {
              ...k,
              status: 'Rescheduled' as StatusType,
              tanggal: newDate,
              waktu: `${newTime} WIB`,
              catatan: `Dijadwalkan ulang ke ${newDate}`,
            }
          : k
      )
    )
    setRescheduleTarget(null)
    setActiveStatus('Rescheduled')
  }

  const handleCancelConfirm = () => {
    setKonsultasiList(prev =>
      prev.map(k =>
        k.id === cancelTarget?.id
          ? { ...k, status: 'Canceled' as StatusType, catatan: 'Dibatalkan oleh pasien' }
          : k
      )
    )
    setCancelTarget(null)
    setActiveStatus('Canceled')
  }

  return (
    <>
      <div
        style={{
          minHeight: '70vh',
          background: '#FAFAF9',
          fontFamily: 'var(--font-heading), sans-serif',
        }}
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
          {/* ── Back Button ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ marginBottom: 20 }}
          >
            <button
              onClick={() => navigate('/tele-nutritionist')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', background: '#fff',
                border: '1.5px solid #E7E5E4', borderRadius: 9999,
                fontFamily: 'var(--font-heading), sans-serif', fontSize: 13,
                fontWeight: 600, color: '#44403C', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = NG.primary; el.style.color = NG.primary
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#E7E5E4'; el.style.color = '#44403C'
              }}
            >
              <ArrowLeft size={14} />
              Kembali
            </button>
          </motion.div>

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
            style={{ marginBottom: isMobile ? 20 : isTablet ? 24 : 32 }}
          >
            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
                fontSize: isMobile ? 24 : isTablet ? 28 : 34,
                color: '#1C1917',
                margin: '0 0 8px', letterSpacing: '-0.5px',
              }}
            >
              Konsultasi Saya
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: isMobile ? 13 : 15,
                color: '#78716C', margin: 0, lineHeight: 1.6,
              }}
            >
              Kelola jadwal janji temu Anda dan tinjau sesi sebelumnya bersama ahli gizi kami.
            </p>
          </motion.div>

          {/* ── MOBILE / TABLET: Dropdown + Cards ── */}
          {(isMobile || isTablet) && (
            <div>
              {/* Dropdown selector */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
                style={{ marginBottom: 16 }}
              >
                <div style={{ position: 'relative' }}>
                  <select
                    value={activeStatus}
                    onChange={e => setActiveStatus(e.target.value as StatusType)}
                    style={{
                      width: '100%',
                      padding: '12px 44px 12px 16px',
                      borderRadius: 12,
                      border: `1.5px solid ${STATUS_CONFIG[activeStatus].border}`,
                      background: STATUS_CONFIG[activeStatus].bg,
                      color: STATUS_CONFIG[activeStatus].text,
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {STATUS_TABS.map(status => {
                      const count = countByStatus(status)
                      return (
                        <option key={status} value={status}>
                          {STATUS_CONFIG[status].label}{count > 0 ? ` (${count})` : ''}
                        </option>
                      )
                    })}
                  </select>
                  {/* Chevron icon */}
                  <div style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke={STATUS_CONFIG[activeStatus].text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Cards */}
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeStatus}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {filteredKonsultasi.length > 0 ? (
                    filteredKonsultasi.map(k => (
                      <KonsultasiCard
                        key={k.id}
                        konsultasi={k}
                        isMobile={isMobile}
                        isTablet={isTablet}
                        onReschedule={setRescheduleTarget}
                        onCancel={setCancelTarget}
                      />
                    ))
                  ) : (
                    <EmptyState activeStatus={activeStatus} navigate={navigate} isMobile={isMobile} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ── DESKTOP: Sidebar Tabs + Cards ── */}
          {!isMobile && !isTablet && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '250px 1fr',
                gap: 28,
                alignItems: 'start',
              }}
            >
              {/* Left Sidebar: Status Tabs */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
                style={{
                  position: 'sticky',
                  top: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  background: '#fff',
                  border: '1.5px solid #E7E5E4',
                  borderRadius: 16,
                  padding: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <p style={{
                  margin: '4px 8px 8px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 11,
                  color: '#A8A29E',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>Filter Status</p>
                {STATUS_TABS.map((status) => {
                  const cfg = STATUS_CONFIG[status]
                  const StatusIcon = cfg.icon
                  const isActive = activeStatus === status
                  const count = countByStatus(status)

                  return (
                    <button
                      key={status}
                      onClick={() => setActiveStatus(status)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: isActive ? `1.5px solid ${cfg.border}` : '1.5px solid transparent',
                        background: isActive ? cfg.bg : 'transparent',
                        color: isActive ? cfg.text : '#78716C',
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.18s',
                        width: '100%',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = '#F5F5F4'
                          ;(e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                          ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusIcon size={14} strokeWidth={2} />
                        <span>{cfg.label}</span>
                      </div>
                      {count > 0 && (
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: 20, height: 20, borderRadius: 9999,
                            background: isActive ? cfg.accent : '#E7E5E4',
                            color: isActive ? '#fff' : '#78716C',
                            fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </motion.div>

              {/* Right: Cards */}
              <div>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={activeStatus}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {filteredKonsultasi.length > 0 ? (
                      filteredKonsultasi.map(k => (
                        <KonsultasiCard
                          key={k.id}
                          konsultasi={k}
                          isMobile={isMobile}
                          isTablet={isTablet}
                          onReschedule={setRescheduleTarget}
                          onCancel={setCancelTarget}
                        />
                      ))
                    ) : (
                      <EmptyState activeStatus={activeStatus} navigate={navigate} isMobile={false} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reschedule Modal ── */}
      <AnimatePresence>
        {rescheduleTarget && (
          <RescheduleModal
            key='reschedule'
            konsultasi={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onConfirm={handleRescheduleConfirm}
          />
        )}
      </AnimatePresence>

      {/* ── Cancel Modal ── */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            key='cancel'
            konsultasi={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onConfirm={handleCancelConfirm}
          />
        )}
      </AnimatePresence>
    </>
  )
}