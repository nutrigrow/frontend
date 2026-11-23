import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { Plus, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────
import {
  healthLogService,
  mapLogToRow,
  MOOD_STR_TO_INT,
  CATEGORY_TO_PROFILE,
  toISODate,
  getLocalISODate,
  INSIGHT_DISCLAIMER,
  BREASTFEEDING_FLUID_TARGET_DEFAULT,
  getBreastfeedingFluidTarget,
  type ContextualInsight,
  type InsightActionType,
  type InsightCategory,
  type InsightFieldKey,
  type ApiHealthLog,
  type FieldPeriod,
} from '../services/healthLog.service'

type CategoryType = 'teenage' | 'pregnant' | 'breastfeeding'
type SaveStatus = 'idle' | 'success' | 'error'
type RoleType = 'teen' | 'pregnant' | 'breastfeeding'

type LogRow = {
  id?: number
  day: string
  date: string
  mood: string
  sleep: string
  fluid: string
  supplement: string
  specific: string
}

type StatusLevel = 'safe' | 'caution' | 'danger' | 'info'

// ─── Status Color Config ──────────────────────────────────────────────────────
const STATUS_COLORS: Record<StatusLevel, {
  bg: string
  border: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  accent: string
}> = {
  safe: { bg: '#E8F5E9', border: '#C8E6C9', badgeBg: '#F1F8E9', badgeText: '#2E7D32', badgeBorder: '#A5D6A7', accent: '#4CAF50' },
  caution: { bg: '#FFF8E1', border: '#FFE082', badgeBg: '#FFFDE7', badgeText: '#F57F17', badgeBorder: '#FFD54F', accent: '#FFA726' },
  danger: { bg: '#FFEBEE', border: '#FFCDD2', badgeBg: '#FFEBEE', badgeText: '#C62828', badgeBorder: '#EF9A9A', accent: '#EF5350' },
  info: { bg: '#E3F2FD', border: '#BBDEFB', badgeBg: '#E3F2FD', badgeText: '#1565C0', badgeBorder: '#90CAF9', accent: '#42A5F5' },
}

const CATEGORY_META: Record<CategoryType, { tab: string; badge: string }> = {
  teenage: { tab: 'Remaja', badge: 'REMAJA PUTRI' },
  pregnant: { tab: 'Ibu Hamil', badge: 'IBU HAMIL' },
  breastfeeding: { tab: 'Menyusui', badge: 'IBU MENYUSUI' },
}

// ─── Role-Aware Constants ─────────────────────────────────────────────────────
const PERIOD_LABELS: Record<FieldPeriod, string> = {
  week: '7 Hari Terakhir',
  '15days': '15 Hari Terakhir',
  month: '30 Hari Terakhir',
  all: 'Seluruh Riwayat',
  custom: 'Rentang Kustom',
}

const ROLE_LABELS: Record<RoleType, string> = {
  teen: 'Remaja Putri',
  pregnant: 'Ibu Hamil',
  breastfeeding: 'Ibu Menyusui',
}

const ROLE_SUPPLEMENT_LABEL: Record<RoleType, string> = {
  teen: 'Tablet Tambah Darah (TTD)',
  pregnant: 'Suplemen Kehamilan',
  breastfeeding: 'Suplemen Menyusui',
}

const ROLE_FLUID_TARGET: Record<RoleType, number> = {
  teen: 8,
  pregnant: 10,
  // Ibu menyusui: target sebenarnya mengikuti usia bayi (lihat getFluidTargets, CHI-05)
  breastfeeding: BREASTFEEDING_FLUID_TARGET_DEFAULT,
}

const ROLE_SLEEP_TARGET: Record<RoleType, number> = {
  teen: 8,
  pregnant: 8,
  breastfeeding: 7,
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

const PERIOD_DAYS: Record<'week' | '15days' | 'month', number> = { week: 7, '15days': 15, month: 30 }

const shiftISODate = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/**
 * Catatan pada periode terpilih, diurutkan dari yang terbaru.
 * "7 Hari Terakhir" = hari ini (WIB) + 6 hari sebelumnya, sehingga jumlah harinya tepat 7.
 */
const filterLogsByPeriod = (logs: ApiHealthLog[], period: FieldPeriod, customStart?: string, customEnd?: string): ApiHealthLog[] => {
  const newestFirst = [...logs].sort((a, b) => b.date.localeCompare(a.date))
  if (period === 'all') return newestFirst
  if (period === 'custom') {
    if (!customStart || !customEnd) return newestFirst
    return newestFirst.filter(l => l.date >= customStart && l.date <= customEnd)
  }
  const today = getLocalISODate()
  const cutoff = shiftISODate(today, -(PERIOD_DAYS[period] - 1))
  return newestFirst.filter(l => l.date >= cutoff && l.date <= today)
}

const periodText = (period: FieldPeriod, customStart?: string, customEnd?: string): string =>
  period === 'custom' ? `rentang ${customStart} s/d ${customEnd}` : PERIOD_LABELS[period]

// ─── Aksi & disclaimer bersama ────────────────────────────────────────────────
const CONSULT_ACTION: { type: InsightActionType; label: string } = { type: 'consult', label: 'Konsultasi via Tele-Consultation' }
const FIELD_DISCLAIMER = INSIGHT_DISCLAIMER

// ─── Anjuran Buku KIA 2024 (aturan SELARAS) ───────────────────────────────────
/** CHI-01: target 8 jam ibu hamil = tidur malam 6–7 jam + tidur siang 1–2 jam (hlm. PDF 6). */
const KIA_SLEEP_PREGNANT = 'tidur malam 6–7 jam dan tidur siang 1–2 jam'
/** CHI-04: target 10 gelas ibu hamil berada di dalam rentang KIA 8–12 gelas (hlm. PDF 5 dan 10). */
const KIA_FLUID_PREGNANT = 'minum air putih 8–12 gelas per hari'
/** CHI-07: batas ≥ 8 kali/hari sesuai anjuran menyusui 8–12 kali sehari atau lebih (hlm. PDF 19). */
const KIA_BREASTFEEDING = 'menyusui sesering mungkin, 8–12 kali sehari atau lebih'

// ─── Ambang hasil validasi Buku KIA 2024 (aturan PERLU DISESUAIKAN) ───────────
/** Mood 1–2 (Sedih, Lelah) dihitung negatif. Status "Lelah" menunggu konfirmasi stakeholder (CHI-17d). */
const NEGATIVE_MOOD_MAX = 2
/** CHI-17(c), CHI-21: Segera Konsultasi bila mood negatif tercatat terus-menerus selama 14 hari terakhir. */
const PERSISTENT_MOOD_DAYS = 14
/** CHI-15: batas "cukup" cairan ibu hamil = batas bawah KIA 8 gelas (hlm. PDF 5). Target kartu tetap 10 gelas. */
const PREGNANT_FLUID_MIN = 8
/** CHI-16, CHI-23: batas tidur rendah ibu hamil = tidur malam paling sedikit 6 jam (hlm. PDF 6). */
const PREGNANT_SLEEP_LOW = 6
/** CHI-21: mood negatif berulang disertai tidur < 6 jam → Segera Konsultasi. */
const SLEEP_URGENT_HOURS = 6
/** CHI-11: TTD/MMS ibu hamil setiap hari; toleransi paling banyak 1 hari terlewat per 7 hari (≥ 85%). */
const PREGNANT_SUPPLEMENT_GOOD_PCT = 85
/** CHI-12: TTD remaja putri 1 tablet setiap minggu; semua minggu pada periode harus terpenuhi. */
const TEEN_SUPPLEMENT_GOOD_PCT = 100
/** Ibu menyusui: ambang lama dipertahankan sampai keputusan CHI-13. */
const BREASTFEEDING_SUPPLEMENT_GOOD_PCT = 80
const BREASTFEEDING_SUPPLEMENT_LOW_PCT = 50
/** CHI-07, CHI-20: anjuran menyusui minimal 8 kali sehari. */
const BREASTFEEDING_MIN_SESSIONS = 8
/** CHI-20: perlakuan < 6 sesi (Segera Konsultasi, label "RENDAH") menunggu keputusan stakeholder. */
const BREASTFEEDING_LOW_SESSIONS = 6
/** CHI-11: tips minum TTD dari Buku KIA (hlm. PDF 4–5). */
const KIA_TTD_TIPS = 'minum TTD setiap hari, sebaiknya malam hari sebelum tidur untuk mengurangi mual, bersama makanan atau minuman yang mengandung vitamin C, dan tidak bersamaan dengan teh, kopi, susu, atau obat maag'
/** CHI-20: saran menyusui dari Buku KIA (hlm. PDF 19). */
const KIA_BREASTFEEDING_TIPS = 'Susui bayi sesering mungkin, 8–12 kali sehari atau lebih. Bila bayi tidur lebih dari 3 jam, bangunkan lalu susui.'
/** CHI-08: kebiasaan harian cukup sampai Perlu Diperhatikan, dengan saran bertanya ke bidan atau kader. */
const ASK_MIDWIFE = 'Bila sulit dipenuhi, tanyakan ke bidan atau kader posyandu.'

/** Target kartu dan batas "cukup" cairan per peran (CHI-04, CHI-05, CHI-15). */
const getFluidTargets = (role: RoleType, babyAgeMonths: number | null): { target: number; min: number } => {
  if (role === 'pregnant') return { target: ROLE_FLUID_TARGET.pregnant, min: PREGNANT_FLUID_MIN }
  if (role === 'breastfeeding') {
    const target = getBreastfeedingFluidTarget(babyAgeMonths)
    return { target, min: target }
  }
  // Remaja putri: target menunggu keputusan stakeholder (CHI-06)
  return { target: ROLE_FLUID_TARGET.teen, min: ROLE_FLUID_TARGET.teen }
}

/** Target tidur dan batas tidur rendah per peran (CHI-16, CHI-23). Peran selain ibu hamil memakai aturan lama (CHI-02, CHI-03). */
const getSleepThresholds = (role: RoleType): { target: number; low: number } => {
  const target = ROLE_SLEEP_TARGET[role]
  return { target, low: role === 'pregnant' ? PREGNANT_SLEEP_LOW : target - 1 }
}

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const historyLabel = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00Z')
  return `${HARI_ID[WEEKDAYS_EN[d.getUTCDay()]]}, ${iso}`
}

/** Selisih hari kalender dari `fromIso` ke `toIso` (YYYY-MM-DD). */
const dayDiff = (fromIso: string, toIso: string): number => {
  const [fy, fm, fd] = fromIso.split('-').map(Number)
  const [ty, tm, td] = toIso.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000)
}

/** Tanggal akhir periode: tanggal akhir rentang kustom, atau hari ini (WIB). */
const periodEndISO = (period: FieldPeriod, customStart?: string, customEnd?: string): string =>
  period === 'custom' && customStart && customEnd ? customEnd : getLocalISODate()

/**
 * CHI-17(c): true bila mood negatif tercatat setiap hari selama 14 hari berturut-turut,
 * berakhir pada catatan terbaru (paling lambat kemarin). Tidak bergantung pada periode yang dipilih.
 */
const hasPersistentNegativeMood = (roleLogs: ApiHealthLog[]): boolean => {
  if (roleLogs.length < PERSISTENT_MOOD_DAYS) return false
  const latest = roleLogs.reduce((max, l) => (l.date > max ? l.date : max), roleLogs[0].date)
  if (latest < shiftISODate(getLocalISODate(), -1)) return false
  const start = shiftISODate(latest, -(PERSISTENT_MOOD_DAYS - 1))
  const moodByDate = new Map<string, number>(roleLogs.map(l => [l.date, l.mood] as [string, number]))
  for (let i = 0; i < PERSISTENT_MOOD_DAYS; i++) {
    const mood = moodByDate.get(shiftISODate(start, i))
    if (mood === undefined || mood > NEGATIVE_MOOD_MAX) return false
  }
  return true
}

type SupplementCompliance = {
  /** Satuan hitung: harian (ibu hamil, ibu menyusui) atau mingguan (remaja putri, CHI-12) */
  unit: 'hari' | 'minggu'
  taken: number
  total: number
  pct: number
  /** Ambang Perkembangan Baik */
  goodPct: number
  /** Ambang insight gabungan "Suplemen Tidak Rutin" (G-04, CHI-22) */
  irregularPct: number
  /** Kalimat anjuran yang dipakai di teks insight */
  goalText: string
}

/**
 * Kepatuhan suplemen per peran (CHI-11, CHI-12, CHI-22).
 * Remaja putri dihitung per minggu: blok 7 hari mundur dari akhir periode; yang dihitung hanya
 * minggu yang memiliki catatan, sehingga minggu tanpa catatan tidak dianggap terlewat.
 */
const getSupplementCompliance = (logs: ApiHealthLog[], role: RoleType, endIso: string): SupplementCompliance => {
  if (role === 'teen') {
    const weeks = new Map<number, boolean>()
    logs.forEach(l => {
      const idx = Math.floor(dayDiff(l.date, endIso) / 7)
      weeks.set(idx, (weeks.get(idx) ?? false) || l.took_supplement)
    })
    const total = weeks.size
    const taken = Array.from(weeks.values()).filter(Boolean).length
    return {
      unit: 'minggu', taken, total,
      pct: total > 0 ? Math.round((taken / total) * 100) : 0,
      goodPct: TEEN_SUPPLEMENT_GOOD_PCT,
      irregularPct: TEEN_SUPPLEMENT_GOOD_PCT,
      goalText: 'minimal 1 tablet TTD setiap minggu',
    }
  }
  const total = logs.length
  const taken = logs.filter(l => l.took_supplement).length
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0
  if (role === 'pregnant') {
    return {
      unit: 'hari', taken, total, pct,
      goodPct: PREGNANT_SUPPLEMENT_GOOD_PCT,
      irregularPct: PREGNANT_SUPPLEMENT_GOOD_PCT,
      goalText: `setiap hari (paling banyak 1 hari terlewat per 7 hari, ≥ ${PREGNANT_SUPPLEMENT_GOOD_PCT}%)`,
    }
  }
  return {
    unit: 'hari', taken, total, pct,
    goodPct: BREASTFEEDING_SUPPLEMENT_GOOD_PCT,
    irregularPct: BREASTFEEDING_SUPPLEMENT_LOW_PCT,
    goalText: `minimal ${BREASTFEEDING_SUPPLEMENT_GOOD_PCT}% hari tercatat`,
  }
}

/**
 * Insight kartu field ketika periode terpilih belum memiliki catatan.
 * Tanpa ini, rata-rata 0 membuat kartu langsung berstatus "Segera Konsultasi".
 */
const emptyFieldInsight = (
  id: string,
  field: InsightFieldKey,
  label: string,
  period: FieldPeriod,
  customStart?: string,
  customEnd?: string,
): ContextualInsight => {
  const periodLabel = periodText(period, customStart, customEnd)
  const title = `Belum Ada Catatan ${label}`
  return {
    id: `${id}-${period}-empty`,
    fields: [field],
    category: 'Cek Data',
    status: 'info',
    title,
    message: `Belum ada catatan ${label.toLowerCase()} pada ${periodLabel}. Tambahkan catatan agar pola dapat dilihat.`,
    based_on: [],
    action: { type: 'log', label: 'Catat Sekarang' },
    disclaimer: FIELD_DISCLAIMER,
    detail: {
      title,
      pattern_summary: `Tidak ada catatan ${label.toLowerCase()} pada ${periodLabel}.`,
      period: periodLabel,
      data_used: [`Periode: ${periodLabel}`, 'Total catatan: 0 hari'],
      history: [],
      reason: 'Insight belum dapat dibentuk karena tidak ada catatan pada periode yang dipilih.',
      action_text: 'Tambahkan catatan harian, atau pilih periode lain yang memiliki catatan.',
      disclaimer: FIELD_DISCLAIMER,
    },
  }
}

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length

const round1 = (v: number) => Math.round(v * 10) / 10

// ======================================================================
// ROLE-AWARE FIELD INSIGHT GENERATORS 
// ======================================================================

function getSupplementInsight(logs: ApiHealthLog[], role: RoleType, period: FieldPeriod, customStart?: string, customEnd?: string): ContextualInsight {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd)
  if (filtered.length === 0) return emptyFieldInsight('supplement', 'supplement', 'Suplemen', period, customStart, customEnd)
  const periodLabel = periodText(period, customStart, customEnd)
  const label = ROLE_SUPPLEMENT_LABEL[role]
  const { unit, taken, total, pct, goodPct, goalText } = getSupplementCompliance(filtered, role, periodEndISO(period, customStart, customEnd))

  // CHI-12: rujukan TTD remaja = program Kemenkes 1 tablet/minggu. Anjuran TTD saat haid menunggu konfirmasi (CHI-18).
  const roleContext =
    role === 'teen'
      ? 'Program TTD remaja putri Kemenkes menganjurkan 1 tablet setiap minggu.'
      : role === 'pregnant'
        ? 'Buku KIA menganjurkan TTD atau MMS diminum setiap hari selama kehamilan.'
        : 'Suplemen menyusui dianjurkan dikonsumsi rutin sesuai arahan tenaga kesehatan.'

  const tips =
    role === 'pregnant'
      ? `Sesuai Buku KIA, ${KIA_TTD_TIPS}.`
      : role === 'teen'
        ? 'Pilih satu hari yang sama setiap minggu untuk minum TTD dan aktifkan pengingat di ponsel.'
        : 'Minum bersama makanan atau sumber vitamin C untuk penyerapan optimal.'

  const disclaimer = INSIGHT_DISCLAIMER
  const countText = `${taken} dari ${total} ${unit}`

  let status: StatusLevel
  let category: InsightCategory
  let title: string
  let message: string
  let action: { type: InsightActionType; label: string }
  let reasonText: string
  let recommendation: string

  if (pct >= goodPct) {
    status = 'safe'
    category = 'Perkembangan Baik'
    title = `Konsumsi ${label} Baik`
    message = `Kepatuhan Anda ${pct}% (${countText}) pada ${periodLabel}. ${roleContext}`
    action = { type: 'article', label: 'Baca Artikel' }
    reasonText = `Konsumsi ${label} tercatat pada ${countText} (${pct}%). Angka ini memenuhi anjuran ${goalText}.`
    recommendation = `Pertahankan kebiasaan ini. ${tips}`
  } else {
    // CHI-08, CHI-11, CHI-14: kepatuhan suplemen rendah cukup sampai Perlu Diperhatikan
    status = 'caution'
    category = 'Perlu Diperhatikan'
    title = `Konsumsi ${label} Perlu Ditingkatkan`
    message = `Kepatuhan Anda ${pct}% (${countText}) pada ${periodLabel}, belum memenuhi anjuran ${goalText}. ${roleContext}`
    action = { type: 'log', label: 'Catat' }
    reasonText = role === 'breastfeeding' && pct < BREASTFEEDING_SUPPLEMENT_LOW_PCT
      ? `Konsumsi ${label} hanya tercatat pada ${countText} (${pct}%), di bawah ${BREASTFEEDING_SUPPLEMENT_LOW_PCT}%. Pola konsumsi belum konsisten.`
      : `Konsumsi ${label} tercatat pada ${countText} (${pct}%), belum memenuhi anjuran ${goalText}.`
    recommendation = `${tips} Lanjutkan mencatat agar pola Anda dapat dipantau. ${ASK_MIDWIFE}`
  }

  const historyEntries = filtered.slice(0, 7).map(l => ({
    date: l.date,
    label: historyLabel(l.date),
    value: l.took_supplement ? '✓ Tercatat' : '✕ Tidak tercatat',
    state: (l.took_supplement ? 'ok' : 'flag') as 'ok' | 'flag' | 'missing',
  }))

  return {
    id: `supplement-${period}`,
    fields: ['supplement'],
    category,
    status,
    title,
    message,
    based_on: [`Kepatuhan ${pct}%`, `Tercatat ${taken}/${total} ${unit}`],
    action,
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, ${label} Anda tercatat dikonsumsi pada ${countText} (tingkat kepatuhan ${pct}%). ${roleContext}${unit === 'minggu' ? ' Kepatuhan dihitung per minggu: minggu dengan minimal 1 TTD dibagi jumlah minggu yang memiliki catatan.' : ''}`,
      period: periodLabel,
      data_used: [
        `Periode: ${periodLabel}`,
        `Total catatan: ${filtered.length} hari`,
        `Cara hitung: per ${unit}`,
        `Tercatat: ${taken}/${total} ${unit}`,
        `Kepatuhan: ${pct}%`,
        `Anjuran: ${goalText}`,
      ],
      history: historyEntries,
      reason: reasonText,
      action_text: recommendation,
      disclaimer,
    },
  }
}

function getFluidInsight(logs: ApiHealthLog[], role: RoleType, period: FieldPeriod, babyAgeMonths: number | null, customStart?: string, customEnd?: string): ContextualInsight {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd)
  if (filtered.length === 0) return emptyFieldInsight('hydration', 'hydration', 'Asupan Cairan', period, customStart, customEnd)
  const { target, min } = getFluidTargets(role, babyAgeMonths)
  const total = filtered.length
  const avg = average(filtered.map(l => l.water_glasses))
  const daysMet = filtered.filter(l => l.water_glasses >= min).length
  const periodLabel = periodText(period, customStart, customEnd)

  const roleContext =
    role === 'teen'
      ? 'Asupan cairan yang cukup membantu menjaga energi dan konsentrasi saat beraktivitas.'
      : role === 'pregnant'
        ? `Kebutuhan cairan ibu hamil lebih tinggi dibanding biasanya. Buku KIA menganjurkan ibu hamil ${KIA_FLUID_PREGNANT}.`
        : babyAgeMonths === null
          ? `Buku KIA menganjurkan ibu menyusui minum 14 gelas per hari pada 6 bulan pertama dan 12 gelas per hari pada 6 bulan kedua. Usia bayi belum tersedia, sehingga dipakai target sementara ${target} gelas.`
          : `Buku KIA menganjurkan ibu menyusui minum 14 gelas per hari pada 6 bulan pertama dan 12 gelas per hari pada 6 bulan kedua. Untuk usia bayi ${babyAgeMonths} bulan, target Anda ${target} gelas.`

  // Pada ibu hamil, batas cukup (8 gelas) berbeda dari target kartu (10 gelas)
  const goalText = min < target ? `anjuran minimal ${min} gelas (target ${target} gelas)` : `target ${target} gelas`
  const disclaimer = INSIGHT_DISCLAIMER

  let status: StatusLevel
  let category: InsightCategory
  let title: string
  let message: string
  let action: { type: InsightActionType; label: string }
  let reasonText: string
  let recommendation: string

  // CHI-15: Perkembangan Baik bila rata-rata ≥ batas bawah KIA; di bawahnya Perlu Diperhatikan (tanpa Segera Konsultasi)
  if (avg >= min) {
    status = 'safe'
    category = 'Perkembangan Baik'
    title = 'Asupan Cairan Cukup'
    message = `Rata-rata asupan cairan Anda ${round1(avg)} gelas/hari, memenuhi ${goalText}. ${roleContext}`
    action = { type: 'article', label: 'Baca Artikel' }
    reasonText = `Rata-rata asupan cairan Anda ${round1(avg)} gelas per hari, memenuhi ${goalText}.`
    recommendation = 'Lanjutkan kebiasaan minum air putih secara teratur sepanjang hari. Hindari minuman tinggi gula.'
  } else {
    status = 'caution'
    category = 'Perlu Diperhatikan'
    title = 'Asupan Cairan Perlu Ditingkatkan'
    message = `Rata-rata ${round1(avg)} gelas/hari, masih di bawah ${goalText}. ${roleContext}`
    action = { type: 'log', label: 'Catat' }
    reasonText = `Rata-rata asupan cairan Anda ${round1(avg)} gelas per hari, di bawah ${goalText}.`
    recommendation = `Minum segelas air putih setiap jam dan setelah makan. Bawa botol minum sebagai pengingat. ${ASK_MIDWIFE}`
  }

  const historyEntries = filtered.slice(0, 7).map(l => {
    const met = l.water_glasses >= min
    return {
      date: l.date,
      label: historyLabel(l.date),
      value: `${l.water_glasses} gelas ${met ? '✓' : ''}`,
      state: (met ? 'ok' : 'flag') as 'ok' | 'flag' | 'missing',
    }
  })

  return {
    id: `hydration-${period}`,
    fields: ['hydration'],
    category,
    status,
    title,
    message,
    based_on: [`Rata-rata ${round1(avg)} gelas`, `Target ${target} gelas/hari`],
    action,
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, rata-rata asupan cairan Anda adalah ${round1(avg)} gelas per hari dari ${total} catatan. ${roleContext} Anda memenuhi batas cukup (${min} gelas) pada ${daysMet} dari ${total} hari.`,
      period: periodLabel,
      data_used: [
        `Periode: ${periodLabel}`,
        `Total catatan: ${total} hari`,
        `Rata-rata: ${round1(avg)} gelas/hari`,
        `Target: ${target} gelas/hari`,
        ...(min < target ? [`Batas cukup (Buku KIA): ${min} gelas/hari`] : []),
        ...(role === 'pregnant' ? ['Anjuran Buku KIA: 8–12 gelas/hari'] : []),
        ...(role === 'breastfeeding' ? [`Usia bayi: ${babyAgeMonths === null ? 'belum tersedia' : `${babyAgeMonths} bulan`}`] : []),
        `Hari tercapai: ${daysMet}/${total}`,
      ],
      history: historyEntries,
      reason: reasonText,
      action_text: recommendation,
      disclaimer,
    },
  }
}

function getRestInsight(logs: ApiHealthLog[], role: RoleType, period: FieldPeriod, customStart?: string, customEnd?: string): ContextualInsight {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd)
  if (filtered.length === 0) return emptyFieldInsight('sleep', 'sleep', 'Tidur', period, customStart, customEnd)
  const { target: minOk, low } = getSleepThresholds(role)
  const avg = average(filtered.map(l => l.sleep_hours))
  const total = filtered.length
  const daysMet = filtered.filter(l => l.sleep_hours >= minOk).length
  const periodLabel = periodText(period, customStart, customEnd)

  const roleContext =
    role === 'teen'
      ? 'Tidur cukup mendukung pertumbuhan, konsentrasi belajar, dan kestabilan mood remaja.'
      : role === 'pregnant'
        ? `Tidur cukup membantu pertumbuhan janin dan menjaga kesehatan ibu hamil. Buku KIA menganjurkan ibu hamil ${KIA_SLEEP_PREGNANT}.`
        : 'Tidur cukup sangat penting untuk produksi ASI dan pemulihan pasca melahirkan.'

  const disclaimer = INSIGHT_DISCLAIMER

  let status: StatusLevel
  let category: InsightCategory
  let title: string
  let message: string
  let action: { type: InsightActionType; label: string }
  let reasonText: string
  let recommendation: string

  // CHI-16: tidur per indikator paling tinggi Perlu Diperhatikan.
  // Segera Konsultasi hanya lewat insight gabungan bila kurang tidur disertai mood negatif (CHI-21).
  if (avg >= minOk) {
    status = 'safe'
    category = 'Perkembangan Baik'
    title = 'Kualitas Tidur Baik'
    message = `Rata-rata tidur Anda ${round1(avg)} jam/hari, memenuhi anjuran minimal ${minOk} jam. ${roleContext}`
    action = { type: 'article', label: 'Baca Artikel' }
    reasonText = `Rata-rata durasi tidur Anda ${round1(avg)} jam per hari, memenuhi anjuran minimal ${minOk} jam.`
    recommendation = role === 'pregnant'
      ? `Pertahankan pola ${KIA_SLEEP_PREGNANT} sesuai anjuran Buku KIA. Usahakan jadwal tidur dan bangun di jam yang sama setiap hari.`
      : 'Usahakan jadwal tidur dan bangun di jam yang sama setiap hari. Hindari layar minimal 30 menit sebelum tidur untuk kualitas tidur yang lebih baik.'
  } else if (avg >= low) {
    status = 'caution'
    category = 'Perlu Diperhatikan'
    title = 'Tidur di Bawah Anjuran'
    message = `Rata-rata ${round1(avg)} jam/hari, disarankan minimal ${minOk} jam. ${roleContext}`
    action = CONSULT_ACTION
    reasonText = `Rata-rata durasi tidur Anda ${round1(avg)} jam per hari, di bawah anjuran minimal ${minOk} jam.`
    recommendation = role === 'breastfeeding'
      ? 'Ikut beristirahat saat bayi tidur. Minta bantuan pasangan atau keluarga untuk giliran jaga bayi agar Anda bisa beristirahat cukup.'
      : role === 'pregnant'
        ? `Usahakan ${KIA_SLEEP_PREGNANT} sesuai anjuran Buku KIA. Coba tidur 30 menit lebih awal malam ini.`
        : 'Coba tidur 30 menit lebih awal malam ini dan batasi penggunaan layar sebelum tidur.'
  } else {
    status = 'caution'
    category = 'Perlu Diperhatikan'
    title = 'Durasi Tidur Jauh di Bawah Anjuran'
    message = `Rata-rata ${round1(avg)} jam/hari, kurang dari ${low} jam. Sebaiknya tanyakan ke bidan atau tenaga kesehatan. ${roleContext}`
    action = CONSULT_ACTION
    reasonText = role === 'pregnant'
      ? `Rata-rata durasi tidur Anda ${round1(avg)} jam per hari, kurang dari ${low} jam, batas bawah tidur malam yang dianjurkan Buku KIA.`
      : `Rata-rata durasi tidur Anda ${round1(avg)} jam per hari, lebih dari 1 jam di bawah anjuran ${minOk} jam.`
    recommendation = role === 'pregnant'
      ? `Usahakan ${KIA_SLEEP_PREGNANT} sesuai anjuran Buku KIA. Tanyakan ke bidan bila Anda sering sulit tidur.`
      : 'Prioritaskan tidur siang singkat bila tidur malam kurang. Tanyakan ke bidan atau dokter bila Anda sering kurang tidur.'
  }

  const historyEntries = filtered.slice(0, 7).map(l => {
    const met = l.sleep_hours >= minOk
    return {
      date: l.date,
      label: historyLabel(l.date),
      value: `${l.sleep_hours} jam ${met ? '✓' : ''}`,
      state: (met ? 'ok' : 'flag') as 'ok' | 'flag' | 'missing',
    }
  })

  return {
    id: `sleep-${period}`,
    fields: ['sleep'],
    category,
    status,
    title,
    message,
    based_on: [`Rata-rata ${round1(avg)} jam`, `Anjuran ${minOk} jam/hari`],
    action,
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, rata-rata durasi tidur Anda adalah ${round1(avg)} jam per hari dari ${total} catatan. ${roleContext} Target harian untuk peran Anda adalah ${minOk} jam, dan Anda mencapai target pada ${daysMet} dari ${total} hari.`,
      period: periodLabel,
      data_used: [
        `Periode: ${periodLabel}`,
        `Total catatan: ${total} hari`,
        `Rata-rata: ${round1(avg)} jam/hari`,
        `Anjuran: ${minOk} jam/hari`,
        `Batas tidur rendah: < ${low} jam/hari`,
        ...(role === 'pregnant' ? ['Anjuran Buku KIA: tidur malam 6–7 jam + tidur siang 1–2 jam'] : []),
        `Hari tercapai: ${daysMet}/${total}`,
      ],
      history: historyEntries,
      reason: reasonText,
      action_text: recommendation,
      disclaimer,
    },
  }
}

function getMoodInsight(logs: ApiHealthLog[], role: RoleType, period: FieldPeriod, customStart?: string, customEnd?: string): ContextualInsight {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd)
  if (filtered.length === 0) return emptyFieldInsight('mood', 'mood', 'Mood', period, customStart, customEnd)
  const total = filtered.length
  const negativeDays = filtered.filter(l => l.mood <= NEGATIVE_MOOD_MAX).length
  const neutralDays = filtered.filter(l => l.mood === 3).length
  const positiveDays = filtered.filter(l => l.mood >= 4).length
  const avg = average(filtered.map(l => l.mood))
  const periodLabel = periodText(period, customStart, customEnd)
  // CHI-17(c): dihitung dari seluruh catatan peran ini, tidak bergantung pada periode yang dipilih
  const persistentNegative = hasPersistentNegativeMood(logs)
  const dominant =
    negativeDays >= neutralDays && negativeDays >= positiveDays
      ? 'Negatif'
      : positiveDays >= neutralDays && positiveDays >= negativeDays
        ? 'Positif'
        : 'Netral'

  const roleContext =
    role === 'teen'
      ? 'Mood remaja dipengaruhi oleh siklus haid, kualitas tidur, dan tekanan akademik.'
      : role === 'pregnant'
        ? 'Selama hamil, ibu dapat mengalami gejolak emosi. Buku KIA menganjurkan tidur cukup, makan bergizi, dan periksa ke Puskesmas.'
        : 'Setelah melahirkan, rasa sedih yang ringan dapat muncul hingga sekitar 2 minggu. Buku KIA menganjurkan periksa bila murung atau sedih berlangsung 2 minggu atau lebih.'

  const disclaimer = INSIGHT_DISCLAIMER

  let status: StatusLevel
  let category: InsightCategory
  let title: string
  let message: string
  let action: { type: InsightActionType; label: string }
  let reasonText: string
  let recommendation: string

  if (persistentNegative) {
    // CHI-17(c): menyerupai tanda bahaya KIA (murung/sedih 2 minggu atau lebih)
    status = 'danger'
    category = 'Segera Konsultasi'
    title = 'Mood Negatif Berlangsung 2 Minggu'
    message = `Mood negatif tercatat setiap hari selama ${PERSISTENT_MOOD_DAYS} hari terakhir. Sebaiknya segera bicarakan dengan bidan, dokter, atau Puskesmas.`
    action = CONSULT_ACTION
    reasonText = `Mood negatif (lelah atau sedih) tercatat setiap hari selama ${PERSISTENT_MOOD_DAYS} hari berturut-turut. Buku KIA menganjurkan pemeriksaan bila rasa murung atau sedih berlangsung 2 minggu atau lebih.`
    recommendation = 'Segera bicarakan perasaan Anda dengan bidan, dokter, atau Puskesmas. Ceritakan juga kepada orang yang Anda percaya agar mendapat dukungan.'
  } else if (negativeDays > total / 2) {
    // CHI-17(b)
    status = 'caution'
    category = 'Perlu Diperhatikan'
    title = 'Mood Cenderung Negatif'
    message = `Mood negatif tercatat ${negativeDays} dari ${total} hari pada ${periodLabel}. ${roleContext}`
    action = { type: 'log', label: 'Catat' }
    reasonText = `Mood negatif (lelah atau sedih) tercatat pada ${negativeDays} dari ${total} hari, lebih dari setengah periode pemantauan.`
    recommendation = 'Ceritakan perasaan Anda kepada orang yang dipercaya. Pastikan tidur dan makan bergizi tetap terjaga. Bila perasaan ini menetap, bicarakan dengan bidan atau tenaga kesehatan.'
  } else {
    // CHI-17(a): satu hari mood negatif dan mood netral tidak memicu Perlu Diperhatikan
    status = 'safe'
    category = 'Perkembangan Baik'
    title = positiveDays > total / 2 ? 'Mood Positif - Pertahankan!' : 'Mood Cenderung Stabil'
    message = `Mood positif ${positiveDays} hari, netral ${neutralDays} hari, negatif ${negativeDays} hari pada ${periodLabel}. ${roleContext}`
    action = { type: 'article', label: 'Baca Artikel' }
    reasonText = `Mood negatif tercatat pada ${negativeDays} dari ${total} hari, tidak lebih dari setengah periode pemantauan.`
    recommendation = 'Luangkan waktu untuk aktivitas yang Anda nikmati setiap hari. Tetap ceritakan perasaan Anda kepada orang yang dipercaya.'
  }

  const historyEntries = filtered.slice(0, 7).map(l => ({
    date: l.date,
    label: historyLabel(l.date),
    value: ['😢 Sedih', '😴 Lelah', '😐 Biasa', '😊 Nyaman', '😄 Bahagia'][l.mood - 1] ?? '-',
    state: (l.mood >= 4 ? 'ok' : l.mood === 3 ? 'missing' : 'flag') as 'ok' | 'flag' | 'missing',
  }))

  return {
    id: `mood-${period}`,
    fields: ['mood'],
    category,
    status,
    title,
    message,
    based_on: [`Rata-rata mood ${round1(avg)}/5`, `Dominan ${dominant}`],
    action,
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, mood Anda tercatat dari ${total} catatan. Mood positif ${positiveDays} hari, netral ${neutralDays} hari, dan negatif ${negativeDays} hari. ${roleContext}`,
      period: periodLabel,
      data_used: [
        `Periode: ${periodLabel}`,
        `Total catatan: ${total} hari`,
        `Rata-rata mood: ${round1(avg)}/5`,
        `Dominan: ${dominant}`,
        `Positif: ${positiveDays} hari`,
        `Negatif: ${negativeDays} hari`,
        `Mood negatif ${PERSISTENT_MOOD_DAYS} hari berturut-turut: ${persistentNegative ? 'Ya' : 'Tidak'}`,
      ],
      history: historyEntries,
      reason: reasonText,
      action_text: recommendation,
      disclaimer,
    },
  }
}

function getCycleInsight(logs: ApiHealthLog[], period: FieldPeriod, customStart?: string, customEnd?: string): ContextualInsight {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd)
  if (filtered.length === 0) return emptyFieldInsight('cycle', 'cycle', 'Siklus Haid', period, customStart, customEnd)
  const total = filtered.length
  const menstruasiDays = filtered.filter(l => l.is_menstruating).length
  const periodLabel = periodText(period, customStart, customEnd)
  const isMenstruating = menstruasiDays > 0
  const disclaimer = INSIGHT_DISCLAIMER

  // CHI-18: haid adalah kondisi normal, ditampilkan sebagai informasi (Perkembangan Baik).
  // Anjuran TTD khusus saat haid menunggu konfirmasi stakeholder; teks pengingat lama dipertahankan.
  const status: StatusLevel = 'safe'
  const category: InsightCategory = 'Perkembangan Baik'
  const title = isMenstruating ? 'Sedang Haid' : 'Tidak Ada Catatan Haid'
  const message = isMenstruating
    ? `Tercatat haid ${menstruasiDays} dari ${total} hari pada ${periodLabel}. Kebutuhan zat besi meningkat saat haid, pastikan asupan TTD tercukupi.`
    : `Tidak ada catatan haid pada ${periodLabel}. Lanjutkan pencatatan harian.`
  const action: { type: InsightActionType; label: string } = isMenstruating
    ? { type: 'log', label: 'Catat' }
    : { type: 'article', label: 'Baca Artikel' }
  const reasonText = isMenstruating
    ? `Tercatat haid pada ${menstruasiDays} dari ${total} hari. Haid adalah kondisi normal; insight ini berisi pengingat TTD.`
    : `Tidak ada catatan haid pada ${periodLabel}. Insight ini hanya mencatat ada atau tidaknya haid, bukan menilai keteraturan siklus.`
  const recommendation = isMenstruating
    ? 'Pastikan TTD tidak terlewat. Konsumsi makanan kaya zat besi seperti hati ayam, daging merah, bayam, dan tempe. Istirahat cukup dan jaga hidrasi.'
    : 'Tetap konsumsi TTD 1 tablet setiap minggu sesuai program Kemenkes. Catat tanggal mulai haid tiap bulan.'

  const historyEntries = filtered.slice(0, 7).map(l => ({
    date: l.date,
    label: historyLabel(l.date),
    value: l.is_menstruating ? 'Sedang haid' : 'Tidak haid',
    state: 'ok' as 'ok' | 'flag' | 'missing',
  }))

  return {
    id: `cycle-${period}`,
    fields: ['cycle'],
    category,
    status,
    title,
    message,
    based_on: [`Hari haid: ${menstruasiDays}`, `Total log: ${total} hari`],
    action,
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, tercatat haid pada ${menstruasiDays} dari total ${total} hari.`,
      period: periodLabel,
      data_used: [
        `Periode: ${periodLabel}`,
        `Total catatan: ${total} hari`,
        `Hari haid: ${menstruasiDays}`,
      ],
      history: historyEntries,
      reason: reasonText,
      action_text: recommendation,
      disclaimer,
    },
  }
}

function getMomWeightInsight(logs: ApiHealthLog[], period: FieldPeriod, customStart?: string, customEnd?: string): ContextualInsight {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd).filter(l => l.weight_kg != null)
  if (filtered.length === 0) return emptyFieldInsight('weight', 'weight', 'Berat Badan', period, customStart, customEnd)
  const total = filtered.length
  const values = filtered.map(l => l.weight_kg as number)
  const avg = average(values)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const periodLabel = periodText(period, customStart, customEnd)

  // CHI-19(a): kenaikan dihitung dari catatan berat pertama (seluruh riwayat) ke catatan terbaru
  const allWeights = logs.filter(l => l.weight_kg != null).sort((a, b) => a.date.localeCompare(b.date))
  const first = allWeights[0]
  const newest = allWeights[allWeights.length - 1]
  const change = round1((newest.weight_kg as number) - (first.weight_kg as number))
  const changeText = `${change >= 0 ? '+' : ''}${change} kg`
  const hasChange = allWeights.length > 1
  const disclaimer = INSIGHT_DISCLAIMER

  // CHI-19: ditampilkan sebagai informasi, bukan Perkembangan Baik.
  // Penilaian dengan tabel IMT Buku KIA menunggu keputusan stakeholder (CHI-19b).
  const status: StatusLevel = 'info'
  const category: InsightCategory = 'Informasi'
  const title = 'Catatan Berat Badan'
  const message = hasChange
    ? `Berat terbaru ${newest.weight_kg} kg, berubah ${changeText} sejak catatan pertama (${first.date}). Kenaikan berat badan dinilai oleh bidan atau dokter sesuai status gizi sebelum hamil.`
    : `Berat terbaru ${newest.weight_kg} kg. Perubahan berat akan tampil setelah ada lebih dari satu catatan.`
  const action: { type: InsightActionType; label: string } = { type: 'article', label: 'Baca Artikel' }
  const reasonText = 'Aplikasi hanya merangkum catatan berat badan Anda. Menurut Buku KIA, kenaikan berat badan yang dianjurkan selama hamil bergantung pada status gizi sebelum hamil, dan grafiknya diisi oleh tenaga kesehatan.'
  const recommendation = 'Timbang berat badan minimal seminggu sekali di waktu yang sama. Bawa catatan ini saat periksa kehamilan agar bidan atau dokter dapat menilai kenaikan berat badan Anda.'

  const historyEntries = filtered.slice(0, 7).map(l => ({
    date: l.date,
    label: historyLabel(l.date),
    value: `${l.weight_kg} kg`,
    state: 'ok' as 'ok' | 'flag' | 'missing',
  }))

  return {
    id: `weight-${period}`,
    fields: ['weight'],
    category,
    status,
    title,
    message,
    based_on: hasChange ? [`Terbaru ${newest.weight_kg} kg`, `Perubahan ${changeText}`] : [`Terbaru ${newest.weight_kg} kg`],
    action,
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, tercatat ${total} kali pengukuran berat badan dengan rata-rata ${round1(avg)} kg (rentang ${min} - ${max} kg). ${hasChange ? `Sejak catatan pertama pada ${first.date} (${first.weight_kg} kg), berat Anda berubah ${changeText}.` : ''}`,
      period: periodLabel,
      data_used: [
        `Periode: ${periodLabel}`,
        `Total catatan: ${total} kali`,
        `Rata-rata: ${round1(avg)} kg`,
        `Rentang: ${min} - ${max} kg`,
        `Catatan pertama: ${first.weight_kg} kg (${first.date})`,
        `Terbaru: ${newest.weight_kg} kg (${newest.date})`,
        ...(hasChange ? [`Perubahan sejak catatan pertama: ${changeText}`] : []),
      ],
      history: historyEntries,
      reason: reasonText,
      action_text: recommendation,
      disclaimer,
    },
  }
}

function getPumpingInsight(logs: ApiHealthLog[], period: FieldPeriod, customStart?: string, customEnd?: string): ContextualInsight {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd).filter(l => l.breastfeeding_count != null)
  if (filtered.length === 0) return emptyFieldInsight('breastfeeding', 'breastfeeding', 'Menyusui/Pumping', period, customStart, customEnd)
  const total = filtered.length
  const values = filtered.map(l => l.breastfeeding_count as number)
  const avg = average(values)
  const daysMet = values.filter(v => v >= BREASTFEEDING_MIN_SESSIONS).length
  const periodLabel = periodText(period, customStart, customEnd)
  const disclaimer = INSIGHT_DISCLAIMER

  let status: StatusLevel
  let category: InsightCategory
  let title: string
  let message: string
  let action: { type: InsightActionType; label: string }
  let reasonText: string
  let recommendation: string

  if (avg >= BREASTFEEDING_MIN_SESSIONS) {
    status = 'safe'
    category = 'Perkembangan Baik'
    title = 'Frekuensi Menyusui/Pumping Sesuai Anjuran'
    message = `Rata-rata ${round1(avg)} sesi/hari, memenuhi anjuran minimal ${BREASTFEEDING_MIN_SESSIONS} kali sehari.`
    action = { type: 'article', label: 'Baca Artikel' }
    reasonText = `Rata-rata frekuensi menyusui/pumping Anda ${round1(avg)} sesi per hari, memenuhi anjuran minimal ${BREASTFEEDING_MIN_SESSIONS} kali. Buku KIA menganjurkan ${KIA_BREASTFEEDING}.`
    recommendation = 'Lanjutkan menyusui sesuai keinginan bayi. Jaga jarak antar sesi tidak terlalu lama.'
  } else if (avg >= BREASTFEEDING_LOW_SESSIONS) {
    // CHI-20: < 8 kali → Perlu Diperhatikan dengan saran dari Buku KIA
    status = 'caution'
    category = 'Perlu Diperhatikan'
    title = 'Frekuensi Menyusui/Pumping Perlu Ditingkatkan'
    message = `Rata-rata ${round1(avg)} sesi/hari, di bawah anjuran minimal ${BREASTFEEDING_MIN_SESSIONS} kali sehari.`
    action = { type: 'log', label: 'Catat' }
    reasonText = `Rata-rata frekuensi menyusui/pumping Anda ${round1(avg)} sesi per hari, di bawah anjuran minimal ${BREASTFEEDING_MIN_SESSIONS} kali. Buku KIA menganjurkan ${KIA_BREASTFEEDING}.`
    recommendation = `${KIA_BREASTFEEDING_TIPS} ${ASK_MIDWIFE}`
  } else {
    // CHI-20: perlakuan < 6 sesi menunggu keputusan stakeholder (Segera Konsultasi tetap dipakai sementara)
    status = 'danger'
    category = 'Segera Konsultasi'
    title = 'Frekuensi Menyusui/Pumping Jauh di Bawah Anjuran'
    message = `Rata-rata ${round1(avg)} sesi/hari, di bawah ${BREASTFEEDING_LOW_SESSIONS} sesi. Sebaiknya dikonsultasikan dengan tenaga kesehatan atau konselor laktasi.`
    action = CONSULT_ACTION
    reasonText = `Rata-rata frekuensi menyusui/pumping Anda ${round1(avg)} sesi per hari, di bawah ${BREASTFEEDING_LOW_SESSIONS} sesi. Buku KIA menganjurkan ${KIA_BREASTFEEDING}.`
    recommendation = `${KIA_BREASTFEEDING_TIPS} Konsultasikan dengan bidan atau konselor laktasi.`
  }

  const historyEntries = filtered.slice(0, 7).map(l => {
    const met = (l.breastfeeding_count as number) >= BREASTFEEDING_MIN_SESSIONS
    return {
      date: l.date,
      label: historyLabel(l.date),
      value: `${l.breastfeeding_count} sesi ${met ? '✓' : ''}`,
      state: (met ? 'ok' : 'flag') as 'ok' | 'flag' | 'missing',
    }
  })

  return {
    id: `breastfeeding-${period}`,
    fields: ['breastfeeding'],
    category,
    status,
    title,
    message,
    based_on: [`Rata-rata ${round1(avg)} sesi`, `Anjuran ${BREASTFEEDING_MIN_SESSIONS} kali/hari`],
    action,
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, rata-rata frekuensi menyusui/pumping Anda adalah ${round1(avg)} sesi per hari dari ${total} catatan. Anjuran minimal adalah ${BREASTFEEDING_MIN_SESSIONS} kali per hari, dan Anda mencapainya pada ${daysMet} dari ${total} hari.`,
      period: periodLabel,
      data_used: [
        `Periode: ${periodLabel}`,
        `Total catatan: ${total} hari`,
        `Rata-rata: ${round1(avg)} sesi/hari`,
        `Anjuran: ${BREASTFEEDING_MIN_SESSIONS} sesi/hari`,
        'Anjuran Buku KIA: 8–12 kali/hari atau lebih',
        `Hari tercapai: ${daysMet}/${total}`,
      ],
      history: historyEntries,
      reason: reasonText,
      action_text: recommendation,
      disclaimer,
    },
  }
}

// ======================================================================
// CONTEXTUAL INSIGHT (GABUNGAN)
// ======================================================================
function generateContextualInsight(
  logs: ApiHealthLog[],
  period: FieldPeriod,
  babyAgeMonths: number | null,
  customStart?: string,
  customEnd?: string,
): ContextualInsight | null {
  const filtered = filterLogsByPeriod(logs, period, customStart, customEnd)
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length === 0) return null

  const role = sorted[0].profile_type as RoleType
  const sameProfile = sorted.filter(l => l.profile_type === role)
  const roleLogs = logs.filter(l => l.profile_type === role)
  const total = sameProfile.length
  const periodLabel = periodText(period, customStart, customEnd)
  const roleLabel = ROLE_LABELS[role]

  const avgSleep = average(sameProfile.map(l => l.sleep_hours))
  const avgWater = average(sameProfile.map(l => l.water_glasses))
  const tiredDays = sameProfile.filter(l => l.mood <= NEGATIVE_MOOD_MAX).length
  const { target: minSleep, low: lowSleepLimit } = getSleepThresholds(role)
  const { target: fluidTarget, min: fluidMin } = getFluidTargets(role, babyAgeMonths)
  // CHI-23: ambang cairan G-05 mengikuti KIA; remaja putri memakai aturan lama sampai keputusan CHI-06
  const lowWaterLimit = role === 'teen' ? fluidTarget - 2 : fluidMin
  const supplement = getSupplementCompliance(sameProfile, role, periodEndISO(period, customStart, customEnd))
  const supplementLabel = ROLE_SUPPLEMENT_LABEL[role]

  const disclaimer = INSIGHT_DISCLAIMER

  const historyEntries = sameProfile.slice(0, 7).map(l => ({
    date: l.date,
    label: historyLabel(l.date),
    value: `Mood ${l.mood}/5 · Tidur ${l.sleep_hours} jam · Air ${l.water_glasses} gelas`,
    state: (l.mood >= 4 ? 'ok' : l.mood === 3 ? 'missing' : 'flag') as 'ok' | 'flag' | 'missing',
  }))

  // Kondisi 1: Data belum cukup
  if (total < 3) {
    const title = 'Data Belum Cukup untuk Analisis'
    return {
      id: 'insufficient-data',
      fields: [],
      category: 'Cek Data',
      status: 'info',
      title,
      message: `Baru tercatat ${total} hari pada ${periodLabel} untuk peran ${roleLabel}. Sistem membutuhkan minimal 3 hari catatan dalam periode yang dipilih.`,
      based_on: [],
      action: { type: 'log', label: 'Catat Sekarang' },
      disclaimer,
      detail: {
        title,
        pattern_summary: `Sistem menerima ${total} catatan dalam ${periodLabel} untuk peran ${roleLabel}. Jumlah ini belum memadai untuk mendeteksi pola atau tren yang bermakna. Semakin banyak catatan yang Anda buat, semakin akurat insight yang dapat dihasilkan.`,
        period: periodLabel,
        data_used: [
          `Peran: ${roleLabel}`,
          `Periode: ${periodLabel}`,
          `Total catatan: ${total} hari`,
          `Minimal: 3 hari`,
        ],
        history: historyEntries,
        reason: `Insight ini muncul karena jumlah catatan (${total} hari) belum mencapai ambang minimal 3 hari yang dibutuhkan untuk analisis pola. Sistem tidak dapat menyimpulkan kondisi apa pun dari data yang terlalu sedikit.`,
        action_text: 'Lanjutkan mencatat kondisi harian Anda (mood, tidur, cairan, suplemen, dll.). Setelah 3 hari, insight yang lebih bermakna akan muncul secara otomatis.',
        disclaimer,
      },
    }
  }

  // Kondisi 2: Kelelahan berulang (CHI-21)
  // Perlu Diperhatikan: mood negatif ≥ 3 hari disertai kurang tidur (rata-rata di bawah anjuran tidur peran).
  // Segera Konsultasi: mood negatif terus-menerus 14 hari terakhir, atau mood negatif berulang disertai tidur < 6 jam.
  // Cairan tidak lagi menjadi pemicu.
  const persistentNegative = hasPersistentNegativeMood(roleLogs)
  const recurringNegative = tiredDays >= 3
  const shortSleep = avgSleep < minSleep
  if (persistentNegative || (recurringNegative && shortSleep)) {
    const isUrgent = persistentNegative || (recurringNegative && avgSleep < SLEEP_URGENT_HOURS)
    const category: InsightCategory = isUrgent ? 'Segera Konsultasi' : 'Perlu Diperhatikan'
    const status: StatusLevel = isUrgent ? 'danger' : 'caution'
    const title = `Kelelahan Berulang pada ${roleLabel}`
    const trigger = persistentNegative
      ? `mood negatif tercatat setiap hari selama ${PERSISTENT_MOOD_DAYS} hari terakhir`
      : `mood negatif tercatat ${tiredDays} hari disertai rata-rata tidur ${round1(avgSleep)} jam${avgSleep < SLEEP_URGENT_HOURS ? `, kurang dari ${SLEEP_URGENT_HOURS} jam` : ''}`
    const message = `Pada ${periodLabel}, mood negatif tercatat pada ${tiredDays} dari ${total} hari dengan rata-rata tidur ${round1(avgSleep)} jam. Pola ini ${isUrgent ? 'sebaiknya segera dikonsultasikan ke bidan, dokter, atau Puskesmas' : 'perlu diperhatikan'}.`
    return {
      id: 'recurring-fatigue',
      fields: ['mood', 'sleep'],
      category,
      status,
      title,
      message,
      based_on: [
        `Mood negatif ${tiredDays}/${total} hari`,
        `Rata-rata tidur ${round1(avgSleep)} jam`,
      ],
      action: CONSULT_ACTION,
      disclaimer,
      detail: {
        title,
        pattern_summary: `Selama ${periodLabel}, Anda (${roleLabel}) tercatat mengalami mood negatif (lelah atau sedih) sebanyak ${tiredDays} dari ${total} hari, dengan rata-rata tidur ${round1(avgSleep)} jam per hari.${persistentNegative ? ` Mood negatif juga tercatat setiap hari selama ${PERSISTENT_MOOD_DAYS} hari terakhir.` : ''}`,
        period: periodLabel,
        data_used: [
          `Peran: ${roleLabel}`,
          `Periode: ${periodLabel}`,
          `Total catatan: ${total} hari`,
          `Mood negatif: ${tiredDays} hari`,
          `Rata-rata tidur: ${round1(avgSleep)} jam (anjuran ${minSleep} jam)`,
          `Mood negatif ${PERSISTENT_MOOD_DAYS} hari berturut-turut: ${persistentNegative ? 'Ya' : 'Tidak'}`,
          `Ambang Segera Konsultasi: tidur < ${SLEEP_URGENT_HOURS} jam disertai mood negatif berulang`,
        ],
        history: historyEntries,
        reason: `Insight ini muncul karena ${trigger}. Buku KIA menyebut sulit tidur dan cemas berlebihan sebagai tanda bahaya, dan menganjurkan pemeriksaan bila rasa murung atau sedih berlangsung 2 minggu atau lebih.`,
        action_text:
          role === 'breastfeeding'
            ? `${isUrgent ? 'Segera bicarakan kondisi Anda dengan bidan, dokter, atau Puskesmas.' : 'Bila berlanjut, bicarakan dengan bidan atau dokter.'} Ikut beristirahat saat bayi tidur dan minta bantuan pasangan atau keluarga untuk giliran jaga bayi.`
            : role === 'pregnant'
              ? `${isUrgent ? 'Segera bicarakan kondisi Anda dengan bidan, dokter, atau Puskesmas.' : 'Bila berlanjut, bicarakan dengan bidan atau dokter.'} Usahakan ${KIA_SLEEP_PREGNANT}.`
              : `${isUrgent ? 'Segera bicarakan kondisi Anda dengan tenaga kesehatan.' : 'Bila berlanjut, bicarakan dengan tenaga kesehatan.'} Coba tidur minimal ${minSleep} jam dan ceritakan perasaan Anda kepada orang yang dipercaya.`,
        disclaimer,
      },
    }
  }

  // Kondisi 3: Suplemen tidak rutin (CHI-22)
  if (supplement.pct < supplement.irregularPct) {
    const { unit, taken, total: supplementTotal, pct, goalText } = supplement
    const title = `Konsumsi ${supplementLabel} Belum Rutin`
    return {
      id: 'supplement-irregular',
      fields: ['supplement'],
      category: 'Perlu Diperhatikan',
      status: 'caution',
      title,
      message: `${supplementLabel} tercatat pada ${taken} dari ${supplementTotal} ${unit} (${pct}%) pada ${periodLabel} untuk peran ${roleLabel}, belum memenuhi anjuran ${goalText}.`,
      based_on: [
        `${supplementLabel} ${taken}/${supplementTotal} ${unit}`,
        `Kepatuhan ${pct}%`,
      ],
      action: { type: 'log', label: 'Catat' },
      disclaimer,
      detail: {
        title,
        pattern_summary: `Selama ${periodLabel}, ${supplementLabel} Anda (${roleLabel}) tercatat dikonsumsi pada ${taken} dari ${supplementTotal} ${unit} (tingkat kepatuhan ${pct}%).`,
        period: periodLabel,
        data_used: [
          `Peran: ${roleLabel}`,
          `Periode: ${periodLabel}`,
          `Total catatan: ${total} hari`,
          `Cara hitung: per ${unit}`,
          `Tercatat: ${taken}/${supplementTotal} ${unit}`,
          `Kepatuhan: ${pct}%`,
          `Anjuran: ${goalText}`,
        ],
        history: sameProfile.slice(0, 7).map(l => ({
          date: l.date,
          label: historyLabel(l.date),
          value: l.took_supplement ? '✓ Tercatat' : '✕ Tidak tercatat',
          state: (l.took_supplement ? 'ok' : 'flag') as 'ok' | 'flag' | 'missing',
        })),
        reason: `Insight ini muncul karena kepatuhan konsumsi ${supplementLabel} Anda ${pct}%, belum memenuhi anjuran ${goalText}.`,
        action_text:
          role === 'pregnant'
            ? `Sesuai Buku KIA, ${KIA_TTD_TIPS}. ${ASK_MIDWIFE}`
            : role === 'teen'
              ? `Pilih satu hari yang sama setiap minggu untuk minum TTD dan aktifkan pengingat di ponsel. ${ASK_MIDWIFE}`
              : `Coba konsumsi suplemen pada waktu yang sama setiap hari dan aktifkan pengingat di ponsel. ${ASK_MIDWIFE}`,
        disclaimer,
      },
    }
  }

  // Kondisi 4: Tidur atau cairan rendah (CHI-23)
  const lowSleep = avgSleep < lowSleepLimit
  const lowWater = avgWater < lowWaterLimit
  if (lowSleep || lowWater) {
    const title = lowSleep && lowWater
      ? `Tidur dan Asupan Cairan Tercatat Rendah pada ${roleLabel}`
      : lowSleep
        ? `Durasi Tidur Tercatat Rendah pada ${roleLabel}`
        : `Asupan Cairan Tercatat Rendah pada ${roleLabel}`
    const sleepNote = `tidur kurang dari ${lowSleepLimit} jam`
    const waterNote = `cairan kurang dari ${lowWaterLimit} gelas`
    return {
      id: 'low-sleep-or-water',
      fields: [...(lowSleep ? ['sleep'] : []), ...(lowWater ? ['hydration'] : [])],
      category: 'Perlu Diperhatikan',
      status: 'caution',
      title,
      message: `Pada ${periodLabel}, rata-rata tidur Anda ${round1(avgSleep)} jam dan rata-rata cairan ${round1(avgWater)} gelas. ${lowSleep && lowWater ? 'Keduanya' : lowSleep ? 'Durasi tidur' : 'Asupan cairan'} berada di bawah ambang untuk peran ${roleLabel}.`,
      based_on: [
        `Rata-rata tidur ${round1(avgSleep)} jam`,
        `Rata-rata cairan ${round1(avgWater)} gelas`,
      ],
      action: CONSULT_ACTION,
      disclaimer,
      detail: {
        title,
        pattern_summary: `Selama ${periodLabel}, rata-rata durasi tidur Anda adalah ${round1(avgSleep)} jam per hari dan rata-rata asupan cairan Anda adalah ${round1(avgWater)} gelas per hari. Tercatat ${[lowSleep ? sleepNote : '', lowWater ? waterNote : ''].filter(Boolean).join(' dan ')}.`,
        period: periodLabel,
        data_used: [
          `Peran: ${roleLabel}`,
          `Periode: ${periodLabel}`,
          `Total catatan: ${total} hari`,
          `Rata-rata tidur: ${round1(avgSleep)} jam`,
          `Rata-rata cairan: ${round1(avgWater)} gelas`,
          `Ambang tidur: < ${lowSleepLimit} jam/hari (anjuran ${minSleep} jam)`,
          `Ambang cairan: < ${lowWaterLimit} gelas/hari (target ${fluidTarget} gelas)`,
          ...(role === 'breastfeeding' ? [`Usia bayi: ${babyAgeMonths === null ? 'belum tersedia' : `${babyAgeMonths} bulan`}`] : []),
        ],
        history: historyEntries,
        reason: `Insight ini muncul karena rata-rata ${lowSleep && lowWater ? 'tidur dan cairan' : lowSleep ? 'tidur' : 'cairan'} Anda berada di bawah ambang untuk peran ${roleLabel}. Meskipun tidak disertai kelelahan berulang, pola ini tetap perlu diperhatikan.`,
        action_text:
          role === 'breastfeeding'
            ? `Ikut beristirahat saat bayi tidur dan minum segelas air setiap kali menyusui. Untuk ibu menyusui, target cairan Anda ${fluidTarget} gelas per hari. ${ASK_MIDWIFE}`
            : role === 'pregnant'
              ? `Usahakan ${KIA_SLEEP_PREGNANT}, dan ${KIA_FLUID_PREGNANT}. ${ASK_MIDWIFE}`
              : `Coba tidur 30 menit lebih awal dan minum segelas air setiap jam. Target cairan untuk remaja adalah ${fluidTarget} gelas per hari.`,
        disclaimer,
      },
    }
  }

  // Kondisi 5: Perkembangan baik
  const title = `Pencatatan Rutin Terjaga (${roleLabel})`
  return {
    id: 'good-progress',
    fields: [],
    category: 'Perkembangan Baik',
    status: 'safe',
    title,
    message: `Kamu mencatat Health Log pada ${total} hari dalam ${periodLabel}. Pertahankan kebiasaan ini untuk memantau kesehatan Anda secara berkelanjutan.`,
    based_on: [`${total} hari tercatat`],
    action: { type: 'article', label: 'Baca Artikel' },
    disclaimer,
    detail: {
      title,
      pattern_summary: `Selama ${periodLabel}, Anda (${roleLabel}) tercatat melakukan Health Log pada ${total} hari. Rata-rata tidur Anda ${round1(avgSleep)} jam, rata-rata cairan ${round1(avgWater)} gelas, dan kepatuhan suplemen ${supplement.pct}% (dihitung per ${supplement.unit}).`,
      period: periodLabel,
      data_used: [
        `Peran: ${roleLabel}`,
        `Periode: ${periodLabel}`,
        `Total catatan: ${total} hari`,
        `Rata-rata tidur: ${round1(avgSleep)} jam`,
        `Rata-rata cairan: ${round1(avgWater)} gelas`,
        `Kepatuhan suplemen: ${supplement.pct}%`,
      ],
      history: historyEntries,
      reason: `Insight ini muncul karena Anda secara konsisten melakukan pencatatan selama ${periodLabel}. Tidak ditemukan pola yang memerlukan perhatian khusus pada periode ini.`,
      action_text:
        'Pertahankan kebiasaan mencatat harian Anda. Konsistensi pencatatan adalah kunci untuk memantau kesehatan jangka panjang.',
      disclaimer,
    },
  }
}

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
  { emoji: '😫', label: 'LELAH', value: 'lelah' },
  { emoji: '😔', label: 'SEDIH', value: 'sedih' },
  { emoji: '😐', label: 'BIASA', value: 'biasa' },
  { emoji: '🙂', label: 'NYAMAN', value: 'nyaman' },
  { emoji: '🤩', label: 'BAHAGIA', value: 'bahagia' },
]

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const PillIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
)

const FluidIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
)

const MoonIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)

const SmileIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

const CalendarIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <circle cx="12" cy="16" r="1" fill="#ec4899" />
  </svg>
)

const WeightIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const DropIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
)

const TrendUpIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
    <path d="M0.816667 7L0 6.18333L4.31667 1.8375L6.65 4.17083L9.68333 1.16667H8.16667V0H11.6667V3.5H10.5V1.98333L6.65 5.83333L4.31667 3.5L0.816667 7Z" fill="#059669" />
  </svg>
)

const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#64748b" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

const AnemiaIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#546b43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 4 9.6 4 14.5a8 8 0 0 0 16 0C20 9.6 12 2 12 2z" />
    <path d="M8.5 15a3.5 3.5 0 0 0 7 0" strokeDasharray="2 2" />
  </svg>
)

const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

// ─── Save Notification ────────────────────────────────────────────────────────
const SaveNotification = ({ saveStatus, errorMessage, onClose }: { saveStatus: SaveStatus; errorMessage?: string; onClose: () => void }) => {
  if (saveStatus !== 'success' && saveStatus !== 'error') return null
  const isSuccess = saveStatus === 'success'
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full shadow-md flex-shrink-0 whitespace-nowrap" style={{ background: isSuccess ? '#628141' : '#ef4444' }}>
      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white flex-shrink-0">
        {isSuccess ? (
          <svg width="10" height="8" viewBox="0 0 12 9" fill="none">
            <path d="M1 4L4.5 7.5L11 1" stroke="#628141" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 2L10 10M10 2L2 10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="font-[Montserrat,sans-serif] font-semibold text-[12px] text-white">
        {isSuccess ? 'Data tersimpan!' : (errorMessage || 'Gagal menyimpan!')}
      </span>
      <button onClick={onClose} className="hover:opacity-80 transition-opacity">
        <X size={11} className="text-white" />
      </button>
    </div>
  )
}

// ─── Contextual Insight Detail Modal ─────────────────────────────────────────
const INSIGHT_DISCLAIMER_FALLBACK = INSIGHT_DISCLAIMER

const buildFallbackInsight = (label: string): ContextualInsight => ({
  id: 'no-pattern',
  fields: [],
  category: 'Cek Data',
  status: 'info',
  title: label,
  message: 'Data belum cukup untuk melihat pola.',
  based_on: [],
  action: { type: 'log', label: 'Catat' },
  disclaimer: INSIGHT_DISCLAIMER_FALLBACK,
  detail: {
    title: label,
    pattern_summary: 'Data belum cukup untuk melihat pola.',
    period: '',
    data_used: [],
    history: [],
    reason: 'Pola belum dapat dibentuk karena data pada periode pemantauan belum cukup atau belum valid.',
    action_text: 'Tambahkan catatan secara berkala untuk mendapatkan insight yang lebih lengkap.',
    disclaimer: INSIGHT_DISCLAIMER_FALLBACK,
  },
})

const ContextualInsightDetailModal = ({
  insight, onClose,
}: {
  insight: ContextualInsight | null; onClose: () => void
}) => {
  const open = insight !== null
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!insight) return null
  const d = insight.detail
  const c = STATUS_COLORS[insight.status]
  const heading = 'font-[Montserrat,sans-serif] font-bold text-sm text-slate-700 uppercase tracking-[0.5px]'
  const text = 'font-[Montserrat,sans-serif] font-normal text-sm text-slate-600 leading-[22px] m-0 whitespace-pre-line'
  const stateColor = (state: 'ok' | 'flag' | 'missing') =>
    state === 'flag' ? c.badgeText : state === 'missing' ? '#94a3b8' : '#334155'
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] sm:max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{ background: c.bg, borderBottom: `1px solid ${c.border}` }}>
          <div className="flex flex-col gap-1.5">
            <span className="font-[Montserrat,sans-serif] font-black text-lg text-slate-900">{d.title}</span>
            <span className="self-start font-[Montserrat,sans-serif] font-semibold text-xs px-2.5 py-1 rounded-full uppercase tracking-[0.5px]" style={{ background: c.badgeBg, color: c.badgeText, border: `1px solid ${c.badgeBorder}` }}>
              {insight.category}
            </span>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors border-none bg-transparent cursor-pointer flex-shrink-0 ml-4">
            <IconClose />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className={heading}>Ringkasan Pola</span>
            <p className={text}>{d.pattern_summary}</p>
          </div>
          {d.data_used.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
              <span className={heading}>Data yang Digunakan</span>
              <ul className="flex flex-col gap-1.5 m-0 pl-0 list-none">
                {d.data_used.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-2 w-2 h-2 rounded-full" style={{ background: c.badgeText }} />
                    <span className={text}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {d.history.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
              <span className={heading}>Riwayat</span>
              <ul className="flex flex-col m-0 pl-0 list-none rounded-xl overflow-hidden" style={{ border: '1px solid #f1f5f9' }}>
                {d.history.map((row, i) => (
                  <li key={row.date + i} className="flex items-center justify-between gap-3 px-3 py-2" style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                    <span className="font-[Montserrat,sans-serif] text-[13px] text-slate-600">{row.label}</span>
                    <span className="font-[Montserrat,sans-serif] text-[13px] font-semibold text-right" style={{ color: stateColor(row.state) }}>{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
            <span className={heading}>Alasan Insight Muncul</span>
            <p className={text}>{d.reason}</p>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
            <span className={heading}>Tindakan</span>
            <p className={text}>{d.action_text}</p>
          </div>
          <p className="font-[Montserrat,sans-serif] text-[11px] text-slate-400 leading-5 border-t border-slate-100 pt-4 m-0">
            {d.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card Base ───────────────────────────────────────────────────────────
const StatCardBase = ({
  icon, iconBg, label, children, sub, fieldInsight,
}: {
  icon: React.ReactNode; iconBg: string; label: string
  children: React.ReactNode; sub: React.ReactNode; fieldInsight?: ContextualInsight
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const c = STATUS_COLORS[fieldInsight?.status ?? 'info']
  return (
    <>
      <div
        className="rounded-2xl border shadow-sm flex-1 min-w-0 transition-colors"
        style={{ background: c.bg, borderColor: c.border }}
      >
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2 w-full">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>{icon}</div>
            <span className="text-[9px] font-semibold text-[#a8a29e] tracking-[0.5px] uppercase font-[Inter,sans-serif] flex-1 leading-tight">{label}</span>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 font-[Montserrat,sans-serif] font-semibold text-[10px] px-2 py-1 rounded-full transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ background: c.badgeBg, color: c.badgeText, border: `1px solid ${c.badgeBorder}` }}
            >
              Detail <span className="text-[11px] leading-none">→</span>
            </button>
          </div>
          {children}
          <div className="text-[10px] font-[Inter,sans-serif]" style={{ color: c.badgeText }}>{sub}</div>
        </div>
      </div>
      {modalOpen && (
        <ContextualInsightDetailModal
          insight={fieldInsight ?? buildFallbackInsight(label)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

// ─── Individual Stat Cards ────────────────────────────────────────────────────
type FieldInsightProps = { fieldInsight?: ContextualInsight }

const SupplementCard = ({ label = 'ASUPAN SUPLEMEN', category, value, fieldInsight }: { label?: string; category: CategoryType; value: number | null } & FieldInsightProps) => {
  const targetLabel = category === 'pregnant'
    ? 'Target: 1 Tablet TTD/hari'
    : category === 'breastfeeding'
    ? 'Target: ASI Booster/hari'
    : 'Target: 1 TTD/minggu'
  return (
    <StatCardBase icon={<PillIconSvg />} iconBg="#fef2f2" label={label} fieldInsight={fieldInsight} sub={<>{targetLabel}</>}>
      {value === null ? <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: '#cbd5e1', fontWeight: 700 }}>Belum ada data</span> : (
        <div className="flex flex-col gap-1">
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}%</span>
          <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{ width: `${value}%` }} />
          </div>
        </div>
      )}
    </StatCardBase>
  )
}

const FluidStatCard = ({ target, value, fieldInsight }: { target: number; value: number | null } & FieldInsightProps) => {
  return (
    <StatCardBase icon={<FluidIconSvg />} iconBg="#eff6ff" label="CAIRAN" fieldInsight={fieldInsight}
      sub={value !== null ? <>{target - value > 0 ? `${target - value} gelas lagi!` : 'Target tercapai!'}</> : <>Catatan hari ini</>}
    >
      {value === null ? <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: '#cbd5e1', fontWeight: 700 }}>Belum ada data</span> : (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}/{target}</span>
            <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">Gelas</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: target }, (_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${i < value ? 'bg-blue-400' : 'bg-white/60'}`} />
            ))}
          </div>
        </div>
      )}
    </StatCardBase>
  )
}

const insightSub = (fieldInsight: ContextualInsight | undefined, value: unknown) =>
  value === null ? <>Catatan hari ini</>
  : fieldInsight ? (
    <span className="flex items-center gap-1">
      {fieldInsight.status === 'safe' && <TrendUpIconSvg />}
      <span>{fieldInsight.title}</span>
    </span>
  ) : <>Tercatat hari ini</>

const RestStatCard = ({ value, fieldInsight }: { category: CategoryType; value: number | null } & FieldInsightProps) => (
  <StatCardBase icon={<MoonIconSvg />} iconBg="#f5f3ff" label="ISTIRAHAT" fieldInsight={fieldInsight} sub={insightSub(fieldInsight, value)}>
    {value === null ? <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: '#cbd5e1', fontWeight: 700 }}>Belum ada data</span> : (
      <div className="flex items-baseline gap-1">
        <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
        <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">jam</span>
      </div>
    )}
  </StatCardBase>
)

const MOOD_INT_LABELS: Record<number, { emoji: string; label: string }> = {
  5: { emoji: '😄', label: 'Bahagia' },
  4: { emoji: '😊', label: 'Nyaman' },
  3: { emoji: '😐', label: 'Biasa' },
  2: { emoji: '😴', label: 'Lelah' },
  1: { emoji: '😢', label: 'Sedih' },
}

const MoodStatCard = ({ value, fieldInsight }: { category: CategoryType; value: number | null } & FieldInsightProps) => {
  const moodInfo = value !== null ? MOOD_INT_LABELS[value] : null
  return (
    <StatCardBase icon={<SmileIconSvg />} iconBg="#f0fdf4" label="SUASANA HATI" fieldInsight={fieldInsight} sub={insightSub(fieldInsight, value)}>
      {value === null ? <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: '#cbd5e1', fontWeight: 700 }}>Belum ada data</span> : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl leading-none">{moodInfo?.emoji}</span>
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none capitalize">{moodInfo?.label}</span>
        </div>
      )}
    </StatCardBase>
  )
}

const CycleStatCard = ({ value, fieldInsight }: { value: string | null } & FieldInsightProps) => (
  <StatCardBase icon={<CalendarIconSvg />} iconBg="#fdf2f8" label="PEMANTAU SIKLUS" fieldInsight={fieldInsight} sub={insightSub(fieldInsight, value)}>
    {value === null ? <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: '#cbd5e1', fontWeight: 700 }}>Belum ada data</span> : (
      <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
    )}
  </StatCardBase>
)

const MomWeightCard = ({ value, fieldInsight }: { value: number | null } & FieldInsightProps) => (
  <StatCardBase icon={<WeightIconSvg />} iconBg="#fdf2f8" label="BERAT BADAN IBU" fieldInsight={fieldInsight} sub={insightSub(fieldInsight, value)}>
    {value === null ? <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: '#cbd5e1', fontWeight: 700 }}>Belum ada data</span> : (
      <div className="flex items-baseline gap-1">
        <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
        <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">kg</span>
      </div>
    )}
  </StatCardBase>
)

const PumpingStatCard = ({ value, fieldInsight }: { value: number | null } & FieldInsightProps) => (
  <StatCardBase icon={<DropIconSvg />} iconBg="#fdf2f8" label="MENYUSUI & MEMOMPA ASI" fieldInsight={fieldInsight} sub={insightSub(fieldInsight, value)}>
    {value === null ? <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: '#cbd5e1', fontWeight: 700 }}>Belum ada data</span> : (
      <div className="flex items-baseline gap-1">
        <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
        <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">sesi</span>
      </div>
    )}
  </StatCardBase>
)

// ─── Stats Grid ───────────────────────────────────────────────────────────────
type FieldInsights = Partial<Record<InsightFieldKey, ContextualInsight>>

const StatsGrid = ({
  category, bp, todayLog, fieldInsights, fluidTarget,
}: {
  category: CategoryType
  bp: 'mobile' | 'tablet' | 'desktop'
  todayLog: ApiHealthLog | null
  fieldInsights: FieldInsights
  fluidTarget: number
}) => {
  const suppLabel = category === 'breastfeeding' ? 'ASUPAN ZAT BESI' : 'ASUPAN SUPLEMEN'
  const hasData = todayLog !== null && todayLog.profile_type === CATEGORY_TO_PROFILE[category]
  const todaySuppPct = hasData && todayLog ? (todayLog.took_supplement ? 100 : 0) : null
  const todayGlasses = hasData && todayLog ? todayLog.water_glasses : null
  const todaySleep = hasData && todayLog ? todayLog.sleep_hours : null
  const todayMood = hasData && todayLog ? todayLog.mood : null
  const todayMensStr = hasData && todayLog ? (todayLog.is_menstruating ? 'Sedang haid' : 'Tidak haid') : null
  const todayWeight = hasData && todayLog?.weight_kg != null ? todayLog.weight_kg : null
  const todayPumping = hasData && todayLog?.breastfeeding_count != null ? todayLog.breastfeeding_count : null

  const card5 = category === 'teenage'
    ? <CycleStatCard value={todayMensStr} fieldInsight={fieldInsights.cycle} />
    : category === 'pregnant'
    ? <MomWeightCard value={todayWeight} fieldInsight={fieldInsights.weight} />
    : <PumpingStatCard value={todayPumping} fieldInsight={fieldInsights.breastfeeding} />

  if (bp === 'mobile') return (
    <div className="flex flex-col gap-3 w-full">
      <SupplementCard label={suppLabel} category={category} value={todaySuppPct} fieldInsight={fieldInsights.supplement} />
      <FluidStatCard target={fluidTarget} value={todayGlasses} fieldInsight={fieldInsights.hydration} />
      <RestStatCard category={category} value={todaySleep} fieldInsight={fieldInsights.sleep} />
      <MoodStatCard category={category} value={todayMood} fieldInsight={fieldInsights.mood} />
      {card5}
    </div>
  )
  if (bp === 'tablet') return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-3 gap-3">
        <SupplementCard label={suppLabel} category={category} value={todaySuppPct} fieldInsight={fieldInsights.supplement} />
        <FluidStatCard target={fluidTarget} value={todayGlasses} fieldInsight={fieldInsights.hydration} />
        <RestStatCard category={category} value={todaySleep} fieldInsight={fieldInsights.sleep} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MoodStatCard category={category} value={todayMood} fieldInsight={fieldInsights.mood} />
        {card5}
      </div>
    </div>
  )
  return (
    <div className="flex gap-4 w-full">
      <SupplementCard label={suppLabel} category={category} value={todaySuppPct} fieldInsight={fieldInsights.supplement} />
      <FluidStatCard target={fluidTarget} value={todayGlasses} fieldInsight={fieldInsights.hydration} />
      <RestStatCard category={category} value={todaySleep} fieldInsight={fieldInsights.sleep} />
      <MoodStatCard category={category} value={todayMood} fieldInsight={fieldInsights.mood} />
      {card5}
    </div>
  )
}

// ─── Contextual Health Insight Card ──────────────────────────────────────────
const TELE_CONSULTATION_PATH = '/tele-nutritionist'
const ARTICLES_PATH = '/artikel'

const ContextualInsightCard = ({
  insight, period, customStart, customEnd, onLogClick, onDetail, allLogs,
}: {
  insight: ContextualInsight
  period: FieldPeriod
  customStart?: string
  customEnd?: string
  onLogClick: () => void
  onDetail: () => void
  allLogs: ApiHealthLog[]
}) => {
  const navigate = useNavigate()
  const c = STATUS_COLORS[insight.status]
  const handleAction = () => {
    if (insight.action.type === 'log') onLogClick()
    else if (insight.action.type === 'consult') navigate(TELE_CONSULTATION_PATH)
    else navigate(ARTICLES_PATH)
  }

  // Ringkasan angka memakai periode yang sama dengan insight (termasuk rentang kustom)
  const filtered = filterLogsByPeriod(allLogs, period, customStart, customEnd)
  const profile = filtered.length > 0 ? filtered[0].profile_type : null
  const sameProfile = profile ? filtered.filter(l => l.profile_type === profile) : []
  const totalLogs = sameProfile.length
  const avgSleep = average(sameProfile.map(l => l.sleep_hours))
  const avgWater = average(sameProfile.map(l => l.water_glasses))
  const supplementDays = sameProfile.filter(l => l.took_supplement).length
  const tiredDays = sameProfile.filter(l => l.mood <= 2).length

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-2xl bg-white"
      style={{ border: `1.5px solid ${c.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
    >
      {/* Header: Kategori + Label Periode */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <span
          className="inline-flex items-center font-[Montserrat,sans-serif] font-bold text-[11px] px-3 py-1.5 rounded-full uppercase tracking-[0.5px]"
          style={{ background: c.badgeBg, color: c.badgeText, border: `1px solid ${c.badgeBorder}` }}
        >
          {insight.category}
        </span>
        <span className="font-[Montserrat,sans-serif] text-[10px] font-semibold text-slate-400 uppercase tracking-[0.5px]">
          {period === 'custom' ? 'Rentang Kustom' : PERIOD_LABELS[period]}
        </span>
      </div>

      {/* Title + Message */}
      <div className="flex flex-col gap-2">
        <h3 className="font-[Montserrat,sans-serif] font-bold text-[17px] text-slate-900 leading-tight m-0">{insight.title}</h3>
        <p className="font-[Montserrat,sans-serif] text-sm text-slate-600 leading-[22px] m-0">{insight.message}</p>
      </div>

      {/* Rata-rata per Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="flex flex-col gap-1 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="font-[Montserrat,sans-serif] text-[10px] text-slate-500 uppercase tracking-[0.5px] font-semibold">Rata-rata Tidur</span>
          <span className="font-[Montserrat,sans-serif] font-bold text-[15px] text-slate-900">{totalLogs > 0 ? `${round1(avgSleep)} jam` : 'Belum ada data'}</span>
        </div>
        <div className="flex flex-col gap-1 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="font-[Montserrat,sans-serif] text-[10px] text-slate-500 uppercase tracking-[0.5px] font-semibold">Rata-rata Cairan</span>
          <span className="font-[Montserrat,sans-serif] font-bold text-[15px] text-slate-900">{totalLogs > 0 ? `${round1(avgWater)} gelas` : 'Belum ada data'}</span>
        </div>
        <div className="flex flex-col gap-1 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="font-[Montserrat,sans-serif] text-[10px] text-slate-500 uppercase tracking-[0.5px] font-semibold">Suplemen</span>
          <span className="font-[Montserrat,sans-serif] font-bold text-[15px] text-slate-900">{totalLogs > 0 ? `${supplementDays}/${totalLogs} hari` : 'Belum ada data'}</span>
        </div>
        <div className="flex flex-col gap-1 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="font-[Montserrat,sans-serif] text-[10px] text-slate-500 uppercase tracking-[0.5px] font-semibold">Mood Negatif</span>
          <span className="font-[Montserrat,sans-serif] font-bold text-[15px] text-slate-900">{totalLogs > 0 ? `${tiredDays} hari` : 'Belum ada data'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleAction}
          className="font-[Montserrat,sans-serif] font-bold text-xs px-4 py-2.5 rounded-lg border-none cursor-pointer text-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
          style={{ background: '#4d7c0f' }}
        >
          {insight.action.label}
        </button>
        <button
          type="button"
          onClick={onDetail}
          className="font-[Montserrat,sans-serif] font-bold text-xs px-4 py-2.5 rounded-lg border cursor-pointer bg-white hover:bg-slate-50 transition-colors"
          style={{ color: c.badgeText, borderColor: c.border }}
        >
          Lihat Detail
        </button>
      </div>

      {/* Disclaimer */}
      <p className="font-[Montserrat,sans-serif] text-[10px] text-slate-400 leading-4 border-t border-slate-100 pt-3 m-0">
        {insight.disclaimer}
      </p>
    </div>
  )
}

const ContextualInsightSection = ({
  insights, period, customStart, customEnd, onLogClick, allLogs,
}: {
  insights: ContextualInsight[]
  period: FieldPeriod
  customStart?: string
  customEnd?: string
  onLogClick: () => void
  allLogs: ApiHealthLog[]
}) => {
  const [detailInsight, setDetailInsight] = useState<ContextualInsight | null>(null)
  if (insights.length === 0) return null
  return (
    <section aria-label="Contextual Health Insight" className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-[Montserrat,sans-serif] font-extrabold text-base text-slate-800 tracking-tight m-0">
            Contextual Health Insight
          </h2>
          <p className="font-[Montserrat,sans-serif] text-xs text-slate-500 m-0">
            Analisis gabungan dari catatan pada periode yang dipilih, untuk peran pada catatan terbaru
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {insights.map(insight => (
          <ContextualInsightCard
            key={insight.id}
            insight={insight}
            period={period}
            customStart={customStart}
            customEnd={customEnd}
            onLogClick={onLogClick}
            onDetail={() => setDetailInsight(insight)}
            allLogs={allLogs}
          />
        ))}
      </div>
      <ContextualInsightDetailModal insight={detailInsight} onClose={() => setDetailInsight(null)} />
    </section>
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
  const specificHeader = category === 'teenage' ? 'Menstruasi' : category === 'pregnant' ? 'Berat Badan' : 'Memompa ASI'
  const supplementHeader = category === 'breastfeeding' ? 'Zat Besi' : 'Suplemen'
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
            {['Hari', 'Tanggal', 'Suasana Hati', 'Tidur', 'Cairan', supplementHeader, specificHeader, ...(showActions ? ['Aksi'] : [])].map(col => (
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
                    <button onClick={() => onEdit && onEdit(i)} title="Edit"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#628141] hover:bg-[rgba(98,129,65,0.1)] transition-colors border-none bg-transparent cursor-pointer">
                      <IconEdit />
                    </button>
                    <button onClick={() => onDelete && onDelete(i)} title="Delete"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer">
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
                Belum ada data tercatat.
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
            <span className="font-[Montserrat,sans-serif] font-bold text-xl text-slate-900">Seluruh Catatan Kesehatan</span>
            <span className="font-[Montserrat,sans-serif] text-sm text-slate-500">Riwayat lengkap</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer ml-4"><IconClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <LogsTable data={logs} category={category} isMobile={false} onEdit={(i) => { onEdit(i); onClose() }} onDelete={onDelete} />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <span className="font-[Montserrat,sans-serif] text-sm text-slate-400">{logs.length} riwayat</span>
          <button onClick={onClose} className="font-[Montserrat,sans-serif] font-bold text-sm text-white bg-[#628141] hover:bg-[#3f6212] transition-colors px-5 py-2 rounded-lg border-none cursor-pointer">Tutup</button>
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
    <div id="recent-logs" className={`bg-white rounded-[24px] border border-[#f0f0ee] shadow-sm ${isMobile ? 'px-4 py-4' : 'px-6 py-5'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-base text-[#292524] font-['Plus_Jakarta_Sans',sans-serif]">Seluruh Catatan Kesehatan</span>
        <button onClick={() => setModalOpen(true)} className="font-[Montserrat,sans-serif] font-semibold text-xs text-[#65a30d] tracking-[0.6px] uppercase hover:text-[#4d7c0f] bg-transparent border-none cursor-pointer p-0 transition-colors">
          LIHAT SEMUA
        </button>
      </div>
      <LogsTable data={previewData} category={category} isMobile={isMobile} onEdit={onEdit} onDelete={onDelete} />
      <AllLogsModal open={modalOpen} onClose={() => setModalOpen(false)} category={category} logs={logs} onEdit={onEdit} onDelete={onDelete} />
    </div>
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
  errorMessage?: string
}

const LogEntryModal = (props: LogEntryModalProps) => {
  const {
    open, onClose, category, saveStatus, onSave,
    mood, setMood, fluid, setFluid, sleep, setSleep, logDate, setLogDate,
    ttdTaken, setTtdTaken, isMenstruating, setIsMenstruating,
    supplementTaken, setSupplementTaken, momWeight, setMomWeight,
    supplementBfTaken, setSupplementBfTaken, nursingCount, setNursingCount,
    fluidError, sleepError, isEditing, errorMessage
  } = props
  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  const suppChecked = category === 'teenage' ? ttdTaken : category === 'pregnant' ? supplementTaken : supplementBfTaken
  const suppOnChange = category === 'teenage' ? setTtdTaken : category === 'pregnant' ? setSupplementTaken : setSupplementBfTaken
  const leftTitle = category === 'teenage' ? 'Tablet Tambah Darah (TTD)' : 'Asupan Suplemen'
  const leftSubtitle = category === 'teenage' ? 'Sudah minum TTD hari ini?' : 'Sudah minum vitamin hari ini?'
  const pumpingNum = parseInt(nursingCount)
  const pumpingLow = !isNaN(pumpingNum) && pumpingNum > 0 && pumpingNum < 6
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <style>{`
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinner { -moz-appearance: textfield; appearance: textfield; }
      `}</style>
      <div className="bg-white rounded-[22px] w-full max-w-[640px] shadow-2xl relative overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>
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
              <SaveNotification saveStatus={saveStatus} errorMessage={errorMessage} onClose={onClose} />
            )}
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="px-5 pt-3 pb-5 flex flex-col gap-3">
            <div className="bg-[#f5f5f4] rounded-[16px] p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ecfccb] flex items-center justify-center flex-shrink-0"><SmileIconSvg /></div>
                <div>
                  <p className="font-bold text-sm text-[#1c1917] font-[Montserrat,sans-serif]">Pemantau Suasana Hati</p>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">{leftTitle}</p>
                    <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif] mt-0.5">{leftSubtitle}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#d0ebb8] flex items-center justify-center flex-shrink-0"><AnemiaIconSvg /></div>
                </div>
                <div className="bg-[#e6e9e4] rounded-[40px] h-[52px] flex items-center px-4">
                  <Checkbox checked={suppChecked} onChange={suppOnChange} label="Sudah Konsumsi" />
                </div>
              </div>
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                {category === 'teenage' && (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Pemantau Siklus</p>
                        <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif] mt-0.5">Sedang haid hari ini?</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[rgba(178,83,142,0.15)] flex items-center justify-center flex-shrink-0"><CalendarIconSvg /></div>
                    </div>
                    <div className="bg-[#e6e9e4] rounded-[40px] h-[52px] flex items-center px-4">
                      <Checkbox checked={isMenstruating} onChange={setIsMenstruating} label="Menstruasi" />
                    </div>
                  </>
                )}
                {category === 'pregnant' && (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Berat Badan Ibu</p>
                        <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif] mt-0.5">Catat berat badan terkini</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[rgba(178,83,142,0.15)] flex items-center justify-center flex-shrink-0"><WeightIconSvg /></div>
                    </div>
                    <div
                      className="relative h-[52px] rounded-[40px] flex items-center px-4 overflow-hidden transition-colors"
                      style={{ background: '#e6e9e4', border: '1.5px solid transparent' }}
                    >
                      <input type="number" value={momWeight} onChange={e => setMomWeight(e.target.value)} placeholder="0" min={0} max={200}
                        className="no-spinner flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
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
                    <div
                      className="relative h-[52px] rounded-[40px] flex items-center px-4 overflow-hidden transition-colors"
                      style={{ background: pumpingLow ? '#FFEBEE' : '#e6e9e4', border: `1.5px solid ${pumpingLow ? '#FFCDD2' : 'transparent'}` }}
                    >
                      <input type="number" value={nursingCount} onChange={e => setNursingCount(e.target.value)} placeholder="0" min={0} max={30}
                        className="no-spinner flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                      <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">sesi</span>
                    </div>
                    {pumpingLow && (
                      <p className="text-[11px] font-semibold text-red-600 font-[Montserrat,sans-serif] pl-1">
                        ⚠ Status: RENDAH - Di bawah 6 sesi/hari. Tingkatkan frekuensi memompa.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#d0ebb8] flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#546b43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 2h14l-2 16H7L5 2z" /><path d="M5 8h14" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Asupan Cairan</p>
                    <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif]">Jumlah gelas (250ml)</p>
                  </div>
                </div>
                <div className={`relative h-[52px] rounded-[40px] flex items-center px-4 overflow-hidden ${fluidError ? 'bg-[#fde8e8]' : 'bg-[#e6e9e4]'}`}>
                  <input type="number" value={fluid} onChange={e => setFluid(e.target.value)} placeholder="0" min={0} max={20}
                    className="no-spinner flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                  <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">Gelas</span>
                </div>
                {fluidError && <span className="text-red-500 font-[Montserrat,sans-serif] text-[11px] font-semibold pl-1">{fluidError}</span>}
              </div>
              <div className="bg-white rounded-[16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#d0ebb8] flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#546b43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]">Rest &amp; Sleep</p>
                    <p className="text-[10px] text-[#42493b] font-[Montserrat,sans-serif]">Durasi tidur (jam)</p>
                  </div>
                </div>
                <div className={`relative h-[52px] rounded-[40px] flex items-center px-4 overflow-hidden ${sleepError ? 'bg-[#fde8e8]' : 'bg-[#e6e9e4]'}`}>
                  <input type="number" value={sleep} onChange={e => setSleep(e.target.value)} placeholder="0" min={0} max={24} step={0.5}
                    className="no-spinner flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                  <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">Jam</span>
                </div>
                {sleepError && <span className="text-red-500 font-[Montserrat,sans-serif] text-[11px] font-semibold pl-1">{sleepError}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button onClick={onSave} className="flex-1 h-[46px] rounded-full bg-[#4d7c0f] hover:bg-[#3f6212] transition-colors font-[Montserrat,sans-serif] font-black text-sm text-white tracking-widest shadow-md">
                {isEditing ? 'PERBARUI CATATAN' : 'SIMPAN CATATAN'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
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
            {day ? (() => {
              const cellDate = new Date(viewYear, viewMonth, day)
              const isFuture = cellDate > new Date()
              return (
                <button
                  disabled={isFuture}
                  onClick={() => handleSelect(day)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${isSelected(day)
                    ? 'bg-[#628141] text-white'
                    : isFuture
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-[#f0f7e8] hover:text-[#628141]'
                  }`}
                >
                  {day}
                </button>
              )
            })() : <span />}
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
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#628141" strokeWidth="2" />
          <path d="M16 2v4M8 2v4M3 10h18" stroke="#628141" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-bold text-sm text-[#628141] font-[Montserrat,sans-serif] whitespace-nowrap">
          {value || 'DD/MM/YYYY'}
        </span>
      </button>
      {open && <CalendarPicker value={value} onChange={v => { onChange(v); setOpen(false) }} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
const Checkbox = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none group">
    <span
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 flex-shrink-0 rounded-[5px] border-2 flex items-center justify-center transition-all
        ${checked ? 'bg-[#65a30d] border-[#65a30d]' : 'bg-white border-slate-300 group-hover:border-[#65a30d]'}`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    <span className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]" onClick={() => onChange(!checked)}>{label}</span>
  </label>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HealthLog() {
  const bp = useBreakpoint()
  const { user } = useAuth()
  const userName = user?.nama?.split(' ')[0] ?? 'Kamu'

  const [activeCategory, setActiveCategory] = useState<CategoryType>('teenage')
  const [pendingCategory, setPendingCategory] = useState<CategoryType | null>(null)

  const handleCategoryChange = (cat: CategoryType) => {
    if (cat === activeCategory) return
    // Cek apakah ada log untuk kategori saat ini
    const currentLogs = allLogs.filter(l => l.profile_type === CATEGORY_TO_PROFILE[activeCategory])
    if (currentLogs.length > 0) {
      setPendingCategory(cat)
    } else {
      setActiveCategory(cat)
    }
  }

  const [allLogs, setAllLogs] = useState<ApiHealthLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [todayLog, setTodayLog] = useState<ApiHealthLog | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveErrorMessage, setSaveErrorMessage] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [fieldPeriod, setFieldPeriod] = useState<FieldPeriod>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [mood, setMood] = useState('biasa')
  const [fluid, setFluid] = useState('')
  const [sleep, setSleep] = useState('')
  const today = new Date()
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
  const [logDate, setLogDate] = useState(todayStr)
  const [ttdTaken, setTtdTaken] = useState(false)
  const [isMenstruating, setIsMenstruating] = useState(false)
  const [supplementTaken, setSupplementTaken] = useState(false)
  const [momWeight, setMomWeight] = useState('')
  const [supplementBfTaken, setSupplementBfTaken] = useState(false)
  const [nursingCount, setNursingCount] = useState('')

  const [fluidError, setFluidError] = useState<string | undefined>()
  const [sleepError, setSleepError] = useState<string | undefined>()

  useEffect(() => {
    setLogsLoading(true)
    healthLogService.getAllLogs()
      .then(apiLogs => {
        // PERBAIKAN UTAMA: Selalu urutkan descending berdasarkan format ISO (YYYY-MM-DD)
        const sorted = [...apiLogs].sort((a, b) => b.date.localeCompare(a.date))
        setAllLogs(sorted)
        
        const todayIso = getLocalISODate()
        const todayEntry = sorted.find(l => l.date === todayIso)
        setTodayLog(todayEntry ?? null)
        
        if (sorted.length > 0) {
          const latestProfile = sorted[0].profile_type
          if (latestProfile === 'teen') setActiveCategory('teenage')
          else if (latestProfile === 'pregnant') setActiveCategory('pregnant')
          else if (latestProfile === 'breastfeeding') setActiveCategory('breastfeeding')
        }
      })
      .catch(() => { })
      .finally(() => setLogsLoading(false))
  }, [])

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 3500)
  }

  const activeRole: RoleType = CATEGORY_TO_PROFILE[activeCategory] as RoleType

  // CHI-05: usia bayi (bulan) untuk target cairan ibu menyusui.
  // TODO: isi dari data anak di Growth Tracker, mis. getBabyAgeMonths(child.birth_date).
  // Selama null, target memakai BREASTFEEDING_FLUID_TARGET_DEFAULT (menunggu keputusan stakeholder).
  const babyAgeMonths: number | null = null
  const activeFluidTarget = getFluidTargets(activeRole, babyAgeMonths).target
  
  const activeCategoryLogs = useMemo(
    () => allLogs.filter(l => l.profile_type === CATEGORY_TO_PROFILE[activeCategory]),
    [allLogs, activeCategory]
  )
  
  const activeCategoryRows = useMemo(
    () => activeCategoryLogs.map(mapLogToRow),
    [activeCategoryLogs]
  )
  
  const activeCategoryIds = useMemo(
    () => activeCategoryLogs.map(l => l.id),
    [activeCategoryLogs]
  )

  // Field insights (berbasis periode global / kustom)
  const fieldInsights: FieldInsights = useMemo(() => {
    if (activeCategoryLogs.length === 0) return {}
    return {
      supplement: getSupplementInsight(activeCategoryLogs, activeRole, fieldPeriod, customStart, customEnd),
      hydration: getFluidInsight(activeCategoryLogs, activeRole, fieldPeriod, babyAgeMonths, customStart, customEnd),
      sleep: getRestInsight(activeCategoryLogs, activeRole, fieldPeriod, customStart, customEnd),
      mood: getMoodInsight(activeCategoryLogs, activeRole, fieldPeriod, customStart, customEnd),
      ...(activeRole === 'teen' ? { cycle: getCycleInsight(activeCategoryLogs, fieldPeriod, customStart, customEnd) } : {}),
      ...(activeRole === 'pregnant' ? { weight: getMomWeightInsight(activeCategoryLogs, fieldPeriod, customStart, customEnd) } : {}),
      ...(activeRole === 'breastfeeding' ? { breastfeeding: getPumpingInsight(activeCategoryLogs, fieldPeriod, customStart, customEnd) } : {}),
    }
  }, [activeCategoryLogs, activeRole, fieldPeriod, babyAgeMonths, customStart, customEnd])

  // Contextual insight (gabungan) — memakai periode global
  const contextualInsight = useMemo(() => {
    if (allLogs.length === 0) return null
    return generateContextualInsight(allLogs, fieldPeriod, babyAgeMonths, customStart, customEnd)
  }, [allLogs, fieldPeriod, babyAgeMonths, customStart, customEnd])

  const contextualInsights = contextualInsight ? [contextualInsight] : []

  const validateAndSave = async () => {
    let hasError = false
    if (!fluid.trim() || isNaN(Number(fluid)) || Number(fluid) < 0) {
      setFluidError('Masukkan jumlah gelas yang valid (contoh: 6).')
      hasError = true
    } else if (Number(fluid) > 20) {
      setFluidError('Jumlah cairan maksimal 20 gelas.')
      hasError = true
    } else { setFluidError(undefined) }
    if (!sleep.trim() || isNaN(Number(sleep)) || Number(sleep) < 0) {
      setSleepError('Masukkan durasi tidur yang valid (contoh: 7.5).')
      hasError = true
    } else if (Number(sleep) > 24) {
      setSleepError('Durasi tidur maksimal 24 jam.')
      hasError = true
    } else { setSleepError(undefined) }
    if (hasError) return

    const profile = CATEGORY_TO_PROFILE[activeCategory]
    const moodInt = MOOD_STR_TO_INT[mood] ?? 3
    const isoDate = toISODate(logDate)
    const logDateObj = new Date(isoDate)
    const todayObj = new Date()
    todayObj.setHours(0, 0, 0, 0)
    logDateObj.setHours(0, 0, 0, 0)
    let maxToday = todayObj
    try {
      const wibStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
      const [wy, wm, wd] = wibStr.split('-').map(Number)
      const wibDate = new Date(wy, wm - 1, wd)
      if (wibDate > maxToday) maxToday = wibDate
    } catch (_) {
      // Fallback to local date if Intl is unavailable
    }
    if (logDateObj > maxToday) {
      alert("Tanggal catatan kesehatan tidak boleh di masa depan.")
      return
    }
    const took = activeCategory === 'teenage' ? ttdTaken
      : activeCategory === 'pregnant' ? supplementTaken
        : supplementBfTaken

    const payload: Parameters<typeof healthLogService.createOrUpdate>[0] = {
      date: isoDate,
      profile_type: profile,
      water_glasses: Number(fluid),
      sleep_hours: Number(sleep),
      took_supplement: took,
      mood: moodInt,
      ...(activeCategory === 'teenage' && { is_menstruating: isMenstruating }),
      ...(activeCategory === 'pregnant' && momWeight ? { weight_kg: parseFloat(momWeight) } : {}),
      ...(activeCategory === 'breastfeeding' && nursingCount ? { breastfeeding_count: parseInt(nursingCount, 10) } : {}),
      is_edit: editIndex !== null,
    }

    try {
      const saved = await healthLogService.createOrUpdate(payload)
      
      setAllLogs(prev => {
        const filtered = prev.filter(l => l.id !== saved.id)
        return [saved, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
      })
      
      const todayIso = getLocalISODate()
      if (saved.date === todayIso) {
        setTodayLog(saved)
      }
      setSaveStatus('success')
      setTimeout(() => { setSaveStatus('idle'); setModalOpen(false); setEditIndex(null) }, 2000)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menyimpan!'
      setSaveErrorMessage(msg)
      setSaveStatus('error')
      setTimeout(() => {
        setSaveStatus('idle')
        setSaveErrorMessage('')
      }, 3500)
    }
  }

  const handleEdit = (index: number) => {
    const row = activeCategoryRows[index]
    if (!row) return
    
    const moodOpt = MOOD_OPTIONS.find(m => m.label.toLowerCase() === row.mood.toLowerCase())
    setMood(moodOpt?.value ?? 'biasa')
    setFluid(row.fluid.replace(' Gelas', '').trim())
    setSleep(row.sleep.replace(' jam', '').replace('h', '').trim())
    try {
      const parts = row.date.split(' ')
      const monthMap: Record<string, string> = { Januari: '01', Februari: '02', Maret: '03', April: '04', Mei: '05', Juni: '06', Juli: '07', Agustus: '08', September: '09', Oktober: '10', November: '11', Desember: '12' }
      const d = parts[0].padStart(2, '0')
      const m = monthMap[parts[1]] ?? '01'
      const y = parts[2]
      setLogDate(`${d}/${m}/${y}`)
    } catch { setLogDate(todayStr) }
    if (activeCategory === 'teenage') setTtdTaken(row.supplement.startsWith('✓'))
    else if (activeCategory === 'pregnant') setSupplementTaken(row.supplement.startsWith('✓'))
    else setSupplementBfTaken(row.supplement.startsWith('✓'))
    if (activeCategory === 'teenage') setIsMenstruating(row.specific === 'Sedang Haid')
    else if (activeCategory === 'pregnant') setMomWeight(row.specific.replace('BB: ', '').replace(' Kg', '').trim())
    else setNursingCount(row.specific.replace('Pumping: ', '').replace(' Sesi', '').trim())
    setFluidError(undefined); setSleepError(undefined)
    setSaveStatus('idle'); setEditIndex(index); setModalOpen(true)
  }

  const handleDelete = (index: number) => { setDeleteIndex(index) }

  const confirmDelete = async () => {
    if (deleteIndex === null || deleting) return
    const index = deleteIndex
    const id = activeCategoryIds[index]
    if (id === undefined) {
      setDeleteIndex(null)
      showNotice('error', 'Catatan tidak dapat dihapus karena ID tidak ditemukan.')
      return
    }
    setDeleting(true)
    try {
      await healthLogService.deleteLog(id)
      
      setAllLogs(prev => prev.filter(l => l.id !== id))
      
      if (editIndex === index) setEditIndex(null)
      else if (editIndex !== null && index < editIndex) setEditIndex(editIndex - 1)
      setTodayLog(prev => (prev && prev.id === id ? null : prev))
      showNotice('success', 'Catatan berhasil dihapus.')
    } catch (err: any) {
      showNotice('error', err?.response?.data?.message || 'Gagal menghapus catatan. Silakan coba lagi.')
    } finally {
      setDeleting(false)
      setDeleteIndex(null)
    }
  }

  const handleOpenModal = () => {
    setMood('biasa'); setFluid(''); setSleep(''); setLogDate(todayStr)
    setTtdTaken(false); setIsMenstruating(false)
    setSupplementTaken(false); setMomWeight('')
    setSupplementBfTaken(false); setNursingCount('')
    setFluidError(undefined); setSleepError(undefined)
    setSaveStatus('idle'); setEditIndex(null); setModalOpen(true)
  }

  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const meta = CATEGORY_META[activeCategory]

  const CategoryTabs = () => (
    <div className="flex items-center gap-1 p-[4px] rounded-full relative" style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
      {(['teenage', 'pregnant', 'breastfeeding'] as CategoryType[]).map(cat => (
        <button
          key={cat}
          onClick={() => handleCategoryChange(cat)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold font-[Inter,sans-serif] relative transition-colors duration-200"
          style={{
            background: 'transparent',
            color: activeCategory === cat ? '#65a30d' : '#78716c',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span className="relative z-10">{CATEGORY_META[cat].tab}</span>
          {activeCategory === cat && (
            <motion.span
              layoutId="activeCategoryTab"
              className="absolute inset-0 bg-white rounded-full shadow-sm"
              style={{ zIndex: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
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
              <h1 className="font-extrabold text-[24px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Halo, <span className="text-[#65a30d]">{userName}</span> 👋</h1>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase font-[Inter,sans-serif]" style={{ background: '#ecfccb', color: '#65a30d' }}>{meta.badge}</span>
                <span className="text-xs text-[#78716c] font-[Inter,sans-serif]">• Pantau jurnal kesehatanmu.</span>
              </div>
            </div>
            <div className="flex items-center gap-1 p-[4px] rounded-full w-full relative" style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              {(['teenage', 'pregnant', 'breastfeeding'] as CategoryType[]).map(cat => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className="flex-1 py-1.5 rounded-full text-[10px] font-semibold font-[Inter,sans-serif] relative transition-colors duration-200"
                  style={{ background: 'transparent', color: activeCategory === cat ? '#65a30d' : '#78716c', border: 'none', cursor: 'pointer' }}
                >
                  <span className="relative z-10">{CATEGORY_META[cat].tab}</span>
                  {activeCategory === cat && (
                    <motion.span layoutId="activeCategoryTabMobile" className="absolute inset-0 bg-white rounded-full shadow-sm" style={{ zIndex: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
            <LogDataButton fullWidth />
          </div>
        ) : isTablet ? (
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex flex-col gap-1">
              <h1 className="font-extrabold text-[26px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Halo, <span className="text-[#65a30d]">{userName}</span> 👋</h1>
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
              <h1 className="font-extrabold text-[28px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Halo, <span className="text-[#65a30d]">{userName}</span> 👋</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.55px] uppercase font-[Inter,sans-serif]" style={{ background: '#ecfccb', color: '#65a30d' }}>{meta.badge}</span>
                <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">• Pantau jurnal kesehatanmu.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-nowrap flex-shrink-0"><CategoryTabs /><LogDataButton /></div>
          </div>
        )}

        {/* ── Period Selector Global ── */}
        <div className="mb-5 bg-white rounded-2xl border border-[#f0f0ee] shadow-sm px-4 py-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ecfccb] flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#65a30d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-[Montserrat,sans-serif] text-[13px] font-bold text-slate-800 leading-tight">Periode Analisis</span>
              <span className="font-[Inter,sans-serif] text-[10px] text-slate-400 leading-tight">Pilih rentang waktu untuk melihat insight</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preset Buttons */}
            <div className="flex items-center gap-1 p-[3px] rounded-full bg-slate-100 border border-slate-200">
              {(['week', '15days', 'month', 'all'] as FieldPeriod[]).map(opt => (
                <button
                  key={opt}
                  onClick={() => { setFieldPeriod(opt); setCustomStart(''); setCustomEnd('') }}
                  className={`font-[Montserrat,sans-serif] text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                    fieldPeriod === opt
                      ? 'bg-white text-[#4d7c0f] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {PERIOD_LABELS[opt]}
                </button>
              ))}
            </div>

            {/* Custom Toggle & Inputs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFieldPeriod('custom')}
                className={`font-[Montserrat,sans-serif] text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 border ${
                  fieldPeriod === 'custom'
                    ? 'bg-[#4d7c0f] text-white border-[#4d7c0f] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Kustom
              </button>

              {fieldPeriod === 'custom' && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="font-[Montserrat,sans-serif] text-[11px] px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#65a30d]/20 focus:border-[#65a30d] transition-all"
                  />
                  <span className="font-[Montserrat,sans-serif] text-[11px] text-slate-400 font-medium">s/d</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="font-[Montserrat,sans-serif] text-[11px] px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#65a30d]/20 focus:border-[#65a30d] transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="mb-5"><StatsGrid category={activeCategory} bp={bp} todayLog={todayLog} fieldInsights={fieldInsights} fluidTarget={activeFluidTarget} /></div>

        {/* ── Contextual Health Insight ── */}
        {contextualInsights.length > 0 && (
          <div className="mb-5">
            <ContextualInsightSection
              insights={contextualInsights}
              period={fieldPeriod}
              customStart={customStart}
              customEnd={customEnd}
              onLogClick={handleOpenModal}
              allLogs={allLogs}
            />
          </div>
        )}

        {/* ── Recent Logs ── */}
        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Montserrat,sans-serif', color: '#78716c' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #65a30d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, margin: 0 }}>Memuat log kesehatan...</p>
          </div>
        ) : (
          <RecentLogsSection category={activeCategory} bp={bp} logs={activeCategoryRows} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {/* ── Log Entry Modal ── */}
      <LogEntryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditIndex(null) }}
        category={activeCategory}
        saveStatus={saveStatus}
        errorMessage={saveErrorMessage}
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

      {/* ── Delete Confirmation ── */}
      {deleteIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => { if (!deleting) setDeleteIndex(null) }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            style={{ border: '1px solid #e7e5e4' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 16, color: '#1c1917', textAlign: 'center', margin: '0 0 8px' }}>
              Hapus Catatan?
            </h3>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#78716c', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.6 }}>
              Catatan tanggal <strong>{activeCategoryRows[deleteIndex]?.date}</strong> akan dihapus permanen dan tidak dapat dikembalikan.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                disabled={deleting}
                onClick={() => setDeleteIndex(null)}
                style={{ flex: 1, fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 13, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e7e5e4', background: '#fff', color: '#78716c', cursor: deleting ? 'not-allowed' : 'pointer' }}
              >
                Batal
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                style={{ flex: 1, fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 13, padding: '10px 0', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Feedback ── */}
      {notice && (
        <div
          role="status"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all duration-300"
          style={{ background: notice.type === 'success' ? '#628141' : '#ef4444' }}
        >
          <span className="font-[Montserrat,sans-serif] font-semibold text-[12px] text-white">{notice.text}</span>
          <button onClick={() => setNotice(null)} className="hover:opacity-80 transition-opacity p-0.5">
            <X size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* ── Phase Switch Confirmation ── */}
      {pendingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPendingCategory(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            style={{ border: '1px solid #e7e5e4' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>
              {pendingCategory === 'pregnant' ? '🤰' : pendingCategory === 'breastfeeding' ? '🤱' : '👧'}
            </div>
            <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 16, color: '#1c1917', textAlign: 'center', margin: '0 0 8px' }}>
              Pindah Fase?
            </h3>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#78716c', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.6 }}>
              Kamu sedang di fase <strong>{CATEGORY_META[activeCategory].badge}</strong>.
              Apakah kamu ingin berpindah ke fase <strong>{CATEGORY_META[pendingCategory as CategoryType].badge}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPendingCategory(null)}
                style={{ flex: 1, fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 13, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e7e5e4', background: '#fff', color: '#78716c', cursor: 'pointer' }}
              >
                Tetap di sini
              </button>
              <button
                onClick={() => { setActiveCategory(pendingCategory); setPendingCategory(null) }}
                style={{ flex: 1, fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 13, padding: '10px 0', borderRadius: 10, border: 'none', background: '#65a30d', color: '#fff', cursor: 'pointer' }}
              >
                Ya, Pindah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}