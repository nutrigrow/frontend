import { useState, useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type CategoryType = 'teenage' | 'pregnant' | 'breastfeeding'
type SaveStatus = 'idle' | 'success' | 'error'
type LogRow = { day: string; date: string; mood: string; sleep: string; fluid: string; supplement: string; specific: string }

// ─── Breakpoint helper ────────────────────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const MOOD_OPTIONS = [
  { emoji: '😫', label: 'LELAH',   value: 'lelah'   },
  { emoji: '😔', label: 'SEDIH',   value: 'sedih'   },
  { emoji: '😐', label: 'BIASA',   value: 'biasa'   },
  { emoji: '🙂', label: 'NYAMAN',  value: 'nyaman'  },
  { emoji: '🤩', label: 'BAHAGIA', value: 'bahagia' },
]

const INITIAL_LOGS: Record<CategoryType, LogRow[]> = {
  teenage: [
    { day: 'Mon', date: '13 April 2026', mood: 'Bahagia', sleep: '8h',   fluid: '6 Gelas', supplement: '✓ TTD', specific: 'Sedang Haid'  },
    { day: 'Sun', date: '12 April 2026', mood: 'Lelah',   sleep: '6h',   fluid: '5 Gelas', supplement: '✗ TTD', specific: 'Sedang Haid'  },
    { day: 'Sat', date: '11 April 2026', mood: 'Nyaman',  sleep: '7.5h', fluid: '7 Gelas', supplement: '✓ TTD', specific: 'Tidak Haid'   },
    { day: 'Fri', date: '10 April 2026', mood: 'Biasa',   sleep: '7h',   fluid: '6 Gelas', supplement: '✓ TTD', specific: 'Tidak Haid'   },
    { day: 'Thu', date: '9 April 2026',  mood: 'Sedih',   sleep: '5.5h', fluid: '4 Gelas', supplement: '✗ TTD', specific: 'Sedang Haid'  },
  ],
  pregnant: [
    { day: 'Mon', date: '13 April 2026', mood: 'Bahagia', sleep: '8h',   fluid: '8 Gelas', supplement: '✓ Suplemen', specific: 'BB: 65 Kg'    },
    { day: 'Sun', date: '12 April 2026', mood: 'Lelah',   sleep: '6h',   fluid: '6 Gelas', supplement: '✓ Suplemen', specific: 'BB: 65 Kg'    },
    { day: 'Sat', date: '11 April 2026', mood: 'Nyaman',  sleep: '7.5h', fluid: '7 Gelas', supplement: '✗ Suplemen', specific: 'BB: 64 Kg'    },
    { day: 'Fri', date: '10 April 2026', mood: 'Biasa',   sleep: '7h',   fluid: '6 Gelas', supplement: '✓ Suplemen', specific: 'BB: 64 Kg'    },
    { day: 'Thu', date: '9 April 2026',  mood: 'Nyaman',  sleep: '8h',   fluid: '8 Gelas', supplement: '✓ Suplemen', specific: 'BB: 63.5 Kg' },
  ],
  breastfeeding: [
    { day: 'Mon', date: '13 April 2026', mood: 'Bahagia', sleep: '8h',   fluid: '9 Gelas', supplement: '✓ Iron', specific: 'Pumping: 5 Sesi' },
    { day: 'Sun', date: '12 April 2026', mood: 'Lelah',   sleep: '6h',   fluid: '7 Gelas', supplement: '✓ Iron', specific: 'Pumping: 7 Sesi' },
    { day: 'Sat', date: '11 April 2026', mood: 'Nyaman',  sleep: '7.5h', fluid: '8 Gelas', supplement: '✗ Iron', specific: 'Pumping: 6 Sesi' },
    { day: 'Fri', date: '10 April 2026', mood: 'Biasa',   sleep: '7h',   fluid: '6 Gelas', supplement: '✓ Iron', specific: 'Pumping: 8 Sesi' },
    { day: 'Thu', date: '9 April 2026',  mood: 'Nyaman',  sleep: '8h',   fluid: '8 Gelas', supplement: '✓ Iron', specific: 'Pumping: 6 Sesi' },
  ],
}

const CATEGORY_META: Record<CategoryType, { tab: string; badge: string }> = {
  teenage:       { tab: 'Teenage',       badge: 'TEENAGE GIRL'      },
  pregnant:      { tab: 'Pregnant',      badge: 'PREGNANT MOTHER'   },
  breastfeeding: { tab: 'Breastfeeding', badge: 'BREASTFEEDING MOM' },
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const PillIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
    <path d="m8.5 8.5 7 7"/>
  </svg>
)
const FluidIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>
)
const MoonIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
)
const SmileIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
)
const CalendarIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
    <circle cx="12" cy="16" r="1" fill="#ec4899"/>
  </svg>
)
const WeightIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
const DropIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>
)
const TrendUpIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
    <path d="M0.816667 7L0 6.18333L4.31667 1.8375L6.65 4.17083L9.68333 1.16667H8.16667V0H11.6667V3.5H10.5V1.98333L6.65 5.83333L4.31667 3.5L0.816667 7Z" fill="#059669"/>
  </svg>
)
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#64748b" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)
const AnemiaIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#546b43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 4 9.6 4 14.5a8 8 0 0 0 16 0C20 9.6 12 2 12 2z"/>
    <path d="M8.5 15a3.5 3.5 0 0 0 7 0" strokeDasharray="2 2"/>
  </svg>
)
const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
)
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

// ─── Save Notification ────────────────────────────────────────────────────────
const SaveNotification = ({ saveStatus, onClose }: { saveStatus: SaveStatus; onClose: () => void }) => {
  if (saveStatus !== 'success' && saveStatus !== 'error') return null
  const isSuccess = saveStatus === 'success'
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full shadow-md flex-shrink-0 whitespace-nowrap" style={{ background: isSuccess ? '#628141' : '#ef4444' }}>
      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white flex-shrink-0">
        {isSuccess ? (
          <svg width="10" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="#628141" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg>
        )}
      </div>
      <span className="font-[Montserrat,sans-serif] font-semibold text-[12px] text-white">
        {isSuccess ? 'Data saved!' : 'Failed to save!'}
      </span>
      <button onClick={onClose} className="hover:opacity-80 transition-opacity">
        <X size={11} className="text-white" />
      </button>
    </div>
  )
}

// ─── Calendar Picker ──────────────────────────────────────────────────────────
const CalendarPicker = ({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) => {
  const parseDate = (str: string) => {
    const parts = str.split('/')
    if (parts.length === 3) {
      const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2])
      const dt = new Date(y, m, d)
      if (!isNaN(dt.getTime())) return dt
    }
    return new Date()
  }
  const initial = parseDate(value)
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const [selected, setSelected] = useState<Date>(initial)

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa']
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }

  const handleSelect = (day: number) => {
    const dt = new Date(viewYear, viewMonth, day)
    setSelected(dt)
    const d = String(dt.getDate()).padStart(2, '0')
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const y = dt.getFullYear()
    onChange(`${d}/${m}/${y}`)
    onClose()
  }

  const isSelected = (day: number) =>
    selected.getDate() === day && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="absolute z-[200] top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 select-none" style={{ width: '272px' }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-bold">‹</button>
        <span className="font-bold text-sm text-slate-800 font-[Montserrat,sans-serif]">{monthNames[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-bold">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map(d => (<div key={d} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day ? (
              <button onClick={() => handleSelect(day)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${isSelected(day) ? 'bg-[#628141] text-white' : 'text-slate-700 hover:bg-[#f0f7e8] hover:text-[#628141]'}`}>
                {day}
              </button>
            ) : <span />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Date Input Field ─────────────────────────────────────────────────────────
const DateInputField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div ref={ref} className="relative inline-block">
      <p className="font-bold text-xs text-[#191c1a] font-[Montserrat,sans-serif] mb-1">{label}</p>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-[#f0f4ed] border border-[#c8dab8] rounded-full px-3.5 py-1.5 hover:bg-[#e4ecda] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#628141" strokeWidth="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="#628141" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="font-bold text-sm text-[#628141] font-[Montserrat,sans-serif] whitespace-nowrap">
          {value || 'DD/MM/YYYY'}
        </span>
      </button>
      {open && <CalendarPicker value={value} onChange={v => { onChange(v); setOpen(false) }} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    aria-pressed={checked}
    className={`relative w-[46px] h-[26px] rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-[#65a30d]' : 'bg-[#d1d5db]'}`}
  >
    <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
  </button>
)

// ─── Stat Cards ───────────────────────────────────────────────────────────────
const SupplementCard = ({ label = 'SUPPLEMENT INTAKE' }: { label?: string }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-0">
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-full bg-[#fef2f2] flex items-center justify-center flex-shrink-0"><PillIconSvg /></div>
        <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] text-right leading-tight ml-2">{label}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">80%</span>
        <span className="text-[10px] text-[#78716c] font-[Inter,sans-serif]">Target: 1 tab/day</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-red-400 rounded-full" style={{ width: '80%' }} />
      </div>
    </div>
  </div>
)
const FluidStatCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-0">
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-full bg-[#eff6ff] flex items-center justify-center flex-shrink-0"><FluidIconSvg /></div>
        <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] text-right">FLUID</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">6/8</span>
          <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">Gelas</span>
        </div>
        <span className="text-[10px] text-[#78716c] font-[Inter,sans-serif]">2 glasses to go!</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 6 ? 'bg-blue-400' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  </div>
)
const RestStatCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-0">
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-full bg-[#f5f3ff] flex items-center justify-center flex-shrink-0"><MoonIconSvg /></div>
        <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] text-right">REST</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">7.5</span>
          <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">Jam</span>
        </div>
        <div className="flex items-center gap-1"><TrendUpIconSvg /><span className="text-[10px] text-emerald-600 font-[Inter,sans-serif]">Good quality</span></div>
      </div>
    </div>
  </div>
)
const MoodStatCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-0">
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center flex-shrink-0"><SmileIconSvg /></div>
        <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] text-right">MOOD</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1.5"><span className="text-xl leading-none">🙂</span><span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">Nyaman</span></div>
        <span className="text-[10px] text-[#78716c] font-[Inter,sans-serif]">Stability high</span>
      </div>
    </div>
  </div>
)
const CycleStatCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-0">
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-full bg-[#fdf2f8] flex items-center justify-center flex-shrink-0"><CalendarIconSvg /></div>
        <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] text-right">CYCLE TRACKING</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">Sedang haid</span>
        <span className="text-[10px] text-[#78716c] font-[Inter,sans-serif]">Siklus teratur</span>
      </div>
    </div>
  </div>
)
const MomWeightCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-0">
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-full bg-[#fdf2f8] flex items-center justify-center flex-shrink-0"><WeightIconSvg /></div>
        <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] text-right">MOM'S WEIGHT</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1"><span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">64.5</span><span className="text-sm text-[#78716c] font-[Inter,sans-serif]">kg</span></div>
        <div className="flex items-center gap-1"><TrendUpIconSvg /><span className="text-[10px] text-emerald-600 font-[Inter,sans-serif]">+1.2kg this month</span></div>
      </div>
    </div>
  </div>
)
const PumpingStatCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-0">
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between w-full">
        <div className="w-9 h-9 rounded-full bg-[#fdf2f8] flex items-center justify-center flex-shrink-0"><DropIconSvg /></div>
        <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] text-right">NURSING &amp; PUMPING</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1"><span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">8</span><span className="text-sm text-[#78716c] font-[Inter,sans-serif]">sesi</span></div>
        <div className="flex items-center gap-1"><TrendUpIconSvg /><span className="text-[10px] text-emerald-600 font-[Inter,sans-serif]">Jadwal stabil</span></div>
      </div>
    </div>
  </div>
)

// ─── Stats Grid ───────────────────────────────────────────────────────────────
const StatsGrid = ({ category, bp }: { category: CategoryType; bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const card5 = category === 'teenage' ? <CycleStatCard /> : category === 'pregnant' ? <MomWeightCard /> : <PumpingStatCard />
  const suppLabel = category === 'breastfeeding' ? 'IRON INTAKE' : 'SUPPLEMENT INTAKE'
  if (bp === 'mobile') return (
    <div className="flex flex-col gap-3 w-full">
      <SupplementCard label={suppLabel} /><FluidStatCard /><RestStatCard /><MoodStatCard />{card5}
    </div>
  )
  if (bp === 'tablet') return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-3 gap-3"><SupplementCard label={suppLabel} /><FluidStatCard /><RestStatCard /></div>
      <div className="grid grid-cols-2 gap-3"><MoodStatCard />{card5}</div>
    </div>
  )
  return (
    <div className="flex gap-4 w-full">
      <SupplementCard label={suppLabel} /><FluidStatCard /><RestStatCard /><MoodStatCard />{card5}
    </div>
  )
}

// ─── Logs Table ───────────────────────────────────────────────────────────────
const LogsTable = ({
  data, category, isMobile, onEdit, onDelete,
}: {
  data: LogRow[]; category: CategoryType; isMobile: boolean
  onEdit?: (index: number) => void
  onDelete?: (index: number) => void
}) => {
  const specificHeader = category === 'teenage' ? 'Menstruasi' : category === 'pregnant' ? 'Berat Badan' : 'Pumping'
  const supplementHeader = category === 'breastfeeding' ? 'Iron' : 'Suplemen'
  const showActions = !!onEdit

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: showActions ? '620px' : '540px', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '44px' }} />
          <col style={{ width: showActions ? '18%' : '22%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: showActions ? '14%' : '17%' }} />
          {showActions && <col style={{ width: '88px' }} />}
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100">
            {['Hari', 'Tanggal', 'Mood', 'Tidur', 'Cairan', supplementHeader, specificHeader, ...(showActions ? ['Aksi'] : [])].map(col => (
              <th key={col} className="font-[Montserrat,sans-serif] font-bold text-[10px] uppercase tracking-[0.5px] text-slate-400 pb-3 whitespace-nowrap text-left px-2 first:pl-0">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-slate-50" style={{ borderBottom: i < data.length - 1 ? '1px solid #f8fafc' : 'none' }}>
              <td className="py-2.5 px-2 first:pl-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-[#a8a29e] font-[Inter,sans-serif]">{row.day}</span>
                </div>
              </td>
              <td className={`py-2.5 px-2 font-[Montserrat,sans-serif] font-medium text-slate-700 whitespace-nowrap overflow-hidden ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.date}</td>
              <td className={`py-2.5 px-2 font-[Montserrat,sans-serif] font-semibold text-slate-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.mood}</td>
              <td className={`py-2.5 px-2 font-[Montserrat,sans-serif] font-bold text-slate-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.sleep}</td>
              <td className={`py-2.5 px-2 font-[Montserrat,sans-serif] font-medium text-slate-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.fluid}</td>
              <td className="py-2.5 px-2">
                <span className={`font-[Montserrat,sans-serif] font-semibold text-[10px] rounded-full px-2 py-0.5 whitespace-nowrap ${row.supplement.startsWith('✓') ? 'text-[#628141] bg-[rgba(98,129,65,0.12)]' : 'text-slate-400 bg-slate-100'}`}>
                  {row.supplement}
                </span>
              </td>
              <td className="py-2.5 px-2">
                <span className="font-[Montserrat,sans-serif] font-bold text-[10px] text-[#628141] bg-[rgba(98,129,65,0.1)] py-[3px] px-[8px] rounded-full whitespace-nowrap">
                  {row.specific}
                </span>
              </td>
              {showActions && (
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit && onEdit(i)}
                      title="Edit"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#628141] hover:bg-[rgba(98,129,65,0.1)] transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(i)}
                      title="Delete"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <IconDelete />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={showActions ? 8 : 7} className="py-8 text-center font-[Montserrat,sans-serif] text-sm text-slate-400">
                Belum ada log tercatat.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── VIEW ALL Modal ───────────────────────────────────────────────────────────
const AllLogsModal = ({
  open, onClose, category, logs, onEdit, onDelete,
}: {
  open: boolean; onClose: () => void; category: CategoryType
  logs: LogRow[]; onEdit: (i: number) => void; onDelete: (i: number) => void
}) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="font-[Montserrat,sans-serif] font-bold text-xl text-slate-900">All Health Logs</span>
            <span className="font-[Montserrat,sans-serif] text-sm text-slate-500">Riwayat lengkap</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer ml-4"><IconClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <LogsTable data={logs} category={category} isMobile={false} onEdit={(i) => { onEdit(i); onClose() }} onDelete={onDelete} />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <span className="font-[Montserrat,sans-serif] text-sm text-slate-400">{logs.length} records</span>
          <button onClick={onClose} className="font-[Montserrat,sans-serif] font-bold text-sm text-white bg-[#628141] hover:bg-[#3f6212] transition-colors px-5 py-2 rounded-lg border-none cursor-pointer">Close</button>
        </div>
      </div>
    </div>
  )
}

// ─── Recent Logs Section ──────────────────────────────────────────────────────
const RecentLogsSection = ({
  category, bp, logs, onEdit, onDelete,
}: {
  category: CategoryType; bp: 'mobile' | 'tablet' | 'desktop'
  logs: LogRow[]; onEdit: (i: number) => void; onDelete: (i: number) => void
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const isMobile = bp === 'mobile'
  const previewData = logs.slice(0, 5)

  return (
    <>
      <div className={`bg-white rounded-[24px] border border-[#f0f0ee] shadow-sm ${isMobile ? 'px-4 py-4' : 'px-6 py-5'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-base text-[#292524] font-['Plus_Jakarta_Sans',sans-serif]">Recent Logs</span>
          <button onClick={() => setModalOpen(true)} className="font-[Montserrat,sans-serif] font-semibold text-xs text-[#65a30d] tracking-[0.6px] uppercase hover:text-[#4d7c0f] bg-transparent border-none cursor-pointer p-0 transition-colors">
            VIEW ALL
          </button>
        </div>
        <LogsTable data={previewData} category={category} isMobile={isMobile} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <AllLogsModal open={modalOpen} onClose={() => setModalOpen(false)} category={category} logs={logs} onEdit={onEdit} onDelete={onDelete} />
    </>
  )
}

// ─── Log Entry Modal ──────────────────────────────────────────────────────────
type LogEntryModalProps = {
  open: boolean; onClose: () => void; category: CategoryType
  saveStatus: SaveStatus; onSave: () => void
  mood: string; setMood: (v: string) => void
  fluid: string; setFluid: (v: string) => void
  sleep: string; setSleep: (v: string) => void
  logDate: string; setLogDate: (v: string) => void
  ttdTaken: boolean; setTtdTaken: (v: boolean) => void
  isMenstruating: boolean; setIsMenstruating: (v: boolean) => void
  supplementTaken: boolean; setSupplementTaken: (v: boolean) => void
  momWeight: string; setMomWeight: (v: string) => void
  supplementBfTaken: boolean; setSupplementBfTaken: (v: boolean) => void
  nursingCount: string; setNursingCount: (v: string) => void
  fluidError?: string; sleepError?: string; isEditing?: boolean
}

const LogEntryModal = (props: LogEntryModalProps) => {
  const {
    open, onClose, category, saveStatus, onSave,
    mood, setMood, fluid, setFluid, sleep, setSleep, logDate, setLogDate,
    ttdTaken, setTtdTaken, isMenstruating, setIsMenstruating,
    supplementTaken, setSupplementTaken, momWeight, setMomWeight,
    supplementBfTaken, setSupplementBfTaken, nursingCount, setNursingCount,
    fluidError, sleepError, isEditing,
  } = props

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const suppChecked = category === 'teenage' ? ttdTaken : category === 'pregnant' ? supplementTaken : supplementBfTaken
  const suppOnChange = category === 'teenage' ? setTtdTaken : category === 'pregnant' ? setSupplementTaken : setSupplementBfTaken
  const leftTitle    = category === 'teenage' ? 'Tablet Tambah Darah (TTD)' : 'Supplement Intake'
  const leftSubtitle = category === 'teenage' ? 'Sudah minum TTD hari ini?' : 'Sudah minum vitamin hari ini?'

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-white rounded-[22px] w-full max-w-[640px] shadow-2xl relative overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-extrabold text-[20px] text-[#1c1917] leading-none font-[Montserrat,sans-serif] tracking-[-0.8px]">
                {isEditing ? 'Update ' : 'Log '}<span className="text-[#4d7c0f]">Entry</span>
              </h2>
              <p className="text-[10px] text-[#4e653d] font-semibold font-[Montserrat,sans-serif] mt-0.5">
                Pantau kesehatanmu untuk cegah anemia dan stunting.
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex-shrink-0">
              <X size={14} className="text-slate-500" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <DateInputField label="Log Date" value={logDate} onChange={setLogDate} />
            {(saveStatus === 'success' || saveStatus === 'error') && (
              <SaveNotification saveStatus={saveStatus} onClose={onClose} />
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">
          <div className="px-5 pt-3 pb-5 flex flex-col gap-3">

            {/* Mood Tracker */}
            <div className="bg-[#f5f5f4] rounded-[16px] p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ecfccb] flex items-center justify-center flex-shrink-0"><SmileIconSvg /></div>
                <div>
                  <p className="font-bold text-sm text-[#1c1917] font-[Montserrat,sans-serif]">Mood Tracker</p>
                  <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif]">Bagaimana perasaanmu hari ini?</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {MOOD_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setMood(opt.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${mood === opt.value ? 'bg-[#f7fee7] border-[#84cc16]' : 'bg-white border-transparent hover:border-slate-200'}`}>
                    <span className="text-lg leading-none">{opt.emoji}</span>
                    <span className="text-[8px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Montserrat,sans-serif]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Fields — 2 col */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left: supplement */}
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">{leftTitle}</p>
                    <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif] mt-0.5">{leftSubtitle}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#d0ebb8] flex items-center justify-center flex-shrink-0"><AnemiaIconSvg /></div>
                </div>
                <div className="bg-[#e6e9e4] rounded-[40px] h-[52px] flex items-center justify-between px-4">
                  <span className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Sudah Konsumsi</span>
                  <ToggleSwitch checked={suppChecked} onChange={suppOnChange} />
                </div>
              </div>

              {/* Right: category-specific */}
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                {category === 'teenage' && (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Cycle Tracking</p>
                        <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif] mt-0.5">Sedang haid hari ini?</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[rgba(178,83,142,0.15)] flex items-center justify-center flex-shrink-0"><CalendarIconSvg /></div>
                    </div>
                    <div className="bg-[#e6e9e4] rounded-[40px] h-[52px] flex items-center justify-between px-4">
                      <span className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Menstruasi</span>
                      <ToggleSwitch checked={isMenstruating} onChange={setIsMenstruating} />
                    </div>
                  </>
                )}
                {category === 'pregnant' && (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Mom's Weight</p>
                        <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif] mt-0.5">Catat berat badan terkini</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[rgba(178,83,142,0.15)] flex items-center justify-center flex-shrink-0"><WeightIconSvg /></div>
                    </div>
                    <div className="relative h-[52px] rounded-[40px] bg-[#e6e9e4] flex items-center px-4 overflow-hidden">
                      <input type="number" value={momWeight} onChange={e => setMomWeight(e.target.value)} placeholder="0" min={0} max={200}
                        className="flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                      <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">kg</span>
                    </div>
                  </>
                )}
                {category === 'breastfeeding' && (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Nursing &amp; Pumping</p>
                        <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif] mt-0.5">Berapa kali hari ini?</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[rgba(178,83,142,0.15)] flex items-center justify-center flex-shrink-0"><DropIconSvg /></div>
                    </div>
                    <div className="relative h-[52px] rounded-[40px] bg-[#e6e9e4] flex items-center px-4 overflow-hidden">
                      <input type="number" value={nursingCount} onChange={e => setNursingCount(e.target.value)} placeholder="0" min={0} max={30}
                        className="flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                      <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">sesi</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fluid + Sleep */}
            <div className="grid grid-cols-2 gap-3">
              {/* Fluid */}
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#d0ebb8] flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#546b43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 2h14l-2 16H7L5 2z"/><path d="M5 8h14"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Fluid Intake</p>
                    <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif]">Jumlah gelas (250ml)</p>
                  </div>
                </div>
                <div className={`relative h-[52px] rounded-[40px] flex items-center px-4 overflow-hidden ${fluidError ? 'bg-[#fde8e8]' : 'bg-[#e6e9e4]'}`}>
                  <input type="number" value={fluid} onChange={e => setFluid(e.target.value)} placeholder="0" min={0} max={20}
                    className="flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                  <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">Gelas</span>
                </div>
                {fluidError && <span className="text-red-500 font-[Montserrat,sans-serif] text-[11px] font-semibold pl-1">{fluidError}</span>}
              </div>

              {/* Sleep */}
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#d0ebb8] flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#546b43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Rest &amp; Sleep</p>
                    <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif]">Durasi tidur (jam)</p>
                  </div>
                </div>
                <div className={`relative h-[52px] rounded-[40px] flex items-center px-4 overflow-hidden ${sleepError ? 'bg-[#fde8e8]' : 'bg-[#e6e9e4]'}`}>
                  <input type="number" value={sleep} onChange={e => setSleep(e.target.value)} placeholder="0" min={0} max={24} step={0.5}
                    className="flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                  <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">Jam</span>
                </div>
                {sleepError && <span className="text-red-500 font-[Montserrat,sans-serif] text-[11px] font-semibold pl-1">{sleepError}</span>}
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 pt-1">
              <button onClick={onSave} className="flex-1 h-[46px] rounded-full bg-[#4d7c0f] hover:bg-[#3f6212] transition-colors font-[Montserrat,sans-serif] font-black text-sm text-white tracking-widest shadow-md">
                {isEditing ? 'UPDATE LOG' : 'SAVE LOG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HealthLog() {
  const bp = useBreakpoint()

  const [activeCategory, setActiveCategory] = useState<CategoryType>('teenage')
  const [logs, setLogs] = useState<Record<CategoryType, LogRow[]>>(INITIAL_LOGS)

  const [modalOpen,  setModalOpen]  = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [editIndex,  setEditIndex]  = useState<number | null>(null)

  // Form state
  const [mood,              setMood]              = useState('biasa')
  const [fluid,             setFluid]             = useState('')
  const [sleep,             setSleep]             = useState('')
  const [logDate,           setLogDate]           = useState('13/04/2026')
  const [ttdTaken,          setTtdTaken]          = useState(false)
  const [isMenstruating,    setIsMenstruating]    = useState(false)
  const [supplementTaken,   setSupplementTaken]   = useState(false)
  const [momWeight,         setMomWeight]         = useState('')
  const [supplementBfTaken, setSupplementBfTaken] = useState(false)
  const [nursingCount,      setNursingCount]      = useState('')

  // Validation errors
  const [fluidError, setFluidError] = useState<string | undefined>()
  const [sleepError, setSleepError] = useState<string | undefined>()

  const validateAndSave = () => {
    let hasError = false
    if (!fluid.trim() || isNaN(Number(fluid)) || Number(fluid) < 0) {
      setFluidError('Masukkan jumlah gelas yang valid (contoh: 6).')
      hasError = true
    } else if (Number(fluid) > 20) {
      setFluidError('Jumlah cairan maksimal 20 gelas.')
      hasError = true
    } else {
      setFluidError(undefined)
    }

    if (!sleep.trim() || isNaN(Number(sleep)) || Number(sleep) < 0) {
      setSleepError('Masukkan durasi tidur yang valid (contoh: 7.5).')
      hasError = true
    } else if (Number(sleep) > 24) {
      setSleepError('Durasi tidur maksimal 24 jam.')
      hasError = true
    } else {
      setSleepError(undefined)
    }

    if (hasError) return

    const suppPrefix = activeCategory === 'teenage' ? (ttdTaken ? '✓ TTD' : '✗ TTD')
      : activeCategory === 'pregnant' ? (supplementTaken ? '✓ Suplemen' : '✗ Suplemen')
      : (supplementBfTaken ? '✓ Iron' : '✗ Iron')

    const specificVal = activeCategory === 'teenage'
      ? (isMenstruating ? 'Sedang Haid' : 'Tidak Haid')
      : activeCategory === 'pregnant'
      ? (momWeight ? `BB: ${momWeight} Kg` : 'BB: — Kg')
      : (nursingCount ? `Pumping: ${nursingCount} Sesi` : 'Pumping: 0 Sesi')

    const moodLabel = MOOD_OPTIONS.find(m => m.value === mood)?.label ?? mood
    const [dd, mm, yyyy] = logDate.split('/')
    const dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const dayLabel = dayNames[dateObj.getDay()]
    const dateLabel = `${Number(dd)} ${monthNames[Number(mm) - 1]} ${yyyy}`

    const newRow: LogRow = {
      day: dayLabel,
      date: dateLabel,
      mood: moodLabel.charAt(0).toUpperCase() + moodLabel.slice(1).toLowerCase(),
      sleep: `${sleep}h`,
      fluid: `${fluid} Gelas`,
      supplement: suppPrefix,
      specific: specificVal,
    }

    setLogs(prev => {
      const arr = [...prev[activeCategory]]
      if (editIndex !== null) {
        arr[editIndex] = newRow
      } else {
        arr.unshift(newRow)
      }
      return { ...prev, [activeCategory]: arr }
    })

    setSaveStatus('success')
    setTimeout(() => { setSaveStatus('idle'); setModalOpen(false); setEditIndex(null) }, 2000)
  }

  const handleEdit = (index: number) => {
    const row = logs[activeCategory][index]
    // Pre-fill form from row data
    const moodOpt = MOOD_OPTIONS.find(m => m.label.toLowerCase() === row.mood.toLowerCase())
    setMood(moodOpt?.value ?? 'biasa')
    // Parse fluid: "6 Gelas" → "6"
    setFluid(row.fluid.replace(' Gelas', '').trim())
    // Parse sleep: "8h" → "8"
    setSleep(row.sleep.replace('h', '').trim())
    // Parse date: "13 April 2026" → "13/04/2026"
    try {
      const parts = row.date.split(' ')
      const monthMap: Record<string,string> = { January:'01', February:'02', March:'03', April:'04', May:'05', June:'06', July:'07', August:'08', September:'09', October:'10', November:'11', December:'12' }
      const d = parts[0].padStart(2,'0')
      const m = monthMap[parts[1]] ?? '01'
      const y = parts[2]
      setLogDate(`${d}/${m}/${y}`)
    } catch { setLogDate('13/04/2026') }
    // Parse supplement toggle
    if (activeCategory === 'teenage') setTtdTaken(row.supplement.startsWith('✓'))
    else if (activeCategory === 'pregnant') setSupplementTaken(row.supplement.startsWith('✓'))
    else setSupplementBfTaken(row.supplement.startsWith('✓'))
    // Parse specific
    if (activeCategory === 'teenage') setIsMenstruating(row.specific === 'Sedang Haid')
    else if (activeCategory === 'pregnant') setMomWeight(row.specific.replace('BB: ', '').replace(' Kg', '').trim())
    else setNursingCount(row.specific.replace('Pumping: ', '').replace(' Sesi', '').trim())

    setFluidError(undefined)
    setSleepError(undefined)
    setSaveStatus('idle')
    setEditIndex(index)
    setModalOpen(true)
  }

  const handleDelete = (index: number) => {
    setLogs(prev => {
      const arr = prev[activeCategory].filter((_, i) => i !== index)
      return { ...prev, [activeCategory]: arr }
    })
    if (editIndex === index) setEditIndex(null)
    else if (editIndex !== null && index < editIndex) setEditIndex(editIndex - 1)
  }

  const handleOpenModal = () => {
    setMood('biasa'); setFluid(''); setSleep(''); setLogDate('13/04/2026')
    setTtdTaken(false); setIsMenstruating(false)
    setSupplementTaken(false); setMomWeight('')
    setSupplementBfTaken(false); setNursingCount('')
    setFluidError(undefined); setSleepError(undefined)
    setSaveStatus('idle'); setEditIndex(null)
    setModalOpen(true)
  }

  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const meta     = CATEGORY_META[activeCategory]

  const CategoryTabs = () => (
    <div className="flex items-center gap-1 p-[4px] rounded-full" style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
      {(['teenage', 'pregnant', 'breastfeeding'] as CategoryType[]).map(cat => (
        <button key={cat} onClick={() => setActiveCategory(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all font-[Inter,sans-serif] ${activeCategory === cat ? 'bg-white text-[#65a30d] shadow-sm' : 'text-[#78716c] hover:text-[#57534e]'}`}>
          {CATEGORY_META[cat].tab}
        </button>
      ))}
    </div>
  )

  const LogDataButton = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <button onClick={handleOpenModal}
      className={`flex items-center justify-center gap-2 bg-[#65a30d] hover:bg-[#4d7c0f] transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-[0px_6px_12px_-2px_rgba(54,83,20,0.25)] font-[Inter,sans-serif] whitespace-nowrap ${fullWidth ? 'w-full' : ''}`}>
      <Plus size={13} />
      Log Data
    </button>
  )

  return (
    <div className="w-full bg-[#f8f8f6] font-[Montserrat,sans-serif]">
      <div className={`w-full mx-auto ${isMobile ? 'px-4 py-5' : isTablet ? 'px-6 py-6' : 'px-10 py-7 max-w-[1280px]'}`}>

        {/* ── Hero ── */}
        {isMobile ? (
          <div className="flex flex-col gap-3.5 mb-5">
            <div className="flex flex-col gap-1">
              <h1 className="font-extrabold text-[24px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Hello, <span className="text-[#65a30d]">Sarah</span> 👋</h1>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase font-[Inter,sans-serif]" style={{ background: '#ecfccb', color: '#65a30d' }}>{meta.badge}</span>
                <span className="text-xs text-[#78716c] font-[Inter,sans-serif]">• Pantau jurnal kesehatanmu.</span>
              </div>
            </div>
            <div className="flex items-center gap-1 p-[4px] rounded-full w-full" style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              {(['teenage', 'pregnant', 'breastfeeding'] as CategoryType[]).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-1.5 rounded-full text-[10px] font-semibold transition-all font-[Inter,sans-serif] ${activeCategory === cat ? 'bg-white text-[#65a30d] shadow-sm' : 'text-[#78716c] hover:text-[#57534e]'}`}>
                  {CATEGORY_META[cat].tab}
                </button>
              ))}
            </div>
            <LogDataButton fullWidth />
          </div>
        ) : isTablet ? (
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex flex-col gap-1">
              <h1 className="font-extrabold text-[26px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Hello, <span className="text-[#65a30d]">Sarah</span> 👋</h1>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase font-[Inter,sans-serif]" style={{ background: '#ecfccb', color: '#65a30d' }}>{meta.badge}</span>
                <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">• Pantau jurnal kesehatanmu.</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0"><CategoryTabs /><LogDataButton /></div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-extrabold text-[28px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Hello, <span className="text-[#65a30d]">Sarah</span> 👋</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.55px] uppercase font-[Inter,sans-serif]" style={{ background: '#ecfccb', color: '#65a30d' }}>{meta.badge}</span>
                <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">• Pantau jurnal kesehatanmu.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-nowrap flex-shrink-0"><CategoryTabs /><LogDataButton /></div>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div className="mb-5"><StatsGrid category={activeCategory} bp={bp} /></div>

        {/* ── Recent Logs ── */}
        <RecentLogsSection category={activeCategory} bp={bp} logs={logs[activeCategory]} onEdit={handleEdit} onDelete={handleDelete} />

      </div>

      {/* ── Log Entry Modal ── */}
      <LogEntryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditIndex(null) }}
        category={activeCategory}
        saveStatus={saveStatus}
        onSave={validateAndSave}
        mood={mood} setMood={setMood}
        fluid={fluid} setFluid={(v) => { setFluid(v); if (fluidError) setFluidError(undefined) }}
        sleep={sleep} setSleep={(v) => { setSleep(v); if (sleepError) setSleepError(undefined) }}
        logDate={logDate} setLogDate={setLogDate}
        ttdTaken={ttdTaken} setTtdTaken={setTtdTaken}
        isMenstruating={isMenstruating} setIsMenstruating={setIsMenstruating}
        supplementTaken={supplementTaken} setSupplementTaken={setSupplementTaken}
        momWeight={momWeight} setMomWeight={setMomWeight}
        supplementBfTaken={supplementBfTaken} setSupplementBfTaken={setSupplementBfTaken}
        nursingCount={nursingCount} setNursingCount={setNursingCount}
        fluidError={fluidError}
        sleepError={sleepError}
        isEditing={editIndex !== null}
      />
    </div>
  )
}