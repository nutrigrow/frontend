import { useState, useEffect, useRef } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import {
  childrenService,
  transformBmiChartData,
  transformPercentileToMeasurements,
  transformToSubChartData,
} from '../services/children.service'

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

type SaveStatus = 'idle' | 'success' | 'error'

// ─── Chart Data ───────────────────────────────────────────────────────────────
type Measurement = {
  id: number;
  date: string; age: string; height: string; weight: string; heightPct: string; weightPct: string
  risikoStuntingMl: string | null
  mlConfidence: number | null
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconAddCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M9 15H11V11H15V9H11V5H9V9H5V11H9V15ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#628141"/>
  </svg>
)

const IconHeightSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12" fill="none">
    <path d="M2 12C1.45 12 0.979167 11.8042 0.5875 11.4125C0.195833 11.0208 0 10.55 0 10V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V10C20 10.55 19.8042 11.0208 19.4125 11.4125C19.0208 11.8042 18.55 12 18 12H2ZM2 10H18V2H15V6H13V2H11V6H9V2H7V6H5V2H2V10Z" fill="#628141"/>
  </svg>
)

const IconWeightSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 9C9.83333 9 10.5417 8.70833 11.125 8.125C11.7083 7.54167 12 6.83333 12 6C12 5.16667 11.7083 4.45833 11.125 3.875C10.5417 3.29167 9.83333 3 9 3C8.16667 3 7.45833 3.29167 6.875 3.875C6.29167 4.45833 6 5.16667 6 6C6 6.83333 6.29167 7.54167 6.875 8.125C7.45833 8.70833 8.16667 9 9 9ZM7.5 6.5C7.36667 6.5 7.25 6.45 7.15 6.35C7.05 6.25 7 6.13333 7 6C7 5.86667 7.05 5.75 7.15 5.65C7.25 5.55 7.36667 5.5 7.5 5.5C7.63333 5.5 7.75 5.55 7.85 5.65C7.95 5.75 8 5.86667 8 6C8 6.13333 7.95 6.25 7.85 6.35C7.75 6.45 7.63333 6.5 7.5 6.5ZM9 6.5C8.86667 6.5 8.75 6.45 8.65 6.35C8.55 6.25 8.5 6.13333 8.5 6C8.5 5.86667 8.55 5.75 8.65 5.65C8.75 5.55 8.86667 5.5 9 5.5C9.13333 5.5 9.25 5.55 9.35 5.65C9.45 5.75 9.5 5.86667 9.5 6C9.5 6.13333 9.45 6.25 9.35 6.35C9.25 6.45 9.13333 6.5 9 6.5ZM10.5 6.5C10.3667 6.5 10.25 6.45 10.15 6.35C10.05 6.25 10 6.13333 10 6C10 5.86667 10.05 5.75 10.15 5.65C10.25 5.55 10.3667 5.5 10.5 5.5C10.6333 5.5 10.75 5.55 10.85 5.65C10.95 5.75 11 5.86667 11 6C11 6.13333 10.95 6.25 10.85 6.35C10.75 6.45 10.6333 6.5 10.5 6.5ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2ZM2 16H16V2H2V16Z" fill="#628141"/>
  </svg>
)

const IconStuntingSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3.5 7C2.53333 7 1.70833 6.65833 1.025 5.975C0.341667 5.29167 0 4.46667 0 3.5C0 2.53333 0.341667 1.70833 1.025 1.025C1.70833 0.341667 2.53333 0 3.5 0C4.46667 0 5.29167 0.341667 5.975 1.025C6.65833 1.70833 7 2.53333 7 3.5C7 4.46667 6.65833 5.29167 5.975 5.975C5.29167 6.65833 4.46667 7 3.5 7ZM3.5 5C3.91667 5 4.27083 4.85417 4.5625 4.5625C4.85417 4.27083 5 3.91667 5 3.5C5 3.08333 4.85417 2.72917 4.5625 2.4375C4.27083 2.14583 3.91667 2 3.5 2C3.08333 2 2.72917 2.14583 2.4375 2.4375C2.14583 2.72917 2 3.08333 2 3.5C2 3.91667 2.14583 4.27083 2.4375 4.5625C2.72917 4.85417 3.08333 5 3.5 5ZM12.5 16C11.5333 16 10.7083 15.6583 10.025 14.975C9.34167 14.2917 9 13.4667 9 12.5C9 11.5333 9.34167 10.7083 10.025 10.025C10.7083 9.34167 11.5333 9 12.5 9C13.4667 9 14.2917 9.34167 14.975 10.025C15.6583 10.7083 16 11.5333 16 12.5C16 13.4667 15.6583 14.2917 14.975 14.975C14.2917 15.6583 13.4667 16 12.5 16ZM12.5 14C12.9167 14 13.2708 13.8542 13.5625 13.5625C13.8542 13.2708 14 12.9167 14 12.5C14 12.0833 13.8542 11.7292 13.5625 11.4375C13.2708 11.1458 12.9167 11 12.5 11C12.0833 11 11.7292 11.1458 11.4375 11.4375C11.1458 11.7292 11 12.0833 11 12.5C11 12.9167 11.1458 13.2708 11.4375 13.5625C11.7292 13.8542 12.0833 14 12.5 14ZM1.4 16L0 14.6L14.6 0L16 1.4L1.4 16Z" fill="#628141"/>
  </svg>
)

const IconTrendUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
    <path d="M0.816667 7L0 6.18333L4.31667 1.8375L6.65 4.17083L9.68333 1.16667H8.16667V0H11.6667V3.5H10.5V1.98333L6.65 5.83333L4.31667 3.5L0.816667 7Z" fill="#059669"/>
  </svg>
)

const IconTrendDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
    <path d="M0.816667 0L0 0.816667L4.31667 5.1625L6.65 2.82917L9.68333 5.83333H8.16667V7H11.6667V3.5H10.5V5.01667L6.65 1.16667L4.31667 3.5L0.816667 0Z" fill="#ef4444"/>
  </svg>
)

const IconExpand = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M0 18V13H2V16H5V18H0ZM13 18V16H16V13H18V18H13ZM0 5V0H5V2H2V5H0ZM16 5V2H13V0H18V5H16Z" fill="#64748B"/>
  </svg>
)

const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 15L15 5M5 5L15 15" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

// ─── Custom Chart Dot ─────────────────────────────────────────────────────────
const makeLineDot = (data: any[], _label: string) => (props: any) => {
  const { cx, cy, index } = props
  if (index !== data.length - 1) {
    return <circle key={`dot-sm-${index}`} cx={cx} cy={cy} r={3.5} fill="#3f6212" stroke="white" strokeWidth={1.5} />
  }
  return <circle key={`dot-end-${index}`} cx={cx} cy={cy} r={5.5} fill="#3f6212" stroke="white" strokeWidth={2} />
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
const BmiTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null
  const leo = payload.find((p: any) => p.dataKey === 'leo')
  if (!leo) return null
  return (
    <div className="bg-slate-900 text-white rounded-lg px-3 py-2 shadow-xl border border-slate-700 text-xs font-[Montserrat,sans-serif]">
      <p className="font-bold text-slate-300 mb-0.5 text-[11px]">{label}</p>
      <p className="font-bold text-[#86efac] text-[11px]">Your Child: <span className="text-white">{leo.value}</span></p>
    </div>
  )
}

const ChildTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload || !payload.length) return null
  const child = payload.find((p: any) => p.dataKey === 'child')
  if (!child) return null
  return (
    <div className="bg-slate-900 text-white rounded-lg px-3 py-2 shadow-xl border border-slate-700 text-xs font-[Montserrat,sans-serif]">
      <p className="font-bold text-slate-300 mb-0.5 text-[11px]">{label}</p>
      <p className="font-bold text-[#86efac] text-[11px]">Your Child: <span className="text-white">{child.value} {unit}</span></p>
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
    <div className="absolute z-50 top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 w-72 select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600 font-bold">‹</button>
        <span className="font-bold text-sm text-slate-800 font-[Montserrat,sans-serif]">{monthNames[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600 font-bold">›</button>
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

// ─── Input Field ──────────────────────────────────────────────────────────────
const InputField = ({
  label, value, onChange, placeholder, type = 'text', error,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; error?: string
}) => (
  <div className="flex flex-col gap-1 min-w-0 w-full">
    <label className="pl-1 text-slate-500 font-bold text-[11px] uppercase tracking-[0.6px] leading-4 font-[Montserrat,sans-serif]">{label}</label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`h-[54px] border rounded-lg px-3 font-bold text-lg text-gray-500 bg-white outline-none w-full box-border transition-colors duration-150 focus:border-[#628141] font-[Montserrat,sans-serif] ${error ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
    />
    {error && <span className="pl-1 text-red-500 font-[Montserrat,sans-serif] text-[11px] font-semibold leading-4">{error}</span>}
  </div>
)

// ─── Date Input with Calendar ─────────────────────────────────────────────────
const DateInputField = ({
  label, value, onChange, error,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div ref={ref} className="flex flex-col gap-1 min-w-0 w-full relative">
      <label className="pl-1 text-slate-500 font-bold text-[11px] uppercase tracking-[0.6px] leading-4 font-[Montserrat,sans-serif]">{label}</label>
      <button
        type="button" onClick={() => setOpen(o => !o)}
        className={`h-[54px] border rounded-lg px-3 font-bold text-lg text-gray-500 bg-white w-full box-border transition-colors duration-150 text-left flex items-center gap-2 hover:border-[#628141] focus:border-[#628141] focus:outline-none font-[Montserrat,sans-serif] ${error ? 'border-red-400' : 'border-slate-200'}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#94a3b8" strokeWidth="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>{value || 'DD/MM/YYYY'}</span>
      </button>
      {error && <span className="pl-1 text-red-500 font-[Montserrat,sans-serif] text-[11px] font-semibold leading-4">{error}</span>}
      {open && <CalendarPicker value={value} onChange={v => { onChange(v); setOpen(false) }} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── Validation helper ────────────────────────────────────────────────────────
const validateInputs = (height: string, weight: string, date: string) => {
  const errors: { height?: string; weight?: string; date?: string } = {}
  const h = parseFloat(height)
  if (!height.trim()) errors.height = 'Height is required.'
  else if (isNaN(h) || h <= 0) errors.height = 'Please enter a valid height (e.g. 75.5).'
  else if (h < 30 || h > 250) errors.height = 'Height must be between 30 and 250 cm.'

  const w = parseFloat(weight)
  if (!weight.trim()) errors.weight = 'Weight is required.'
  else if (isNaN(w) || w <= 0) errors.weight = 'Please enter a valid weight (e.g. 10.5).'
  else if (w < 0.5 || w > 300) errors.weight = 'Weight must be between 0.5 and 300 kg.'

  if (!date.trim()) errors.date = 'Date is required.'
  else {
    const parts = date.split('/')
    if (parts.length !== 3 || parts.some(p => p === '') || isNaN(new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime())) {
      errors.date = 'Please enter a valid date (DD/MM/YYYY).'
    }
  }
  return errors
}

// ─── Section 1: Log New Growth ────────────────────────────────────────────────
const LogNewGrowthSection = ({
  bp, heightVal, setHeightVal, weightVal, setWeightVal, dateVal, setDateVal,
  onSave, heightError, weightError, dateError, editIndex, onCancelEdit,
  children, selectedChildId, onSelectChild, saving,
}: {
  bp: 'mobile' | 'tablet' | 'desktop'
  heightVal: string; setHeightVal: (v: string) => void
  weightVal: string; setWeightVal: (v: string) => void
  dateVal: string;   setDateVal: (v: string) => void
  onSave: () => void
  heightError?: string; weightError?: string; dateError?: string
  editIndex: number | null; onCancelEdit: () => void
  children: { id: number; namaDepan: string; namaAkhir: string | null }[]
  selectedChildId: number | null
  onSelectChild: (id: number) => void
  saving?: boolean
}) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'

  const isEditing = editIndex !== null

  const ChildSelectDropdown = () => (
    <div className="flex flex-col gap-1 w-full">
      <label className="pl-1 text-slate-500 font-bold text-[11px] uppercase tracking-[0.6px] leading-4 font-[Montserrat,sans-serif]">Select Child</label>
      <div className="relative w-full">
        <select
          value={selectedChildId ?? ''}
          onChange={e => { if (e.target.value) onSelectChild(Number(e.target.value)) }}
          className="h-[54px] px-4 w-full font-bold text-lg text-slate-700 outline-none cursor-pointer font-[Montserrat,sans-serif] appearance-none"
          style={{ borderRadius: '8px', border: '1px solid #E2E8F0', background: 'rgba(63, 98, 18, 0.10)' }}
        >
          {!selectedChildId && <option value="" disabled>Pilih Anak</option>}
          {children.map(ch => (
            <option key={ch.id} value={ch.id}>
              {ch.namaDepan}{ch.namaAkhir ? ' ' + ch.namaAkhir : ''}
            </option>
          ))}
        </select>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  )

  const titleLabel = isEditing ? 'Update Measurement' : 'Log New Growth'
  const saveLabel  = isEditing ? 'Update' : 'Save'

  if (isMobile) {
    return (
      <div className={`relative w-full rounded-xl mb-8 shadow-sm border-2 ${isEditing ? 'bg-[rgba(98,129,65,0.08)] border-[#628141]' : 'bg-[rgba(98,129,65,0.05)] border-[rgba(98,129,65,0.2)]'}`}>
        <div className="flex flex-col p-5 gap-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconAddCircle />
              <span className="font-[Montserrat,sans-serif] font-black text-[17px] text-slate-900 leading-7">{titleLabel}</span>
            </div>
            {isEditing && (
              <button onClick={onCancelEdit} className="text-xs font-semibold text-slate-500 bg-white hover:bg-slate-100 rounded-full px-3 py-1 border border-slate-200 cursor-pointer font-[Montserrat,sans-serif] transition-colors">
                Cancel
              </button>
            )}
          </div>
          <p className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-600 leading-[22px] m-0">
            Pemantauan rutin membantu mencegah stunting secara dini.
          </p>
          <ChildSelectDropdown />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Height (cm)" value={heightVal} onChange={setHeightVal} placeholder="0.0" error={heightError} />
            <InputField label="Weight (kg)" value={weightVal} onChange={setWeightVal} placeholder="0.0" error={weightError} />
          </div>
          <DateInputField label="Date of Measurement" value={dateVal} onChange={setDateVal} error={dateError} />
          <button onClick={onSave} disabled={saving} className={`flex items-center justify-center bg-[#628141] hover:bg-[#3f6212] transition-colors duration-150 border-none rounded-lg shadow-lg h-[50px] w-full font-[Montserrat,sans-serif] font-black text-lg text-white cursor-pointer ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {saving ? 'Saving...' : saveLabel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full rounded-xl mb-8 shadow-sm border-2 ${isEditing ? 'bg-[rgba(98,129,65,0.08)] border-[#628141]' : 'bg-[rgba(98,129,65,0.05)] border-[rgba(98,129,65,0.2)]'}`}>
      <div className={`flex w-full box-border gap-5 ${isTablet ? 'flex-col p-6' : 'flex-row items-start p-[34px]'}`}>
        {isTablet ? (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconAddCircle />
                  <span className="font-[Montserrat,sans-serif] font-black text-[18px] text-slate-900 leading-7">{titleLabel}</span>
                </div>
                {isEditing && (
                  <button onClick={onCancelEdit} className="text-xs font-semibold text-slate-500 bg-white hover:bg-slate-100 rounded-full px-3 py-1 border border-slate-200 cursor-pointer font-[Montserrat,sans-serif] transition-colors">
                    Cancel
                  </button>
                )}
              </div>
              <p className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-600 leading-[22px] m-0 max-w-lg">
                Pemantauan rutin membantu mencegah stunting secara dini.
              </p>
              <ChildSelectDropdown />
            </div>
            <div className="flex flex-row items-start gap-3 w-full">
              <div className="flex-1 min-w-0"><InputField label="Height (cm)" value={heightVal} onChange={setHeightVal} placeholder="0.0" error={heightError} /></div>
              <div className="flex-1 min-w-0"><InputField label="Weight (kg)" value={weightVal} onChange={setWeightVal} placeholder="0.0" error={weightError} /></div>
              <div className="flex-[1.4] min-w-0"><DateInputField label="Date of Measurement" value={dateVal} onChange={setDateVal} error={dateError} /></div>
            </div>
            <button onClick={onSave} disabled={saving} className={`flex items-center justify-center bg-[#628141] hover:bg-[#3f6212] transition-colors duration-150 border-none rounded-lg shadow-lg h-[54px] w-full font-[Montserrat,sans-serif] font-black text-base text-white cursor-pointer ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {saving ? 'Saving...' : saveLabel}
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2 flex-shrink-0 w-[250px]">
              <div className="flex items-center gap-2">
                <IconAddCircle />
                <span className="font-[Montserrat,sans-serif] font-black text-xl text-slate-900 leading-7">{titleLabel}</span>
              </div>
              {isEditing && (
                <button onClick={onCancelEdit} className="text-xs font-semibold text-slate-500 bg-white hover:bg-slate-100 rounded-full px-3 py-1 border border-slate-200 cursor-pointer font-[Montserrat,sans-serif] transition-colors self-start">
                  Cancel Edit
                </button>
              )}
              <p className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-600 leading-[22px] m-0">
                Pemantauan rutin membantu mencegah stunting secara dini.
              </p>
              <div className="mt-3"><ChildSelectDropdown /></div>
            </div>
            <div className="flex flex-col gap-3 flex-1 min-w-0 mt-5">
              <div className="grid grid-cols-3 gap-4 w-full">
                <InputField label="Height (cm)" value={heightVal} onChange={setHeightVal} placeholder="0.0" error={heightError} />
                <InputField label="Weight (kg)" value={weightVal} onChange={setWeightVal} placeholder="0.0" error={weightError} />
                <DateInputField label="Date of Measurement" value={dateVal} onChange={setDateVal} error={dateError} />
              </div>
              <button onClick={onSave} disabled={saving} className={`flex items-center justify-center bg-[#628141] hover:bg-[#3f6212] transition-colors duration-150 border-none rounded-lg shadow-lg h-[50px] w-full font-[Montserrat,sans-serif] font-black text-lg text-white cursor-pointer ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {saving ? 'Saving...' : saveLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Stunting Category Helper ─────────────────────────────────────────────────
type StuntingCategory = 'low' | 'moderate' | 'high'

const getStuntingCategory = (pct: number, aiLabel?: string | null): StuntingCategory => {
  if (aiLabel) {
    const lowAlpha = aiLabel.toLowerCase()
    if (lowAlpha.includes('high')) return 'high'
    if (lowAlpha.includes('moderate')) return 'moderate'
    return 'low'
  }
  if (pct <= 3) return 'high'
  if (pct <= 10) return 'moderate'
  return 'low'
}

const extractPercentileNumber = (raw: string): number | null => {
  const m = raw.match(/-?\d+(\.\d+)?/)
  if (!m) return null
  const num = Number(m[0])
  return Number.isNaN(num) ? null : num
}

const STUNTING_CONFIG: Record<StuntingCategory, {
  label: string
  bgColor: string
  borderColor: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  icon: string
  insights: {
    reason: string[]
    impact: string[]
    prevention: string[]
  }
}> = {
  low: {
    label: 'Low risk of stunting',
    bgColor: '#F1F8E9',
    borderColor: '#C5E1A5',
    badgeBg: '#E8F5E9',
    badgeText: '#2E7D32',
    badgeBorder: '#A5D6A7',
    icon: '✅',
    insights: {
      reason: [
        "Tinggi badan anak berada di atas persentil ke-25 kurva WHO, menandakan pertumbuhan linier yang baik.",
        "Rasio berat/tinggi (weight-for-height) dalam rentang normal — indikator kecukupan asupan kalori harian.",
        "Tidak ada riwayat penyakit infeksi berulang yang signifikan yang dapat mengganggu absorpsi nutrisi.",
      ],
      impact: [
        "Risiko stunting rendah berarti perkembangan kognitif dan fisik berjalan sesuai jalurnya.",
        "Anak dengan status ini umumnya memiliki sistem imun yang lebih baik dan performa akademik yang optimal.",
      ],
      prevention: [
        "Lanjutkan pemantauan rutin setiap 3 bulan untuk mendeteksi perubahan dini.",
        "Pastikan pola makan seimbang dengan cukup protein hewani, zinc, dan zat besi.",
        "Pertahankan jadwal imunisasi dan kunjungan posyandu secara konsisten.",
      ],
    },
  },
  moderate: {
    label: 'Moderate risk of stunting',
    bgColor: '#FFFDE7',
    borderColor: '#FFF176',
    badgeBg: '#FFF9C4',
    badgeText: '#F57F17',
    badgeBorder: '#FFE082',
    icon: '⚠️',
    insights: {
      reason: [
        "Tinggi badan anak mulai berada di bawah median WHO, mengindikasikan potensi pertumbuhan yang melambat.",
        "Asupan nutrisi makro atau mikro (terutama zinc, protein) mungkin belum optimal dalam 3–6 bulan terakhir.",
        "Penyakit infeksi ringan yang berulang dapat menjadi faktor penyebab gangguan penyerapan nutrisi.",
      ],
      impact: [
        "Stunting moderat dapat memengaruhi perkembangan otak dan kapasitas belajar jika tidak ditangani.",
        "Anak berisiko mengalami keterlambatan perkembangan motorik halus dan kasar.",
        "Dalam jangka panjang, stunting berkorelasi dengan produktivitas ekonomi yang lebih rendah.",
      ],
      prevention: [
        "Konsultasikan dengan ahli gizi untuk penyesuaian diet MPASI atau makanan keluarga.",
        "Tambahkan sumber protein hewani: telur, ikan, daging, atau susu setiap hari.",
        "Perketat monitoring — lakukan pengukuran setiap bulan dan catat tren pertumbuhan.",
        "Pertimbangkan suplementasi zinc dan zat besi sesuai rekomendasi dokter anak.",
      ],
    },
  },
  high: {
    label: 'High risk of stunting',
    bgColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    badgeBg: '#FFCDD2',
    badgeText: '#C62828',
    badgeBorder: '#EF9A9A',
    icon: '🚨',
    insights: {
      reason: [
        "Tinggi badan anak berada di bawah -2 SD (standar deviasi) kurva pertumbuhan WHO — zona merah stunting.",
        "Defisit asupan energi dan protein kronis selama masa 1000 Hari Pertama Kehidupan (HPK) merupakan penyebab utama.",
        "Kemungkinan terdapat faktor penyerta: sanitasi buruk, infeksi parasit, atau kondisi sosioekonomis tertentu.",
      ],
      impact: [
        "Stunting berdampak permanen pada struktur otak — neuron yang tidak berkembang optimal tidak dapat dipulihkan sepenuhnya.",
        "Risiko tinggi mengalami gangguan metabolik (obesitas, diabetes tipe 2) di usia dewasa.",
        "Penurunan IQ rata-rata 5–11 poin dibanding anak dengan pertumbuhan normal (data WHO, 2020).",
        "Imunitas tubuh lebih lemah, rentan terhadap penyakit infeksi berat.",
      ],
      prevention: [
        "Segera konsultasikan dengan dokter anak dan ahli gizi klinik — diperlukan intervensi medis.",
        "Program therapeutic feeding dengan RUTF (Ready-to-Use Therapeutic Food) dapat dipertimbangkan.",
        "Pastikan akses air bersih dan sanitasi untuk mencegah diare dan infeksi yang memperburuk kondisi.",
        "Pantau berat dan tinggi badan setiap 2 minggu dengan bantuan tenaga kesehatan.",
      ],
    },
  },
}

// ─── Stunting Insight Modal ───────────────────────────────────────────────────
const StuntingInsightModal = ({
  open, onClose, stuntingPct,
}: {
  open: boolean; onClose: () => void; stuntingPct: number
}) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const category = getStuntingCategory(stuntingPct)
  const config   = STUNTING_CONFIG[category]

  const SectionBlock = ({
    title, items, dotColor,
  }: { title: string; items: string[]; dotColor: string }) => (
    <div className="flex flex-col gap-2">
      <span className="font-[Montserrat,sans-serif] font-bold text-sm text-slate-700 uppercase tracking-[0.6px]">{title}</span>
      <ul className="flex flex-col gap-2 m-0 pl-0 list-none">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full" style={{ background: dotColor }} />
            <span className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-600 leading-[22px]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[75vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-start justify-between px-6 pt-6 pb-4 flex-shrink-0"
          style={{ background: config.bgColor, borderBottom: `1px solid ${config.borderColor}` }}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{config.icon}</span>
              <span className="font-[Montserrat,sans-serif] font-black text-lg text-slate-900">
                Stunting Risk Insights
              </span>
            </div>
            <span
              className="self-start font-[Montserrat,sans-serif] font-bold text-xs px-2.5 py-1 rounded-full"
              style={{ background: config.badgeBg, color: config.badgeText, border: `1px solid ${config.badgeBorder}` }}
            >
              {config.label} · {stuntingPct}%
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors border-none bg-transparent cursor-pointer flex-shrink-0 ml-4"
          >
            <IconClose />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <SectionBlock
            title="🔍 Mengapa kategori ini?"
            items={config.insights.reason}
            dotColor="#628141"
          />
          <div className="border-t border-slate-100" />
          <SectionBlock
            title="⚡ Dampak jika tidak ditangani"
            items={config.insights.impact}
            dotColor={category === 'low' ? '#059669' : category === 'moderate' ? '#d97706' : '#dc2626'}
          />
          <div className="border-t border-slate-100" />
          <SectionBlock
            title="🛡️ Langkah preventif"
            items={config.insights.prevention}
            dotColor="#3b82f6"
          />
          <p className="font-[Montserrat,sans-serif] font-normal text-[11px] text-slate-400 leading-5 m-0 border-t border-slate-100 pt-4">
            * Informasi ini berdasarkan standar WHO Child Growth Standards. Konsultasikan dengan dokter anak untuk diagnosis dan penanganan medis yang tepat.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Section 2: Key Stats Cards ───────────────────────────────────────────────
const StatCard = ({ icon, label, value, unit, delta, deltaUp, sub, bp }: {
  icon: React.ReactNode; label: string; value: string; unit: string
  delta?: string; deltaUp?: boolean; sub: string; bp?: 'mobile' | 'tablet' | 'desktop'
}) => {
  const isTablet = bp === 'tablet'
  return (
    <div className="bg-white relative rounded-lg flex-1 min-w-0 border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-3 items-start p-[25px] w-full box-border">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-shrink-0">{icon}</div>
          <span className={`font-[Montserrat,sans-serif] font-semibold uppercase text-slate-600 leading-5 ${isTablet ? 'text-[10px] tracking-[0.5px]' : 'text-sm tracking-[0.7px]'}`}>{label}</span>
        </div>
        <div className="relative w-full h-9">
          <span className={`font-[Montserrat,sans-serif] font-black text-slate-900 leading-9 absolute left-0 top-1/2 -translate-y-1/2 ${isTablet ? 'text-[24px]' : 'text-[30px]'}`}>
            {value} <span className={isTablet ? 'text-lg' : 'text-2xl'}>{unit}</span>
          </span>
          {delta && (
            <span className="absolute flex items-center gap-[3px] right-0 top-1/2 -translate-y-1/2">
              {deltaUp ? <IconTrendUp /> : <IconTrendDown />}
              <span className={`font-[Montserrat,sans-serif] font-bold leading-5 ${deltaUp ? 'text-emerald-600' : 'text-red-500'} ${isTablet ? 'text-xs' : 'text-sm'}`}>{delta}</span>
            </span>
          )}
        </div>
        <span className="font-[Montserrat,sans-serif] font-normal text-xs text-slate-400 leading-4">{sub}</span>
      </div>
    </div>
  )
}

// ─── Stunting Card (clickable, pastel background by category) ─────────────────
const StuntingCard = ({ 
  stuntingValue, stuntingSub, stuntingPct, bp, aiLabel 
}: { 
  stuntingValue: string; stuntingSub: string; stuntingPct: number; bp: 'mobile' | 'tablet' | 'desktop'; aiLabel?: string | null
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const isTablet = bp === 'tablet'

  const category = getStuntingCategory(stuntingPct, aiLabel)
  const config    = STUNTING_CONFIG[category]

  return (
    <>
      <div
        className="relative rounded-lg flex-1 min-w-0 shadow-sm overflow-hidden"
        style={{ background: config.bgColor, border: `1px solid ${config.borderColor}` }}
      >
        <div className="flex flex-col gap-3 items-start p-[25px] w-full box-border">
          {/* Header row */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex-shrink-0"><IconStuntingSvg /></div>
            <span className={`font-[Montserrat,sans-serif] font-semibold uppercase text-slate-600 leading-5 ${isTablet ? 'text-[10px] tracking-[0.5px]' : 'text-sm tracking-[0.7px]'}`}>
              Stunting Status
            </span>
          </div>

          {/* Value row */}
          <div className="relative w-full h-9">
            <span className={`font-[Montserrat,sans-serif] font-black leading-9 absolute left-0 top-1/2 -translate-y-1/2 ${isTablet ? 'text-[24px]' : 'text-[30px]'}`}
              style={{ color: config.badgeText }}
            >
              {stuntingValue}
            </span>
            {/* Details button */}
            <button
              onClick={() => setModalOpen(true)}
              className="absolute flex items-center right-0 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer group"
              title="Lihat Detail Insight Stunting"
            >
              <span
                className={`font-[Montserrat,sans-serif] font-bold flex items-center gap-1.5 transition-all active:scale-95
                  ${isTablet ? 'text-[12px] px-3 py-1.5' : 'text-[13px] px-4 py-2'} 
                  rounded-full shadow-sm hover:shadow-md`}
                style={{ 
                  background: config.badgeBg, 
                  color: config.badgeText, 
                  border: `1.5px solid ${config.badgeBorder}`,
                  backdropFilter: 'blur(4px)' 
                }}
              >
                Details
                <span className="text-[14px] leading-none group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </button>
          </div>

          {/* Sub label */}
          <span
            className="font-[Montserrat,sans-serif] font-semibold text-xs leading-4"
            style={{ color: config.badgeText }}
          >
            {config.icon} {stuntingSub}
          </span>
        </div>
      </div>

      <StuntingInsightModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        stuntingPct={stuntingPct}
      />
    </>
  )
}

const KeyStatsSection = ({
  bp, height, weight, lastUpdated, measurements
}: {
  bp: 'mobile' | 'tablet' | 'desktop'
  height: string; weight: string; lastUpdated: string; measurements: Measurement[]
}) => {
  // Derive dynamic stunting risk from latest measurement
  let stuntingValue = "Unknown"
  let stuntingSub = "No data yet"
  let stuntingPct = 50 // default/neutral for modal
  let aiLabel: string | null = null

  if (measurements.length > 0) {
    const last = measurements[0]
    aiLabel = last.risikoStuntingMl
    if (last.risikoStuntingMl) {
      stuntingValue = last.risikoStuntingMl
      stuntingSub = last.mlConfidence ? `${last.mlConfidence.toFixed(1)}% confidence` : "Analyzing..."
      stuntingPct = last.mlConfidence ?? 50
    } else {
      const pNum = extractPercentileNumber(last.heightPct)
      stuntingPct = pNum ?? 50
      if (pNum !== null) {
        if (pNum <= 3) {
          stuntingValue = "High"
          stuntingSub = "Monitor closely"
        } else if (pNum <= 10) {
          stuntingValue = "Moderate"
          stuntingSub = "Need attention"
        } else {
          stuntingValue = "Low"
          stuntingSub = "Safe"
        }
      }
    }
  }

  return (
    <div className={`w-full mb-8 grid gap-6 ${bp === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
      <StatCard icon={<IconHeightSvg />} label="Current Height" value={height} unit="cm" delta="" deltaUp={true} sub={lastUpdated} bp={bp} />
      <StatCard icon={<IconWeightSvg />} label="Current Weight" value={weight} unit="kg" delta="" deltaUp={true} sub={lastUpdated} bp={bp} />
      <StuntingCard stuntingValue={stuntingValue} stuntingSub={stuntingSub} stuntingPct={stuntingPct} aiLabel={aiLabel} bp={bp} />
    </div>
  )
}

// ─── Chart Legend ─────────────────────────────────────────────────────────────
const ChartLegend = ({ items }: { items: { color: string; dash?: boolean; isArea?: boolean; label: string }[] }) => (
  <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
    {items.map(item => (
      <div key={item.label} className="flex items-center gap-1.5">
        {item.isArea ? (
          <div className="w-6 h-2.5 rounded-sm" style={{ background: item.color }} />
        ) : item.dash ? (
          <div style={{ width: 20, height: 0, borderTop: `2px dashed ${item.color}` }} />
        ) : (
          <div className="w-5 h-0.5 rounded" style={{ background: item.color }} />
        )}
        <span className="font-[Montserrat,sans-serif] font-normal text-[11px] text-slate-500">{item.label}</span>
      </div>
    ))}
  </div>
)

// ─── Chart Modal ──────────────────────────────────────────────────────────────
type ChartModalProps = {
  open: boolean; onClose: () => void; title: string; subtitle?: string
  children: React.ReactNode; legendItems: { color: string; dash?: boolean; isArea?: boolean; label: string }[]
}

const ChartModal = ({ open, onClose, title, subtitle, children, legendItems }: ChartModalProps) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="font-[Montserrat,sans-serif] font-bold text-xl text-slate-900">{title}</span>
            {subtitle && <span className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-500">{subtitle}</span>}
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer flex-shrink-0 ml-4"><IconClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="h-[360px] sm:h-[420px] w-full">{children}</div>
          <ChartLegend items={legendItems} />
        </div>
      </div>
    </div>
  )
}

// ─── Section 3: BMI Chart ─────────────────────────────────────────────────────
const BmiChart = ({
  bp, data, childName,
}: {
  bp: 'mobile' | 'tablet' | 'desktop'
  data: { age: string; child: number; p50?: number }[]
  childName: string
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const lastLabel = data.length > 0 ? String(data[data.length - 1].child) : ''
  const dotFn = makeLineDot(data, lastLabel)
  const isMobile = bp === 'mobile'
  const legendItems = [
    { color: '#3f6212', label: `${childName}'s BMI` },
    { color: '#cbd5e1', dash: true, label: 'WHO Median' },
    { color: 'rgba(98,129,65,0.2)', isArea: true, label: 'WHO Normal Range' },
  ]
  const chartContent = (_height: number) => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 24, right: 42, left: 0, bottom: 10 }}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeWidth={1} />
        <XAxis dataKey="age" tick={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 10, fill: '#cbd5e1' }} axisLine={false} tickLine={false} domain={[11, 20]} />
        <Tooltip content={<BmiTooltip />} cursor={{ stroke: '#628141', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey="p25" stackId="band" fill="transparent" stroke="none" dot={false} activeDot={false} />
        <Area type="monotone" dataKey="band" stackId="band" fill="rgba(98,129,65,0.08)" stroke="none" dot={false} activeDot={false} />
        <Line type="monotone" dataKey="p50" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} />
        <Line type="monotone" dataKey="leo" stroke="#3f6212" strokeWidth={3} dot={dotFn as any} activeDot={{ r: 6, fill: '#3f6212', stroke: 'white', strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
  return (
    <>
      <div className="bg-white relative rounded-lg border border-slate-100 shadow-sm p-[25px] pb-[20px]">
        <div className={`flex items-start w-full mb-4 ${isMobile ? 'flex-col gap-3' : 'flex-row justify-between'}`}>
          <div className="flex flex-col gap-0.5">
            <span className="font-[Montserrat,sans-serif] font-bold text-lg text-slate-900 leading-7">Growth Tracker (BMI)</span>
            <span className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-500 leading-5">World Health Organization Standard Reference</span>
          </div>
          <button className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-lg transition-colors hover:bg-slate-100 bg-transparent border-none flex-shrink-0 ${isMobile ? 'self-end' : ''}`} onClick={() => setModalOpen(true)} title="Expand chart"><IconExpand /></button>
        </div>
        <div className="w-full" style={{ marginLeft: '-25px', marginRight: '-25px', width: 'calc(100% + 50px)' }}>
          <div className={`w-full ${isMobile ? 'h-[180px]' : 'h-[300px]'}`}>{chartContent(isMobile ? 180 : 300)}</div>
        </div>
        <ChartLegend items={legendItems} />
      </div>
      <ChartModal open={modalOpen} onClose={() => setModalOpen(false)} title="Growth Tracker (BMI)" subtitle="World Health Organization Standard Reference" legendItems={legendItems}>
        {chartContent(420)}
      </ChartModal>
    </>
  )
}

const GrowthChartSection = ({
  bp, bmiData, childName,
}: {
  bp: 'mobile' | 'tablet' | 'desktop'
  bmiData: { age: string; child: number; p50?: number }[]
  childName: string
}) => (
  <div className="w-full mb-8"><BmiChart bp={bp} data={bmiData} childName={childName} /></div>
)

// ─── Section 4: Sub-charts ────────────────────────────────────────────────────
const SmallChart = ({ title, data, lastLabel, bp, unit }: { title: string; data: any[]; lastLabel: string; bp: 'mobile' | 'tablet' | 'desktop'; unit: string }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const dotFn = makeLineDot(data, lastLabel)
  const isMobile = bp === 'mobile'
  const legendItems = [
    { color: '#3f6212', label: 'Your Child' },
  ]
  const chartContent = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 22, right: 42, left: 0, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeWidth={1} />
        <XAxis dataKey="age" tick={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 10, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChildTooltip unit={unit} />} cursor={{ stroke: '#628141', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Line type="monotone" dataKey="median" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth={1.5} dot={false} activeDot={false} />
        <Line type="monotone" dataKey="child" stroke="#3f6212" strokeWidth={2.5} dot={dotFn as any} activeDot={{ r: 5, fill: '#3f6212', stroke: 'white', strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
  return (
    <>
      <div className="bg-white relative rounded-lg border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-[Montserrat,sans-serif] font-bold text-base text-slate-900 leading-6">{title}</span>
          <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-lg transition-colors hover:bg-slate-100 bg-transparent border-none" onClick={() => setModalOpen(true)} title="Expand chart"><IconExpand /></button>
        </div>
        <div className={`w-full ${isMobile ? 'h-[180px]' : 'h-[210px]'}`}>{chartContent()}</div>
        <ChartLegend items={legendItems} />
      </div>
      <ChartModal open={modalOpen} onClose={() => setModalOpen(false)} title={title} subtitle="World Health Organization Standard Reference" legendItems={legendItems}>
        {chartContent()}
      </ChartModal>
    </>
  )
}

const SubChartsSection = ({
  bp, heightData, weightData,
}: {
  bp: 'mobile' | 'tablet' | 'desktop'
  heightData: { age: string; child: number }[]
  weightData: { age: string; child: number }[]
}) => (
  <div className={`w-full mb-8 grid gap-6 ${bp === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
    <SmallChart title="Height for Age" data={heightData} lastLabel={heightData.length > 0 ? String(heightData[heightData.length-1].child) : ''} bp={bp} unit="cm" />
    <SmallChart title="Weight for Age" data={weightData} lastLabel={weightData.length > 0 ? String(weightData[weightData.length-1].child) : ''} bp={bp} unit="kg" />
  </div>
)

// ─── Measurements Table ───────────────────────────────────────────────────────
const MeasurementsTable = ({
  data, isMobile, onEdit, onDelete,
}: {
  data: Measurement[]
  isMobile: boolean
  onEdit?: (index: number) => void
  onDelete?: (index: number) => void
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse" style={{ minWidth: onEdit ? '560px' : '480px' }}>
      <thead>
        <tr className="border-b border-slate-100">
          {['Date', 'Age', 'Height', 'Weight', 'Percentile (H)', 'Percentile (W)', ...(onEdit ? ['Actions'] : [])].map(col => (
            <th key={col} className="font-[Montserrat,sans-serif] font-bold text-[10px] uppercase tracking-[0.5px] text-slate-500 pb-3 whitespace-nowrap text-center px-2">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="transition-colors hover:bg-slate-50" style={{ borderBottom: i < data.length - 1 ? '1px solid #f8fafc' : 'none' }}>
            <td className={`py-3 px-2 font-[Montserrat,sans-serif] font-medium text-slate-600 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.date}</td>
            <td className={`py-3 px-2 font-[Montserrat,sans-serif] font-medium text-slate-600 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.age}</td>
            <td className={`py-3 px-2 font-[Montserrat,sans-serif] font-bold text-slate-900 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.height}</td>
            <td className={`py-3 px-2 font-[Montserrat,sans-serif] font-bold text-slate-900 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>{row.weight}</td>
            <td className="py-3 px-2 text-center">
              <span className="font-[Montserrat,sans-serif] font-bold text-[10px] text-[#628141] bg-[rgba(98,129,65,0.1)] py-[3px] px-[8px] rounded-full whitespace-nowrap">{row.heightPct}</span>
            </td>
            <td className="py-3 px-2 text-center">
              <span className="font-[Montserrat,sans-serif] font-bold text-[10px] text-[#3f6212] bg-[#ddecc5] py-[3px] px-[8px] rounded-full whitespace-nowrap">{row.weightPct}</span>
            </td>
            {onEdit && (
              <td className="py-3 px-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(i)}
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
            <td colSpan={onEdit ? 7 : 6} className="py-8 text-center font-[Montserrat,sans-serif] text-sm text-slate-400">
              No measurements recorded yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

// ─── Measurements Full Modal ──────────────────────────────────────────────────
const MeasurementsModal = ({
  open, onClose, measurements, onEdit, onDelete,
}: {
  open: boolean; onClose: () => void
  measurements: Measurement[]
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="font-[Montserrat,sans-serif] font-bold text-xl text-slate-900">All Measurements</span>
            <span className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-500">Complete growth history for Leo</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer flex-shrink-0 ml-4"><IconClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <MeasurementsTable data={measurements} isMobile={false} onEdit={(i) => { onEdit(i); onClose() }} onDelete={onDelete} />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <span className="font-[Montserrat,sans-serif] text-sm text-slate-400">{measurements.length} records total</span>
          <button onClick={onClose} className="font-[Montserrat,sans-serif] font-bold text-sm text-white bg-[#628141] hover:bg-[#3f6212] transition-colors px-5 py-2 rounded-lg border-none cursor-pointer">Close</button>
        </div>
      </div>
    </div>
  )
}

// ─── Section 5: Recent Measurements Table ────────────────────────────────────
const RecentMeasurementsSection = ({
  bp, measurements, onEdit, onDelete,
}: {
  bp: 'mobile' | 'tablet' | 'desktop'
  measurements: Measurement[]
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const isMobile = bp === 'mobile'
  const previewData = measurements.slice(0, 3)

  return (
    <>
      <div className={`bg-white relative rounded-lg w-full border border-slate-100 shadow-sm ${isMobile ? 'px-4 py-5' : 'p-[25px]'}`}>
        <div className="flex items-center justify-between mb-5">
          <span className="font-[Montserrat,sans-serif] font-bold text-lg text-slate-900 leading-7">Recent Measurements</span>
          <button className="font-[Montserrat,sans-serif] font-semibold text-sm text-[#628141] hover:text-[#3f6212] bg-transparent border-none cursor-pointer p-0 transition-colors" onClick={() => setModalOpen(true)}>
            View All
          </button>
        </div>
        <MeasurementsTable data={previewData} isMobile={isMobile} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <MeasurementsModal open={modalOpen} onClose={() => setModalOpen(false)} measurements={measurements} onEdit={onEdit} onDelete={onDelete} />
    </>
  )
}

// ─── Save Notification Banner ─────────────────────────────────────────────────
const SaveNotification = ({ saveStatus }: { saveStatus: SaveStatus }) => {
  if (saveStatus !== 'success' && saveStatus !== 'error') return null
  const isSuccess = saveStatus === 'success'
  return (
    <div className="flex items-center gap-2.5 px-5 py-3 rounded-full flex-shrink-0 shadow-md" style={{ background: isSuccess ? '#628141' : '#ef4444' }}>
      <div className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-white flex-shrink-0">
        {isSuccess ? (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="#628141" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" /></svg>
        )}
      </div>
      <span className="font-[Montserrat,sans-serif] font-semibold text-[15px] text-white whitespace-nowrap">
        {isSuccess ? 'Data saved!' : 'Failed to save data!'}
      </span>
    </div>
  )
}

// ─── Page Title Section ───────────────────────────────────────────────────────
const PageTitleSection = ({ bp, saveStatus }: { bp: 'mobile' | 'tablet' | 'desktop'; saveStatus: SaveStatus }) => {
  const isMobile = bp === 'mobile'
  return (
    <div className={`flex w-full mb-8 gap-4 ${isMobile ? 'flex-col items-start' : 'flex-row items-end justify-between'}`}>
      <div className="flex flex-col gap-1">
        <h1 className={`font-[Montserrat,sans-serif] font-black text-slate-900 tracking-[-0.9px] leading-10 m-0 ${isMobile ? 'text-[28px]' : 'text-[36px]'}`}>
          Growth Tracker
        </h1>
        <p className="font-[Montserrat,sans-serif] font-normal text-lg text-slate-500 m-0 leading-7">
          Pantau tumbuh kembang anak berdasarkan standar WHO.
        </p>
      </div>
      <SaveNotification saveStatus={saveStatus} />
    </div>
  )
}

// ─── Add Child Modal ──────────────────────────────────────────────────────────
const AddChildModal = ({
  open, onClose, onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: (child: { id: number; namaDepan: string; namaAkhir: string | null }) => void
}) => {
  const [namaDepan, setNamaDepan] = useState('')
  const [namaAkhir, setNamaAkhir] = useState('')
  const [tgl, setTgl] = useState('')
  const [jk, setJk] = useState<'LAKI_LAKI' | 'PEREMPUAN'>('LAKI_LAKI')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSave = async () => {
    if (!namaDepan.trim() || !tgl) { setErr('Nama dan tanggal lahir wajib diisi.'); return }
    setSaving(true); setErr('')
    try {
      const child = await childrenService.create({
        namaDepan: namaDepan.trim(),
        namaAkhir: namaAkhir.trim() || undefined,
        tanggalLahir: tgl,
        jenisKelamin: jk,
      })
      onSaved(child)
      onClose()
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message ?? 'Gagal menyimpan. Coba lagi.'
      setErr(msg)
    }
    finally { setSaving(false) }
  }

  useEffect(() => {
    if (!open) { setNamaDepan(''); setNamaAkhir(''); setTgl(''); setJk('LAKI_LAKI'); setErr('') }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 18, color: '#1e293b', margin: '0 0 20px' }}>Tambah Anak Baru</h2>
        {err && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{err}</p>}
        {[
          { label: 'Nama Depan *', val: namaDepan, set: setNamaDepan, type: 'text' },
          { label: 'Nama Belakang', val: namaAkhir, set: setNamaAkhir, type: 'text' },
          { label: 'Tanggal Lahir *', val: tgl, set: setTgl, type: 'date' },
        ].map(({ label, val, set, type }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 12, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
            <input
              type={type} value={val} onChange={e => set(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontFamily: 'Montserrat,sans-serif', fontSize: 14, outline: 'none' }}
            />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 12, color: '#475569', display: 'block', marginBottom: 6 }}>Jenis Kelamin *</label>
          <select value={jk} onChange={e => setJk(e.target.value as 'LAKI_LAKI' | 'PEREMPUAN')}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontFamily: 'Montserrat,sans-serif', fontSize: 14, outline: 'none', background: '#fff' }}>
            <option value="LAKI_LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSave} disabled={saving} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', background: '#628141', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main GrowthTracker Component ─────────────────────────────────────────────
const GrowthTracker = () => {
  const bp = useBreakpoint()

  // ── Children state ──
  const [children, setChildren] = useState<{ id: number; namaDepan: string; namaAkhir: string | null; tanggalLahir: string; jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN' }[]>([])
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  const [childrenLoading, setChildrenLoading] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)

  // ── Chart / stats data ──
  const [bmiData, setBmiData] = useState<{ age: string; child: number; p50?: number }[]>([])
  const [heightData, setHeightData] = useState<{ age: string; child: number }[]>([])
  const [weightData, setWeightData] = useState<{ age: string; child: number }[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [latestHeight, setLatestHeight] = useState('—')
  const [latestWeight, setLatestWeight] = useState('—')
  const [lastUpdated, setLastUpdated] = useState('')
  const [chartsLoading, setChartsLoading] = useState(false)

  // ── Form state ──
  const [heightVal, setHeightVal] = useState('')
  const [weightVal, setWeightVal] = useState('')
  const today = new Date()
  const [dateVal, setDateVal] = useState(
    `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`
  )
  const [heightError, setHeightError] = useState<string | undefined>()
  const [weightError, setWeightError] = useState<string | undefined>()
  const [dateError,   setDateError]   = useState<string | undefined>()
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  // ── Load children on mount ──
  useEffect(() => {
    childrenService.getAll()
      .then(data => {
        setChildren(data)
        if (data.length > 0) setSelectedChildId(data[0].id)
      })
      .catch(() => {})
      .finally(() => setChildrenLoading(false))
  }, [])

  // ── Load charts when selected child changes ──
  useEffect(() => {
    if (!selectedChildId) return
    let cancelled = false
    setChartsLoading(true)

    Promise.all([
      childrenService.getLatestGrowth(selectedChildId),
      childrenService.getBmiChart(selectedChildId),
      childrenService.getPercentile(selectedChildId),
    ]).then(([latest, bmi, percentile]) => {
      if (cancelled) return
      if (latest) {
        setLatestHeight(parseFloat(String(latest.tinggiBadan)).toFixed(1))
        setLatestWeight(parseFloat(String(latest.beratBadan)).toFixed(1))
        const d = new Date(latest.tanggalCatat)
        setLastUpdated(`Updated ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`)
      } else {
        setLatestHeight('—'); setLatestWeight('—'); setLastUpdated('No data yet')
      }
      setBmiData(transformBmiChartData(bmi))
      setHeightData(transformToSubChartData(percentile, 'height'))
      setWeightData(transformToSubChartData(percentile, 'weight'))
      setMeasurements(transformPercentileToMeasurements(percentile))
    }).catch(() => {}).finally(() => { if (!cancelled) setChartsLoading(false) })

    return () => { cancelled = true }
  }, [selectedChildId])

  const selectedChild = children.find(c => c.id === selectedChildId)
  const childName = selectedChild ? `${selectedChild.namaDepan}${selectedChild.namaAkhir ? ' ' + selectedChild.namaAkhir : ''}` : 'Anak'

  const handleEdit = (index: number) => {
    const row = measurements[index]
    setHeightVal(row.height.replace(' cm', ''))
    setWeightVal(row.weight.replace(' kg', ''))
    setHeightError(undefined); setWeightError(undefined); setDateError(undefined)
    setEditIndex(index); setSaveStatus('idle')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const handleDelete = async (index: number) => {
    const recordId = measurements[index].id
    if (!confirm('Are you sure you want to delete this measurement?')) return
    
    try {
      await childrenService.deleteGrowthRecord(recordId)
      setMeasurements(prev => prev.filter((_, i) => i !== index))
      if (editIndex === index) handleCancelEdit()
      else if (editIndex !== null && index < editIndex) setEditIndex(editIndex - 1)
      
      // Refresh charts after delete
      if (selectedChildId) {
        const [latest, bmi, percentile] = await Promise.all([
          childrenService.getLatestGrowth(selectedChildId),
          childrenService.getBmiChart(selectedChildId),
          childrenService.getPercentile(selectedChildId),
        ])
        if (latest) {
          setLatestHeight(parseFloat(String(latest.tinggiBadan)).toFixed(1))
          setLatestWeight(parseFloat(String(latest.beratBadan)).toFixed(1))
          const d = new Date(latest.tanggalCatat)
          setLastUpdated(`Updated ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`)
        } else {
          setLatestHeight('—'); setLatestWeight('—'); setLastUpdated('No data yet')
        }
        setBmiData(transformBmiChartData(bmi))
        setHeightData(transformToSubChartData(percentile, 'height'))
        setWeightData(transformToSubChartData(percentile, 'weight'))
        setMeasurements(transformPercentileToMeasurements(percentile))
      }
    } catch (err) {
      alert('Failed to delete measurement')
    }
  }

  const handleCancelEdit = () => {
    setEditIndex(null)
    setHeightVal(''); setWeightVal('')
    setHeightError(undefined); setWeightError(undefined); setDateError(undefined)
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    const errors = validateInputs(heightVal, weightVal, dateVal)
    setHeightError(errors.height); setWeightError(errors.weight); setDateError(errors.date)
    if (Object.keys(errors).length > 0) return
    if (!selectedChildId) return

    const [dd, mm, yyyy] = dateVal.split('/')
    const isoDate = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
    
    setSaving(true)
    try {
      if (editIndex !== null) {
        const recordId = measurements[editIndex].id
        await childrenService.updateGrowthRecord(recordId, {
          tinggiBadan: parseFloat(heightVal),
          beratBadan:  parseFloat(weightVal),
          tanggalCatat: isoDate,
        })
      } else {
        await childrenService.createGrowthRecord(selectedChildId, {
          tinggiBadan: parseFloat(heightVal),
          beratBadan:  parseFloat(weightVal),
          tanggalCatat: isoDate,
        })
      }

      // Refresh charts
      const [latest, bmi, percentile] = await Promise.all([
        childrenService.getLatestGrowth(selectedChildId),
        childrenService.getBmiChart(selectedChildId),
        childrenService.getPercentile(selectedChildId),
      ])
      if (latest) {
        setLatestHeight(parseFloat(String(latest.tinggiBadan)).toFixed(1))
        setLatestWeight(parseFloat(String(latest.beratBadan)).toFixed(1))
        const d = new Date(latest.tanggalCatat)
        setLastUpdated(`Updated ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`)
      }
      setBmiData(transformBmiChartData(bmi))
      setHeightData(transformToSubChartData(percentile, 'height'))
      setWeightData(transformToSubChartData(percentile, 'weight'))
      setMeasurements(transformPercentileToMeasurements(percentile))

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2500)
      handleCancelEdit()
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } finally {
      setSaving(false)
    }
  }

  const getPaddingInline = () => {
    if (bp === 'mobile') return '16px'
    if (bp === 'tablet') return '28px'
    return 'clamp(24px, 3.5vw, 60px)'
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 font-[Montserrat,sans-serif]">
      <div
        className="mx-auto box-border"
        style={{
          maxWidth: '1200px',
          paddingInline: getPaddingInline(),
          paddingTop:    bp === 'mobile' ? '28px' : '40px',
          paddingBottom: bp === 'mobile' ? '40px' : '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <PageTitleSection bp={bp} saveStatus={saveStatus} />
          <button
            onClick={() => setShowAddChild(true)}
            style={{
              fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13,
              padding: '8px 18px', borderRadius: 999,
              border: '2px dashed #cbd5e1', background: 'transparent',
              color: '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            + Tambah Anak
          </button>
        </div>

        {!selectedChildId && !childrenLoading && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#78716c', fontFamily: 'Montserrat,sans-serif' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👶</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 6 }}>Belum ada data anak</p>
            <p style={{ fontSize: 13 }}>Klik "+ Tambah Anak" untuk mulai melacak pertumbuhan.</p>
          </div>
        )}

        {selectedChildId && (
          <>
            <div ref={formRef}>
              <LogNewGrowthSection
                bp={bp}
                heightVal={heightVal} setHeightVal={(v) => { setHeightVal(v); if (heightError) setHeightError(undefined) }}
                weightVal={weightVal} setWeightVal={(v) => { setWeightVal(v); if (weightError) setWeightError(undefined) }}
                dateVal={dateVal}     setDateVal={(v) => { setDateVal(v); if (dateError) setDateError(undefined) }}
                onSave={handleSave}
                heightError={heightError}
                weightError={weightError}
                dateError={dateError}
                editIndex={editIndex}
                onCancelEdit={handleCancelEdit}
                children={children}
                selectedChildId={selectedChildId}
                onSelectChild={setSelectedChildId}
                saving={saving}
              />
            </div>
            {chartsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontFamily: 'Montserrat,sans-serif' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #628141', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, margin: 0 }}>Memuat data pertumbuhan...</p>
              </div>
            ) : (
              <>
                <KeyStatsSection
                  bp={bp}
                  height={latestHeight}
                  weight={latestWeight}
                  measurements={measurements}
                  lastUpdated={lastUpdated}
                />
                <GrowthChartSection bp={bp} bmiData={bmiData} childName={childName} />
                <SubChartsSection bp={bp} heightData={heightData} weightData={weightData} />
                <RecentMeasurementsSection bp={bp} measurements={measurements} onEdit={handleEdit} onDelete={handleDelete} />
              </>
            )}
          </>
        )}

        <AddChildModal
          open={showAddChild}
          onClose={() => setShowAddChild(false)}
          onSaved={(child) => {
            setChildren(prev => [...prev, child as any])
            setSelectedChildId(child.id)
          }}
        />
      </div>
    </div>
  )
}

export default GrowthTracker