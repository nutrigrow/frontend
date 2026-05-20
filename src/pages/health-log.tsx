import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Plus, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
import {
  healthLogService,
  mapLogToRow,
  MOOD_STR_TO_INT,
  CATEGORY_TO_PROFILE,
  toISODate,
} from '../services/healthLog.service'

type CategoryType = 'teenage' | 'pregnant' | 'breastfeeding'
type SaveStatus = 'idle' | 'success' | 'error'
type LogRow = { day: string; date: string; mood: string; sleep: string; fluid: string; supplement: string; specific: string }
type StatusLevel = 'safe' | 'caution' | 'danger'

// ─── Status Color Config ─────
const STATUS_COLORS: Record<StatusLevel, {
  bg: string; border: string; badgeBg: string; badgeText: string; badgeBorder: string
}> = {
  safe:    { bg: '#E8F5E9', border: '#C8E6C9', badgeBg: '#F1F8E9', badgeText: '#2E7D32', badgeBorder: '#A5D6A7' },
  caution: { bg: '#FFFDE7', border: '#FFF176', badgeBg: '#FFFDE7', badgeText: '#F57F17', badgeBorder: '#FFD54F' },
  danger:  { bg: '#FFEBEE', border: '#FFCDD2', badgeBg: '#FFEBEE', badgeText: '#C62828', badgeBorder: '#EF9A9A' },
}

// ─── Insight Configs ──────────────────────────────────────────────────────────
type InsightConfig = {
  status: StatusLevel
  title: string
  subtitle: string
  sections: { heading: string; items: string[]; dotColor: string }[]
}

const CATEGORY_META: Record<CategoryType, { tab: string; badge: string }> = {
  teenage:       { tab: 'Remaja',        badge: 'REMAJA PUTRI' },
  pregnant:      { tab: 'Ibu Hamil',     badge: 'IBU HAMIL' },
  breastfeeding: { tab: 'Menyusui',      badge: 'IBU MENYUSUI' },
}

function getSupplementInsight(pct: number): InsightConfig {
  if (pct >= 80) return {
    status: 'safe',
    title: 'Konsumsi Suplemen Baik',
    subtitle: 'Kepatuhan minum suplemen sangat baik.',
    sections: [
      { heading: '✅ Mengapa ini penting?', dotColor: '#2E7D32', items: ['Konsumsi suplemen rutin membantu mencukupi zat besi dan mencegah anemia.', 'Kepatuhan >80% menunjukkan pola disiplin yang mendukung tumbuh kembang optimal.'] },
      { heading: '🛡️ Langkah Lanjutan', dotColor: '#3b82f6', items: ['Pertahankan jadwal konsumsi tiap hari di waktu yang sama.', 'Minum bersama makanan atau sumber vitamin C untuk penyerapan optimal.'] },
    ],
  }
  if (pct >= 50) return {
    status: 'caution',
    title: 'Konsumsi Suplemen Perlu Ditingkatkan',
    subtitle: 'Kepatuhan di bawah 80% — perlu perhatian.',
    sections: [
      { heading: '⚡ Dampak Jika Tidak Dijaga', dotColor: '#F57F17', items: ['Defisiensi zat besi berisiko menyebabkan anemia, kelelahan, dan gangguan konsentrasi.', 'Pada remaja dan ibu hamil, kadar Hb rendah dapat berdampak pada pertumbuhan janin.'] },
      { heading: '🛡️ Rekomendasi', dotColor: '#3b82f6', items: ['Aktifkan pengingat harian di aplikasi atau alarm ponsel.', 'Tempatkan suplemen di tempat yang mudah terlihat tiap pagi.'] },
    ],
  }
  return {
    status: 'danger',
    title: 'Konsumsi Suplemen Sangat Rendah',
    subtitle: 'Kepatuhan <50% — risiko anemia tinggi.',
    sections: [
      { heading: '🔴 Risiko Saat Ini', dotColor: '#C62828', items: ['Risiko anemia defisiensi besi meningkat signifikan bila kepatuhan di bawah 50%.', 'Gejala yang perlu diwaspadai: pusing, pucat, mudah lelah, dan sesak napas ringan.'] },
      { heading: '🛡️ Tindakan Segera', dotColor: '#3b82f6', items: ['Konsultasikan ke bidan atau dokter untuk cek kadar Hb secepatnya.', 'Mulai kembali konsumsi suplemen hari ini dan catat secara konsisten.'] },
    ],
  }
}

function getFluidInsight(glasses: number, target: number): InsightConfig {
  const ratio = glasses / target
  if (ratio >= 1) return {
    status: 'safe',
    title: 'Hidrasi Optimal',
    subtitle: `Target ${target} gelas tercapai!`,
    sections: [
      { heading: '✅ Manfaat Hidrasi Baik', dotColor: '#2E7D32', items: ['Tubuh terhidrasi optimal membantu metabolisme, konsentrasi, dan regulasi suhu tubuh.', 'Pada ibu menyusui, cairan cukup mendukung produksi ASI yang stabil.'] },
      { heading: '🛡️ Pertahankan', dotColor: '#3b82f6', items: ['Lanjutkan kebiasaan minum 250ml per jam aktivitas.', 'Hindari minuman tinggi gula — prioritaskan air putih.'] },
    ],
  }
  if (ratio >= 0.6) return {
    status: 'caution',
    title: 'Hidrasi Kurang Optimal',
    subtitle: `Masih ${target - glasses} gelas lagi untuk target hari ini.`,
    sections: [
      { heading: '⚡ Tanda Dehidrasi Ringan', dotColor: '#F57F17', items: ['Urin berwarna kuning tua, mulut kering, dan mudah lelah.', 'Penurunan konsentrasi dan sakit kepala ringan bisa muncul.'] },
      { heading: '🛡️ Tips', dotColor: '#3b82f6', items: ['Minum segelas air setiap jam dan setelah setiap makan.', 'Bawa tumbler untuk pengingat visual asupan cairan harian.'] },
    ],
  }
  return {
    status: 'danger',
    title: 'Dehidrasi — Asupan Cairan Rendah',
    subtitle: `Cairan hari ini jauh di bawah target ${target} gelas.`,
    sections: [
      { heading: '🔴 Risiko Dehidrasi', dotColor: '#C62828', items: ['Dehidrasi berat memengaruhi fungsi ginjal, tekanan darah, dan produksi ASI.', 'Pada kehamilan, kurang cairan berisiko kontraksi dini dan infeksi saluran kemih.'] },
      { heading: '🛡️ Tindakan Segera', dotColor: '#3b82f6', items: ['Minum minimal 2 gelas air sekarang, kemudian satu gelas setiap 30 menit.', 'Jika ada pusing berat atau urin sangat gelap, hubungi tenaga kesehatan.'] },
    ],
  }
}

function getRestInsight(hours: number, category: CategoryType): InsightConfig {
  const minOk = category === 'pregnant' || category === 'breastfeeding' ? 7 : 7
  const minCaution = 6
  if (hours >= minOk) return {
    status: 'safe',
    title: 'Kualitas Tidur Baik',
    subtitle: `${hours} jam — dalam rentang ideal.`,
    sections: [
      { heading: '✅ Manfaat Tidur Cukup', dotColor: '#2E7D32', items: ['Tidur 7–9 jam mendukung regenerasi sel, keseimbangan hormon, dan imunitas tubuh.', category === 'breastfeeding' ? 'Istirahat cukup berpengaruh langsung pada produksi dan kualitas ASI.' : 'Tidur berkualitas meningkatkan fokus dan suasana hati sepanjang hari.'] },
      { heading: '🛡️ Tips Pertahankan', dotColor: '#3b82f6', items: ['Usahakan jadwal tidur dan bangun di jam yang sama tiap hari.', 'Hindari layar (HP/laptop) minimal 30 menit sebelum tidur.'] },
    ],
  }
  if (hours >= minCaution) return {
    status: 'caution',
    title: 'Tidur di Bawah Ideal',
    subtitle: `${hours} jam — disarankan minimal ${minOk} jam.`,
    sections: [
      { heading: '⚡ Dampak Kurang Tidur', dotColor: '#F57F17', items: ['Tidur <7 jam memengaruhi mood, produktivitas, dan sistem imun.', category === 'breastfeeding' ? 'Kurang tidur bisa mengurangi hormon prolaktin yang mengatur produksi ASI.' : 'Pada remaja, tidur kurang dari ideal menghambat pertumbuhan dan konsentrasi belajar.'] },
      { heading: '🛡️ Saran', dotColor: '#3b82f6', items: ['Coba tidur 30 menit lebih awal malam ini.', 'Minta bantuan pasangan atau keluarga untuk giliran jaga bayi jika diperlukan.'] },
    ],
  }
  return {
    status: 'danger',
    title: 'Kurang Tidur Parah',
    subtitle: `${hours} jam — di bawah ambang batas aman.`,
    sections: [
      { heading: '🔴 Risiko', dotColor: '#C62828', items: ['Kurang dari 6 jam secara rutin meningkatkan risiko depresi pascamelahirkan dan gangguan kognisi.', 'Kelelahan ekstrem dapat memengaruhi keselamatan aktivitas sehari-hari.'] },
      { heading: '🛡️ Tindakan Segera', dotColor: '#3b82f6', items: ['Prioritaskan tidur siang minimal 20–30 menit jika malam kurang.', 'Bicarakan dengan dokter atau bidan jika sering kurang tidur dalam seminggu.'] },
    ],
  }
}

function getMoodInsight(moodVal: string, category: CategoryType): InsightConfig {
  const isNegative = ['lelah', 'sedih'].includes(moodVal)
  const isNeutral  = moodVal === 'biasa'
  if (!isNegative && !isNeutral) return {
    status: 'safe',
    title: 'Mood Positif — Pertahankan!',
    subtitle: 'Kondisi mental stabil dan baik.',
    sections: [
      { heading: '✅ Manfaat Mood Positif', dotColor: '#2E7D32', items: ['Suasana hati yang baik mendukung produksi hormon oksitosin yang memperlancar ASI.', 'Mood positif meningkatkan kualitas interaksi dengan bayi dan lingkungan sekitar.'] },
      { heading: '🛡️ Jaga Keseimbangan', dotColor: '#3b82f6', items: ['Luangkan waktu untuk aktivitas yang kamu nikmati setiap harinya.', 'Terhubung dengan komunitas ibu/remaja untuk berbagi pengalaman.'] },
    ],
  }
  if (isNeutral) return {
    status: 'caution',
    title: 'Mood Biasa — Pantau Terus',
    subtitle: 'Kondisi emosional stabil namun perlu perhatian.',
    sections: [
      { heading: '⚡ Perhatikan Tanda-Tanda', dotColor: '#F57F17', items: ['Mood yang terus datar bisa menjadi awal tanda kelelahan emosional.', category === 'breastfeeding' ? 'Stres ringan yang menumpuk dapat memengaruhi refleks let-down ASI.' : 'Perubahan mood yang konsisten perlu dicatat dan dikonsultasikan.'] },
      { heading: '🛡️ Saran', dotColor: '#3b82f6', items: ['Lakukan aktivitas ringan yang menyenangkan: jalan kaki, musik, atau memasak.', 'Ceritakan perasaanmu ke orang yang dipercaya.'] },
    ],
  }
  // Negatif
  if (category === 'breastfeeding') return {
    status: 'danger',
    title: 'Mood Rendah — Waspadai Baby Blues',
    subtitle: 'Kamu tidak sendirian. Perasaan ini sangat wajar.',
    sections: [
      { heading: '💜 Empati & Pemahaman', dotColor: '#7c3aed', items: ['Merasa lelah atau sedih setelah melahirkan adalah hal yang sangat umum — bukan kelemahanmu.', 'Hingga 80% ibu mengalami Baby Blues dalam 1–2 minggu pertama. Kalau berlanjut >2 minggu, itu bisa depresi postpartum.'] },
      { heading: '⚡ Pengaruh pada ASI', dotColor: '#C62828', items: ['Stres dan kesedihan dapat menghambat hormon oksitosin — menyebabkan let-down ASI terlambat atau berkurang.', 'Kadar kortisol tinggi akibat stres kronis berdampak pada kualitas dan volume ASI.'] },
      { heading: '🛡️ Langkah Dukungan', dotColor: '#3b82f6', items: ['Ceritakan perasaanmu ke pasangan, ibu, atau sahabat — jangan ditahan sendiri.', 'Hubungi konselor laktasi atau psikolog jika perasaan ini berlangsung lebih dari 2 minggu.', 'Aplikasi ini mendukungmu — catat mood harian dan tunjukkan ke bidan/doktermu.'] },
    ],
  }
  return {
    status: 'danger',
    title: 'Mood Rendah — Perlu Perhatian',
    subtitle: 'Kondisi emosional perlu dukungan lebih.',
    sections: [
      { heading: '🔴 Dampak Mood Negatif', dotColor: '#C62828', items: ['Kelelahan atau kesedihan berkepanjangan memengaruhi motivasi dan kesehatan fisik.', 'Pada remaja, mood buruk berkaitan dengan kualitas tidur, nafsu makan, dan performa belajar.'] },
      { heading: '🛡️ Langkah Praktis', dotColor: '#3b82f6', items: ['Bicarakan perasaanmu ke orang dewasa yang kamu percaya.', 'Jika perasaan ini berlangsung >1 minggu, pertimbangkan konsultasi ke tenaga kesehatan mental.'] },
    ],
  }
}

function getCycleInsight(isMenstruating: boolean): InsightConfig {
  return isMenstruating ? {
    status: 'caution',
    title: 'Sedang Haid',
    subtitle: 'Pantau kebutuhan zat besi ekstra.',
    sections: [
      { heading: '⚡ Perhatikan Selama Haid', dotColor: '#F57F17', items: ['Kehilangan darah saat menstruasi meningkatkan kebutuhan zat besi — pastikan TTD tidak terlewat.', 'Nyeri haid dapat diringankan dengan olahraga ringan, kompres hangat, dan cairan cukup.'] },
      { heading: '🛡️ Tips Haid Sehat', dotColor: '#3b82f6', items: ['Konsumsi makanan kaya zat besi: hati ayam, daging merah, bayam, dan tempe.', 'Istirahat cukup dan hindari aktivitas berat di hari pertama dan kedua.'] },
    ],
  } : {
    status: 'safe',
    title: 'Tidak Haid',
    subtitle: 'Siklus terpantau baik.',
    sections: [
      { heading: '✅ Pantau Siklus', dotColor: '#2E7D32', items: ['Mencatat siklus haid membantu mendeteksi pola tidak teratur secara dini.', 'Siklus normal berlangsung 21–35 hari dengan durasi 2–7 hari.'] },
      { heading: '🛡️ Tips', dotColor: '#3b82f6', items: ['Tetap konsumsi TTD setiap minggu di luar masa haid sesuai anjuran Kemenkes.', 'Catat tanggal mulai haid tiap bulan di jurnal ini.'] },
    ],
  }
}

function getMomWeightInsight(currentKg: number, prevKg: number, trimester: number): InsightConfig {
  const gain = currentKg - prevKg
  const idealWeekly = trimester === 1 ? 0.1 : 0.35
  const tooMuch = gain > idealWeekly * 2
  const tooLittle = gain < 0
  if (!tooMuch && !tooLittle && gain >= 0) return {
    status: 'safe',
    title: 'Kenaikan BB Ideal',
    subtitle: `+${gain.toFixed(1)} kg — sesuai standar Buku KIA.`,
    sections: [
      { heading: '✅ Kenaikan BB Normal', dotColor: '#2E7D32', items: ['Kenaikan berat badan yang teratur menandakan pertumbuhan janin yang sehat.', `Trimester ${trimester}: target kenaikan ≈ ${trimester === 1 ? '0.5–2 kg total' : '0.25–0.5 kg/minggu'}.`] },
      { heading: '🛡️ Pertahankan', dotColor: '#3b82f6', items: ['Lanjutkan pola makan bergizi seimbang dengan porsi kecil tapi sering.', 'Timbang BB minimal seminggu sekali di waktu yang sama.'] },
    ],
  }
  if (tooMuch) return {
    status: 'caution',
    title: 'Kenaikan BB Di Atas Ideal',
    subtitle: `+${gain.toFixed(1)} kg — sedikit di atas rekomendasi Buku KIA.`,
    sections: [
      { heading: '⚡ Perhatikan', dotColor: '#F57F17', items: ['Kenaikan BB berlebih dapat meningkatkan risiko preeklamsia dan diabetes gestasional.', 'Konsultasikan dengan bidan/dokter jika kenaikan terus melebihi target.'] },
      { heading: '🛡️ Rekomendasi', dotColor: '#3b82f6', items: ['Kurangi makanan tinggi gula dan lemak jenuh, perbanyak sayur dan protein.', 'Lakukan jalan kaki ringan 20–30 menit per hari jika tidak ada kontraindikasi.'] },
    ],
  }
  return {
    status: 'danger',
    title: 'Berat Badan Turun',
    subtitle: `${gain.toFixed(1)} kg — perlu evaluasi segera.`,
    sections: [
      { heading: '🔴 Risiko Penurunan BB', dotColor: '#C62828', items: ['Penurunan BB selama hamil berisiko menyebabkan janin kekurangan nutrisi.', 'Bisa jadi tanda mual/muntah berlebih (hiperemesis) atau asupan kalori yang kurang.'] },
      { heading: '🛡️ Tindakan', dotColor: '#3b82f6', items: ['Segera konsultasikan ke bidan atau dokter kandungan.', 'Coba makan porsi kecil dan sering (5–6 kali sehari) untuk mengurangi mual.'] },
    ],
  }
}

function getPumpingInsight(sessions: number): InsightConfig {
  if (sessions >= 8) return {
    status: 'safe',
    title: 'Frekuensi Menyusui Optimal',
    subtitle: `${sessions} sesi — memenuhi standar laktasi.`,
    sections: [
      { heading: '✅ Produksi ASI Stabil', dotColor: '#2E7D32', items: ['Menyusui/pumping ≥8 sesi per hari menjaga suplai ASI tetap optimal melalui mekanisme supply-demand.', 'Konsistensi frekuensi ini mendukung perkembangan bayi dan mencegah bengkak payudara.'] },
      { heading: '🛡️ Pertahankan', dotColor: '#3b82f6', items: ['Jaga interval antar sesi tidak lebih dari 3–4 jam di siang hari.', 'Pijat payudara ringan sebelum pumping untuk meningkatkan aliran ASI.'] },
    ],
  }
  if (sessions >= 6) return {
    status: 'caution',
    title: 'Frekuensi Pumping Kurang',
    subtitle: `${sessions} sesi — di bawah rekomendasi 8 sesi/hari.`,
    sections: [
      { heading: '⚡ Risiko Produksi ASI Menurun', dotColor: '#F57F17', items: ['Frekuensi pumping yang kurang dapat menyebabkan penurunan produksi ASI secara bertahap.', 'Payudara yang jarang dikosongkan berisiko bengkak (engorgement) atau mastitis.'] },
      { heading: '🛡️ Tips', dotColor: '#3b82f6', items: ['Tambah 1–2 sesi pumping di pagi hari — saat produksi ASI biasanya tertinggi.', 'Gunakan power pumping selama 1 jam (20 menit pompa, 10 menit istirahat) 1x sehari.'] },
    ],
  }
  return {
    status: 'danger',
    title: 'Status Pumping: LOW',
    subtitle: `${sessions} sesi — produksi ASI berisiko menurun drastis.`,
    sections: [
      { heading: '🔴 Risiko Suplai ASI', dotColor: '#C62828', items: ['Kurang dari 6 sesi/hari secara konsisten sangat berisiko menyebabkan supply ASI menurun drastis.', 'Risiko mastitis dan galaktosele meningkat saat ASI tidak dikeluarkan secara teratur.'] },
      { heading: '🛡️ Tindakan Segera', dotColor: '#3b82f6', items: ['Mulai tambah sesi pumping hari ini — setiap 2–3 jam selama payudara terasa penuh.', 'Konsultasikan dengan konselor laktasi bersertifikat (IBCLC) untuk panduan personal.'] },
    ],
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
  { emoji: '😫', label: 'LELAH',   value: 'lelah'   },
  { emoji: '😔', label: 'SEDIH',   value: 'sedih'   },
  { emoji: '😐', label: 'BIASA',   value: 'biasa'   },
  { emoji: '🙂', label: 'NYAMAN',  value: 'nyaman'  },
  { emoji: '🤩', label: 'BAHAGIA', value: 'bahagia' },
]

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
        {isSuccess ? 'Data tersimpan!' : 'Gagal menyimpan!'}
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

  const monthNames = ['januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
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

// ─── Checkbox (replaces ToggleSwitch) ─────────────────────────────────────────
const Checkbox = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none group">
    <span
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 flex-shrink-0 rounded-[5px] border-2 flex items-center justify-center transition-all
        ${checked ? 'bg-[#65a30d] border-[#65a30d]' : 'bg-white border-slate-300 group-hover:border-[#65a30d]'}`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
    <span className="font-bold text-sm text-[#191c1a] font-[Montserrat,sans-serif]" onClick={() => onChange(!checked)}>{label}</span>
  </label>
)

// ─── Insight Modal (reusable) ─────────────────────────────────────────────────
const InsightModal = ({
  open, onClose, insight,
}: {
  open: boolean; onClose: () => void; insight?: InsightConfig
}) => {
  const safe: InsightConfig = insight ?? { status: 'safe' as StatusLevel, title: 'Belum ada data', subtitle: '—', sections: [] }
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  const col = STATUS_COLORS[safe.status]
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] sm:max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{ background: col.bg, borderBottom: `1px solid ${col.border}` }}>
          <div className="flex flex-col gap-1.5">
            <span className="font-[Montserrat,sans-serif] font-black text-lg text-slate-900">{safe.title}</span>
            <span className="self-start font-[Montserrat,sans-serif] font-semibold text-xs px-2.5 py-1 rounded-full" style={{ background: col.badgeBg, color: col.badgeText, border: `1px solid ${col.badgeBorder}` }}>
              {safe.subtitle}
            </span>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors border-none bg-transparent cursor-pointer flex-shrink-0 ml-4">
            <IconClose />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {safe.sections.length === 0 ? (
            <p className="font-[Montserrat,sans-serif] text-sm text-slate-500 text-center py-6">Catatan hari ini untuk melihat analisis lebih lanjut.</p>
          ) : safe.sections.map((sec, si) => (
            <div key={si} className="flex flex-col gap-2">
              <span className="font-[Montserrat,sans-serif] font-bold text-sm text-slate-700 uppercase tracking-[0.5px]">{sec.heading}</span>
              <ul className="flex flex-col gap-2 m-0 pl-0 list-none">
                {sec.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full" style={{ background: sec.dotColor }} />
                    <span className="font-[Montserrat,sans-serif] font-normal text-sm text-slate-600 leading-[22px]">{item}</span>
                  </li>
                ))}
              </ul>
              {si < safe.sections.length - 1 && <div className="border-t border-slate-100 mt-1" />}
            </div>
          ))}
          <p className="font-[Montserrat,sans-serif] text-[11px] text-slate-400 leading-5 border-t border-slate-100 pt-4">
            * Informasi ini bersifat edukatif. Konsultasikan kondisi kesehatan Anda dengan tenaga medis terpercaya.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card Base (with pastel bg + Details button) ─────────────────────────
const StatCardBase = ({
  icon, iconBg, label, children, sub, insight,
}: {
  icon: React.ReactNode; iconBg: string; label: string
  children: React.ReactNode; sub: React.ReactNode; insight?: InsightConfig
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const defaultInsight: InsightConfig = { status: 'safe' as StatusLevel, title: 'Belum ada data', subtitle: '—', sections: [] }
  const c = STATUS_COLORS[(insight ?? defaultInsight).status]
  return (
    <>
      <div
        className="rounded-2xl border shadow-sm flex-1 min-w-0 transition-colors"
        style={{ background: c.bg, borderColor: c.border }}
      >
        <div className="flex flex-col gap-3 p-5">
          {/* Header: icon + label + Details button */}
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
          {/* Value */}
          {children}
          {/* Sub */}
          <div className="text-[10px] font-[Inter,sans-serif]" style={{ color: c.badgeText }}>{sub}</div>
        </div>
      </div>
      <InsightModal open={modalOpen} onClose={() => setModalOpen(false)} insight={insight} />
    </>
  )
}

// ─── Individual Stat Cards ─────────────────────────────────────
const SupplementCard = ({ label = 'ASUPAN SUPLEMEN', category, value }: { label?: string; category: CategoryType; value: number | null }) => {
  const insight = value !== null ? getSupplementInsight(value) : undefined
  const targetLabel = category === 'pregnant'
    ? 'Target: 1 Tablet TTD/hari'
    : category === 'breastfeeding'
    ? 'Target: ASI Booster/hari'
    : 'Target: 1 tab/hari'
  return (
    <StatCardBase icon={<PillIconSvg />} iconBg="#fef2f2" label={label} insight={insight} sub={<>{targetLabel}</>}>
      {value === null ? <span style={{ fontFamily: "Inter,sans-serif", fontSize: 16, color: "#cbd5e1", fontWeight: 700 }}>—</span> : (
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

const FluidStatCard = ({ category, value }: { category: CategoryType; value: number | null }) => {
  const target = category === 'breastfeeding' ? 10 : 8
  const insight = value !== null ? getFluidInsight(value, target) : undefined
  return (
    <StatCardBase icon={<FluidIconSvg />} iconBg="#eff6ff" label="CAIRAN" insight={insight}
      sub={value !== null ? <>{target - value > 0 ? `${target - value} gelas lagi!` : 'Target tercapai!'}</> : <>Catatan hari ini</>}
    >
      {value === null ? <span style={{ fontFamily: "Inter,sans-serif", fontSize: 16, color: "#cbd5e1", fontWeight: 700 }}>—</span> : (
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

const RestStatCard = ({ category, value }: { category: CategoryType; value: number | null }) => {
  const insight = value !== null ? getRestInsight(value, category) : undefined
  return (
    <StatCardBase icon={<MoonIconSvg />} iconBg="#f5f3ff" label="ISTIRAHAT" insight={insight}
      sub={value !== null ? <span className="flex items-center gap-1"><TrendUpIconSvg /><span>Kualitas bagus</span></span> : <>Catatan hari ini</>}
    >
      {value === null ? <span style={{ fontFamily: "Inter,sans-serif", fontSize: 16, color: "#cbd5e1", fontWeight: 700 }}>—</span> : (
        <div className="flex items-baseline gap-1">
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
          <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">Jam</span>
        </div>
      )}
    </StatCardBase>
  )
}

const MOOD_INT_LABELS: Record<number,{emoji:string;label:string}> = {
  5: { emoji: '😄', label: 'Bahagia' },
  4: { emoji: '😊', label: 'Nyaman' },
  3: { emoji: '😐', label: 'Biasa' },
  2: { emoji: '😴', label: 'Lelah' },
  1: { emoji: '😢', label: 'Sedih' },
}
const MoodStatCard = ({ category, value }: { category: CategoryType; value: number | null }) => {
  const moodInfo = value !== null ? MOOD_INT_LABELS[value] : null
  const moodVal  = value !== null ? Object.keys(MOOD_STR_TO_INT).find(k => MOOD_STR_TO_INT[k] === value) ?? 'biasa' : 'biasa'
  const insight  = value !== null ? getMoodInsight(moodVal, category) : undefined
  return (
    <StatCardBase icon={<SmileIconSvg />} iconBg="#f0fdf4" label="SUASANA HATI" insight={insight}
      sub={value !== null ? 'Stability high' : 'Catatan hari ini'}
    >
      {value === null ? <span style={{ fontFamily: "Inter,sans-serif", fontSize: 16, color: "#cbd5e1", fontWeight: 700 }}>—</span> : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl leading-none">{moodInfo?.emoji}</span>
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none capitalize">{moodInfo?.label}</span>
        </div>
      )}
    </StatCardBase>
  )
}

const CycleStatCard = ({ value }: { value: string | null }) => {
  const isMenstruating = value === 'Sedang haid'
  const insight = value !== null ? getCycleInsight(isMenstruating) : undefined
  return (
    <StatCardBase icon={<CalendarIconSvg />} iconBg="#fdf2f8" label="PEMANTAU SIKLUS" insight={insight}
      sub={value !== null ? 'Siklus teratur' : 'Catatan hari ini'}
    >
      {value === null ? <span style={{ fontFamily: "Inter,sans-serif", fontSize: 16, color: "#cbd5e1", fontWeight: 700 }}>—</span> : (
        <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
      )}
    </StatCardBase>
  )
}

const MomWeightCard = ({ value }: { value: number | null }) => {
  const insight = value !== null ? getMomWeightInsight(value, value, 2) : undefined
  return (
    <StatCardBase icon={<WeightIconSvg />} iconBg="#fdf2f8" label="BERAT BADAN IBU" insight={insight}
      sub={value !== null ? <span className="flex items-center gap-1"><TrendUpIconSvg /><span>Terpantau</span></span> : <>Catatan hari ini</>}
    >
      {value === null ? <span style={{ fontFamily: "Inter,sans-serif", fontSize: 16, color: "#cbd5e1", fontWeight: 700 }}>—</span> : (
        <div className="flex items-baseline gap-1">
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
          <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">kg</span>
        </div>
      )}
    </StatCardBase>
  )
}

const PumpingStatCard = ({ value }: { value: number | null }) => {
  const insight = value !== null ? getPumpingInsight(value) : undefined
  return (
    <StatCardBase icon={<DropIconSvg />} iconBg="#fdf2f8" label="MENYUSUI & MEMOMPA ASI" insight={insight}
      sub={value !== null ? (value >= 8 ? <span className="flex items-center gap-1"><TrendUpIconSvg /><span>Jadwal stabil</span></span> : 'Target: 8 sesi/hari') : <>Catatan hari ini</>}
    >
      {value === null ? <span style={{ fontFamily: "Inter,sans-serif", fontSize: 16, color: "#cbd5e1", fontWeight: 700 }}>—</span> : (
        <div className="flex items-baseline gap-1">
          <span className="font-black text-[20px] text-[#1c1917] font-[Inter,sans-serif] leading-none">{value}</span>
          <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">sesi</span>
        </div>
      )}
    </StatCardBase>
  )
}

// ─── Stats Grid ───────────────────────────────────────────────────────────────
const StatsGrid = ({
  category, bp, todayLog,
}: {
  category: CategoryType
  bp: 'mobile' | 'tablet' | 'desktop'
  todayLog: import('../services/healthLog.service').ApiHealthLog | null
}) => {
  const suppLabel = category === 'breastfeeding' ? 'ASUPAN ZAT BESI' : 'ASUPAN SUPLEMEN'
  const hasData = todayLog !== null && todayLog.profile_type === CATEGORY_TO_PROFILE[category]

  // Derive today's values from the log (or null if no log)
  const todaySuppPct   = hasData && todayLog ? (todayLog.took_supplement ? 100 : 0) : null
  const todayGlasses   = hasData && todayLog ? todayLog.water_glasses : null
  const todaySleep     = hasData && todayLog ? todayLog.sleep_hours : null
  const todayMood      = hasData && todayLog ? todayLog.mood : null     // 1-5
  const todayMensStr   = hasData && todayLog ? (todayLog.is_menstruating ? 'Sedang haid' : 'Tidak haid') : null
  const todayWeight    = hasData && todayLog?.weight_kg != null ? todayLog.weight_kg : null
  const todayPumping   = hasData && todayLog?.breastfeeding_count != null ? todayLog.breastfeeding_count : null

  const card5 = category === 'teenage'
    ? <CycleStatCard value={todayMensStr} />
    : category === 'pregnant'
    ? <MomWeightCard value={todayWeight} />
    : <PumpingStatCard value={todayPumping} />

  if (bp === 'mobile') return (
    <div className="flex flex-col gap-3 w-full">
      <SupplementCard label={suppLabel} category={category} value={todaySuppPct} />
      <FluidStatCard category={category} value={todayGlasses} />
      <RestStatCard category={category} value={todaySleep} />
      <MoodStatCard category={category} value={todayMood} />
      {card5}
    </div>
  )
  if (bp === 'tablet') return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-3 gap-3">
        <SupplementCard label={suppLabel} category={category} value={todaySuppPct} />
        <FluidStatCard category={category} value={todayGlasses} />
        <RestStatCard category={category} value={todaySleep} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MoodStatCard category={category} value={todayMood} />
        {card5}
      </div>
    </div>
  )
  return (
    <div className="flex gap-4 w-full">
      <SupplementCard label={suppLabel} category={category} value={todaySuppPct} />
      <FluidStatCard category={category} value={todayGlasses} />
      <RestStatCard category={category} value={todaySleep} />
      <MoodStatCard category={category} value={todayMood} />
      {card5}
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
    <>
      <div className={`bg-white rounded-[24px] border border-[#f0f0ee] shadow-sm ${isMobile ? 'px-4 py-4' : 'px-6 py-5'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-base text-[#292524] font-['Plus_Jakarta_Sans',sans-serif]">Catatan terbaru</span>
          <button onClick={() => setModalOpen(true)} className="font-[Montserrat,sans-serif] font-semibold text-xs text-[#65a30d] tracking-[0.6px] uppercase hover:text-[#4d7c0f] bg-transparent border-none cursor-pointer p-0 transition-colors">
            LIHAT SEMUA
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

// Pregnant weight warning helper
const getWeightWarning = (weightStr: string): { text: string; level: 'ok' | 'caution' | 'danger' } | null => {
  const w = parseFloat(weightStr)
  if (isNaN(w) || w <= 0) return null
  if (w < 45) return { text: 'Berat badan terlalu rendah untuk kehamilan yang sehat. Konsultasikan ke bidan/dokter.', level: 'danger' }
  if (w > 110) return { text: 'Berat badan di atas batas ideal. Diskusikan dengan dokter kandunganmu.', level: 'caution' }
  return null
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
  const leftTitle    = category === 'teenage' ? 'Tablet Tambah Darah (TTD)' : 'Asupan Suplemen'
  const leftSubtitle = category === 'teenage' ? 'Sudah minum TTD hari ini?' : 'Sudah minum vitamin hari ini?'

  const weightWarning = category === 'pregnant' ? getWeightWarning(momWeight) : null
  const weightBg = weightWarning?.level === 'danger' ? '#FFEBEE' : weightWarning?.level === 'caution' ? '#FFFDE7' : '#e6e9e4'
  const weightBorder = weightWarning?.level === 'danger' ? '#FFCDD2' : weightWarning?.level === 'caution' ? '#FFF176' : 'transparent'

  const pumpingNum = parseInt(nursingCount)
  const pumpingLow = !isNaN(pumpingNum) && pumpingNum > 0 && pumpingNum < 6

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* CSS to hide number input spinners globally within this modal */}
      <style>{`
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinner { -moz-appearance: textfield; appearance: textfield; }
      `}</style>

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

            {/* Dynamic Fields — 2 col */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left: supplement — now Checkbox */}
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

              {/* Right: category-specific */}
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
                      style={{ background: weightBg, border: `1.5px solid ${weightBorder}` }}
                    >
                      <input type="number" value={momWeight} onChange={e => setMomWeight(e.target.value)} placeholder="0" min={0} max={200}
                        className="no-spinner flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                      <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">kg</span>
                    </div>
                    {weightWarning && (
                      <p className={`text-[11px] font-semibold font-[Montserrat,sans-serif] pl-1 ${weightWarning.level === 'danger' ? 'text-red-600' : 'text-amber-600'}`}>
                        ⚠ {weightWarning.text}
                      </p>
                    )}
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
                        ⚠ Status: RENDAH — Di bawah 6 sesi/hari. Tingkatkan frekuensi memompa.
                      </p>
                    )}
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
                    className="no-spinner flex-1 bg-transparent outline-none font-['Lexend',sans-serif] font-bold text-[20px] text-[#6b7280] leading-none w-full" />
                  <span className="absolute right-5 font-bold text-sm text-[#42493b] font-[Montserrat,sans-serif]">Jam</span>
                </div>
                {sleepError && <span className="text-red-500 font-[Montserrat,sans-serif] text-[11px] font-semibold pl-1">{sleepError}</span>}
              </div>
            </div>

            {/* Save button */}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HealthLog() {
  const bp = useBreakpoint()

  const { user } = useAuth()
  const userName = user?.nama?.split(' ')[0] ?? 'Kamu'

  const [activeCategory, setActiveCategory] = useState<CategoryType>('teenage')
  const [pendingCategory, setPendingCategory] = useState<CategoryType | null>(null)

  const handleCategoryChange = (cat: CategoryType) => {
    if (cat === activeCategory) return
    if (logs[activeCategory].length > 0) {
      setPendingCategory(cat)
    } else {
      setActiveCategory(cat)
    }
  }

  const [logs, setLogs] = useState<Record<CategoryType, LogRow[]>>({ teenage: [], pregnant: [], breastfeeding: [] })
  const [logsLoading, setLogsLoading] = useState(true)
  const [todayLog, setTodayLog] = useState<import('../services/healthLog.service').ApiHealthLog | null>(null)

  // Maps backend log id → row index so delete works correctly
  const [logIds, setLogIds] = useState<Record<CategoryType, (number | undefined)[]>>({ teenage: [], pregnant: [], breastfeeding: [] })

  const [modalOpen,  setModalOpen]  = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [editIndex,  setEditIndex]  = useState<number | null>(null)

  // Form state
  const [mood,              setMood]              = useState('biasa')
  const [fluid,             setFluid]             = useState('')
  const [sleep,             setSleep]             = useState('')
  const today = new Date()
  const todayStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`
  const [logDate,           setLogDate]           = useState(todayStr)
  const [ttdTaken,          setTtdTaken]          = useState(false)
  const [isMenstruating,    setIsMenstruating]    = useState(false)
  const [supplementTaken,   setSupplementTaken]   = useState(false)
  const [momWeight,         setMomWeight]         = useState('')
  const [supplementBfTaken, setSupplementBfTaken] = useState(false)
  const [nursingCount,      setNursingCount]      = useState('')

  // Validation errors
  const [fluidError, setFluidError] = useState<string | undefined>()
  const [sleepError, setSleepError] = useState<string | undefined>()

  // ── Fetch all logs on mount ──
  useEffect(() => {
    setLogsLoading(true)
    healthLogService.getAllLogs()
      .then(apiLogs => {
        const sorted = [...apiLogs].sort((a, b) => b.date.localeCompare(a.date))
        const teen: LogRow[] = []; const teenIds: number[] = []
        const preg: LogRow[] = []; const pregIds: number[] = []
        const bf:   LogRow[] = []; const bfIds:   number[] = []

        sorted.forEach(log => {
          const row = mapLogToRow(log)
          if (log.profile_type === 'teen') { teen.push(row); teenIds.push(log.id) }
          else if (log.profile_type === 'pregnant') { preg.push(row); pregIds.push(log.id) }
          else { bf.push(row); bfIds.push(log.id) }
        })

        setLogs({ teenage: teen, pregnant: preg, breastfeeding: bf })
        setLogIds({ teenage: teenIds, pregnant: pregIds, breastfeeding: bfIds })
        
        // Set today's log from the most recent entry if it's today
        const todayIso = new Date().toISOString().split('T')[0]
        const todayEntry = sorted.find(l => l.date === todayIso)
        setTodayLog(todayEntry ?? null)

        // Set active category to the latest logged data's category
        if (sorted.length > 0) {
          const latestProfile = sorted[0].profile_type
          if (latestProfile === 'teen') setActiveCategory('teenage')
          else if (latestProfile === 'pregnant') setActiveCategory('pregnant')
          else if (latestProfile === 'breastfeeding') setActiveCategory('breastfeeding')
        }
      })
      .catch(() => {})
      .finally(() => setLogsLoading(false))
  }, [])

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
    }

    try {
      const saved = await healthLogService.createOrUpdate(payload)
      const newRow = mapLogToRow(saved)

      setLogs(prev => {
        const arr = [...prev[activeCategory]]
        if (editIndex !== null) arr[editIndex] = newRow
        else arr.unshift(newRow)
        return { ...prev, [activeCategory]: arr }
      })
      setLogIds(prev => {
        const arr = [...prev[activeCategory]]
        if (editIndex !== null) arr[editIndex] = saved.id
        else arr.unshift(saved.id)
        return { ...prev, [activeCategory]: arr }
      })

      setSaveStatus('success')
      setTimeout(() => { setSaveStatus('idle'); setModalOpen(false); setEditIndex(null) }, 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleEdit = (index: number) => {
    const row = logs[activeCategory][index]
    void logIds[activeCategory][index] // reserved for future delete-by-id
    const moodOpt = MOOD_OPTIONS.find(m => m.label.toLowerCase() === row.mood.toLowerCase())
    setMood(moodOpt?.value ?? 'biasa')
    setFluid(row.fluid.replace(' Gelas', '').trim())
    setSleep(row.sleep.replace('h', '').trim())
    try {
      const parts = row.date.split(' ')
      const monthMap: Record<string,string> = { Januari:'01', Februari:'02', Maret:'03', April:'04', Mei:'05', Juni:'06', Juli:'07', Agustus:'08', September:'09', Oktober:'10', November:'11', Desember:'12', January:'01', February:'02', March:'03', May:'05', June:'06', July:'07', August:'08', October:'10' }
      const d = parts[0].padStart(2,'0')
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

  const handleDelete = (index: number) => {
    setLogs(prev => {
      const arr = prev[activeCategory].filter((_, i) => i !== index)
      return { ...prev, [activeCategory]: arr }
    })
    setLogIds(prev => {
      const arr = prev[activeCategory].filter((_, i) => i !== index)
      return { ...prev, [activeCategory]: arr }
    })
    if (editIndex === index) setEditIndex(null)
    else if (editIndex !== null && index < editIndex) setEditIndex(editIndex - 1)
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
  const meta     = CATEGORY_META[activeCategory]

  const CategoryTabs = () => (
    <div className="flex items-center gap-1 p-[4px] rounded-full" style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
      {(['teenage', 'pregnant', 'breastfeeding'] as CategoryType[]).map(cat => (
        <button key={cat} onClick={() => handleCategoryChange(cat)}
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
              <h1 className="font-extrabold text-[24px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Halo, <span className="{`text-[#65a30d]`}">{userName}</span> 👋</h1>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase font-[Inter,sans-serif]" style={{ background: '#ecfccb', color: '#65a30d' }}>{meta.badge}</span>
                <span className="text-xs text-[#78716c] font-[Inter,sans-serif]">• Pantau jurnal kesehatanmu.</span>
              </div>
            </div>
            <div className="flex items-center gap-1 p-[4px] rounded-full w-full" style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              {(['teenage', 'pregnant', 'breastfeeding'] as CategoryType[]).map(cat => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
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
              <h1 className="font-extrabold text-[26px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Halo, <span className="{`text-[#65a30d]`}">{userName}</span> 👋</h1>
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
              <h1 className="font-extrabold text-[28px] text-[#1c1917] leading-none font-[Montserrat,sans-serif]">Halo, <span className="{`text-[#65a30d]`}">{userName}</span> 👋</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.55px] uppercase font-[Inter,sans-serif]" style={{ background: '#ecfccb', color: '#65a30d' }}>{meta.badge}</span>
                <span className="text-sm text-[#78716c] font-[Inter,sans-serif]">• Pantau jurnal kesehatanmu.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-nowrap flex-shrink-0"><CategoryTabs /><LogDataButton /></div>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div className="mb-5"><StatsGrid category={activeCategory} bp={bp} todayLog={todayLog} /></div>

        {/* ── Recent Logs ── */}
        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Montserrat,sans-serif', color: '#78716c' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #65a30d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, margin: 0 }}>Memuat log kesehatan...</p>
          </div>
        ) : (
          <RecentLogsSection category={activeCategory} bp={bp} logs={logs[activeCategory]} onEdit={handleEdit} onDelete={handleDelete} />
        )}

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