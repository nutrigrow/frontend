import { apiClient } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiHealthLog {
  id: number
  user_id: number
  date: string
  day: string
  profile_type: 'teen' | 'pregnant' | 'breastfeeding'
  water_glasses: number
  sleep_hours: number
  took_supplement: boolean
  mood: number
  is_menstruating?: boolean
  weight_kg?: number
  breastfeeding_count?: number
  created_at?: string
  updated_at?: string
}

export type InsightCategory =
  | 'Segera Konsultasi'
  | 'Perlu Diperhatikan'
  | 'Cek Data'
  | 'Pengingat'
  | 'Perkembangan Baik'

export type InsightStatus = 'safe' | 'caution' | 'danger' | 'info'
export type InsightActionType = 'consult' | 'article' | 'log' | 'history'
export type InsightHistoryState = 'ok' | 'flag' | 'missing'

export interface InsightHistoryItem {
  date: string
  label: string
  value: string
  state: InsightHistoryState
}

export interface InsightDetail {
  title: string
  pattern_summary: string
  period: string
  data_used: string[]
  history: InsightHistoryItem[]
  reason: string
  action_text: string
  disclaimer: string
}

export interface ContextualInsight {
  id: string
  fields: string[]
  category: InsightCategory
  status: InsightStatus
  title: string
  message: string
  based_on: string[]
  action: { type: InsightActionType; label: string }
  disclaimer: string
  detail: InsightDetail
}

export type InsightFieldKey =
  | 'sleep'
  | 'hydration'
  | 'mood'
  | 'supplement'
  | 'cycle'
  | 'weight'
  | 'breastfeeding'

export interface InsightResponse {
  has_log_today: boolean
  date?: string
  day?: string
  profile_type?: 'teen' | 'pregnant' | 'breastfeeding'
  hydration_percent?: number
  water_glasses?: number
  hydration_target?: number
  sleep_percent?: number
  sleep_hours?: number
  supplement_taken?: boolean
  mood?: number
  insights: ContextualInsight[]
  field_insights: Partial<Record<InsightFieldKey, ContextualInsight>>
}

// ─── Period ───────────────────────────────────────────────────────────────────
export type FieldPeriod = 'week' | '15days' | 'month' | 'all' | 'custom'

// ─── Constants ────────────────────────────────────────────────────────────────
const MOOD_INT_TO_STR: Record<number, string> = {
  5: 'Bahagia',
  4: 'Nyaman',
  3: 'Biasa',
  2: 'Lelah',
  1: 'Sedih',
}

export const MOOD_STR_TO_INT: Record<string, number> = {
  bahagia: 5,
  nyaman: 4,
  biasa: 3,
  lelah: 2,
  sedih: 1,
}

/** Kebalikan MOOD_STR_TO_INT: dipakai saat mengisi ulang form dari data mentah. */
export const MOOD_INT_TO_KEY: Record<number, string> = {
  5: 'bahagia',
  4: 'nyaman',
  3: 'biasa',
  2: 'lelah',
  1: 'sedih',
}

export const CATEGORY_TO_PROFILE: Record<string, 'teen' | 'pregnant' | 'breastfeeding'> = {
  teenage: 'teen',
  pregnant: 'pregnant',
  breastfeeding: 'breastfeeding',
}

const HARI_ID: Record<string, string> = {
  Sunday: 'Min',
  Monday: 'Sen',
  Tuesday: 'Sel',
  Wednesday: 'Rab',
  Thursday: 'Kam',
  Friday: 'Jum',
  Saturday: 'Sab',
}

const BULAN_ID: Record<string, string> = {
  January: 'Januari',
  February: 'Februari',
  March: 'Maret',
  April: 'April',
  May: 'Mei',
  June: 'Juni',
  July: 'Juli',
  August: 'Agustus',
  September: 'September',
  October: 'Oktober',
  November: 'November',
  December: 'Desember',
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const pad2 = (n: number): string => String(n).padStart(2, '0')

/** Tanggal lokal perangkat dalam format YYYY-MM-DD (bukan UTC). */
export const getLocalISODate = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

/** YYYY-MM-DD -> DD/MM/YYYY */
export const isoToDDMMYYYY = (iso: string): string => {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

// ─── Form validation ──────────────────────────────────────────────────────────
export type LogFormCategory = 'teenage' | 'pregnant' | 'breastfeeding'

export interface LogFormInput {
  category: LogFormCategory
  /** DD/MM/YYYY */
  logDate: string
  fluid: string
  sleep: string
  momWeight: string
  nursingCount: string
}

export interface LogFormErrors {
  date?: string
  fluid?: string
  sleep?: string
  weight?: string
  nursing?: string
}

const parseNumber = (raw: string): number | null => {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

/**
 * Validasi form Log Entry. Fungsi murni: tidak membaca state komponen.
 * Mengembalikan objek kosong jika semua input valid.
 */
export const validateLogForm = (
  input: LogFormInput,
  todayIso: string = getLocalISODate(),
): LogFormErrors => {
  const errors: LogFormErrors = {}

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.logDate.trim())
  if (!match) {
    errors.date = 'Format tanggal tidak valid (DD/MM/YYYY).'
  } else {
    const [, dd, mm, yyyy] = match
    const probe = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)))
    const isRealDate =
      probe.getUTCFullYear() === Number(yyyy) &&
      probe.getUTCMonth() === Number(mm) - 1 &&
      probe.getUTCDate() === Number(dd)
    if (!isRealDate) errors.date = 'Tanggal tidak valid.'
    else if (`${yyyy}-${mm}-${dd}` > todayIso) {
      errors.date = 'Tanggal catatan kesehatan tidak boleh di masa depan.'
    }
  }

  const fluid = parseNumber(input.fluid)
  if (fluid === null || fluid < 0) errors.fluid = 'Masukkan jumlah gelas yang valid (contoh: 6).'
  else if (fluid > 20) errors.fluid = 'Jumlah cairan maksimal 20 gelas.'

  const sleep = parseNumber(input.sleep)
  if (sleep === null || sleep < 0) errors.sleep = 'Masukkan durasi tidur yang valid (contoh: 7.5).'
  else if (sleep > 24) errors.sleep = 'Durasi tidur maksimal 24 jam.'

  if (input.category === 'pregnant') {
    const weight = parseNumber(input.momWeight)
    if (weight === null || weight <= 0) errors.weight = 'Masukkan berat badan yang valid (contoh: 58.5).'
    else if (weight > 200) errors.weight = 'Berat badan maksimal 200 kg.'
  }

  if (input.category === 'breastfeeding') {
    const count = parseNumber(input.nursingCount)
    if (count === null || count < 0 || !Number.isInteger(count)) {
      errors.nursing = 'Masukkan jumlah sesi berupa bilangan bulat (contoh: 8).'
    } else if (count > 30) errors.nursing = 'Jumlah sesi maksimal 30.'
  }

  return errors
}

// ─── Transformers ─────────────────────────────────────────────────────────────
export const toISODate = (ddmmyyyy: string): string => {
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

export const mapLogToRow = (log: ApiHealthLog) => {
  const [y, mo, d] = log.date.split('-').map(Number)
  const dateObj = new Date(y, mo - 1, d)
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()]
  const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][dateObj.getMonth()]
  const dateStr = `${d} ${BULAN_ID[monthName] ?? monthName} ${y}`
  const dayFull = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  const supplementLabel =
    log.profile_type === 'teen'
      ? log.took_supplement
        ? '✓ TTD'
        : '✗ TTD'
      : log.profile_type === 'pregnant'
        ? log.took_supplement
          ? '✓ Suplemen'
          : '✗ Suplemen'
        : log.took_supplement
          ? '✓ Iron'
          : '✗ Iron'
  const specific =
    log.profile_type === 'teen'
      ? log.is_menstruating
        ? 'Sedang Haid'
        : 'Tidak Haid'
      : log.profile_type === 'pregnant'
        ? log.weight_kg != null
          ? `BB: ${log.weight_kg} Kg`
          : ''
        : log.breastfeeding_count != null
          ? `Pumping: ${log.breastfeeding_count} Sesi`
          : ''
  return {
    id: log.id,
    day: HARI_ID[dayName] ?? dayFull.slice(0, 3),
    date: dateStr,
    mood: MOOD_INT_TO_STR[log.mood] ?? 'Biasa',
    sleep: `${log.sleep_hours} jam`,
    fluid: `${log.water_glasses} Gelas`,
    supplement: supplementLabel,
    specific,
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const healthLogService = {
  getAllLogs: async (): Promise<ApiHealthLog[]> => {
    const { data } = await apiClient.get('/api/health-logs')
    return data.data as ApiHealthLog[]
  },

  getTodayLog: async (): Promise<ApiHealthLog | null> => {
    const { data } = await apiClient.get('/api/health-logs/today')
    return data.data as ApiHealthLog | null
  },

  getInsight: async (): Promise<InsightResponse> => {
    const { data } = await apiClient.get('/api/health-logs/insight')
    return {
      ...data.data,
      insights: data.data?.insights ?? [],
      field_insights: data.data?.field_insights ?? {},
    } as InsightResponse
  },

  getNotifications: async () => {
    const { data } = await apiClient.get('/api/health-logs/notifications')
    return data.data
  },

  createOrUpdate: async (payload: {
    date: string
    profile_type: 'teen' | 'pregnant' | 'breastfeeding'
    water_glasses: number
    sleep_hours: number
    took_supplement: boolean
    mood: number
    is_menstruating?: boolean
    weight_kg?: number
    breastfeeding_count?: number
    is_edit?: boolean
  }): Promise<ApiHealthLog> => {
    const { data } = await apiClient.post('/api/health-logs', payload)
    return data.data as ApiHealthLog
  },

  deleteLog: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/health-logs/${id}`)
  },
}