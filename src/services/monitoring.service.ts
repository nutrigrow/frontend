import { childrenService, type ApiChild, type ApiLatestGrowth } from './children.service';
import { healthLogService, type ApiHealthLog } from './healthLog.service';
import { teleNutritionistService, type Consultation } from './teleNutritionist.service';
import { getNextStreakMilestone } from './reward.service';

// ─── Types ────────────────────────────────────────────────────────────────────
// reminder  → interval normal terlewati      (Kondisi 1)
// warning   → interval kritis terlewati      (Kondisi 2)
// streak    → H-1 sebelum streak putus       (Kondisi 3)
// session   → 3 hari setelah sesi Tele-Consultation (Kondisi 4)
// info      → notifikasi harian dari backend (/api/health-logs/notifications)
export type MonitoringKind = 'reminder' | 'warning' | 'streak' | 'session' | 'info';

export interface MonitoringNotification {
  id: string;
  kind: MonitoringKind;
  title: string;
  message: string;
  meta: string;
  cta: { label: string; href: string };
}

export interface MonitoringRole {
  label: string;
  normalDays: number;
  criticalDays: number;
}

// ─── Interval monitoring per role (dokumen "Monitoring Notification") ────────
export const MONITORING_ROLES = {
  penggunaBiasa: { label: 'Pengguna biasa',   normalDays: 7,  criticalDays: 14 },
  ibuHamil:      { label: 'Ibu hamil',        normalDays: 3,  criticalDays: 7  },
  bayi:          { label: 'Bayi 0-12 bulan',  normalDays: 7,  criticalDays: 14 },
  balita:        { label: 'Balita 1-5 tahun', normalDays: 14, criticalDays: 30 },
} satisfies Record<string, MonitoringRole>;

const POST_SESSION_DELAY_DAYS  = 3;
const POST_SESSION_WINDOW_DAYS = 14;
const MIN_STREAK_TO_WARN       = 2;
const MAX_CHILD_AGE_MONTHS     = 60;

// Jadwal pengiriman: 08.00 dan 19.00 WIB
export const DELIVERY_HOURS = [8, 19];

// ─── Date helpers ─────────────────────────────────────────────────────────────
// Semua perhitungan hari memakai kalender WIB (Asia/Jakarta) dalam format "YYYY-MM-DD",
// sama seperti validasi tanggal Health Log dan Growth Tracker, sehingga hasilnya tidak
// bergantung pada zona waktu perangkat.
const DAY_MS = 24 * 60 * 60 * 1000;

const WIB_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
});
const WIB_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

/** Tanggal kalender WIB dari sebuah waktu, mis. "2026-11-06" */
export const toWibDate = (date: Date): string => WIB_DATE_FORMAT.format(date);

/** Jam dan menit WIB dari sebuah waktu */
export const getWibTime = (date: Date): { hour: number; minute: number } => {
  const [hour, minute] = WIB_TIME_FORMAT.format(date).split(':').map(Number);
  return { hour, minute };
};

/** "2026-10-08" atau "2026-10-08T00:00:00.000Z" → "2026-10-08" */
export const dateOnly = (value: string): string => value.slice(0, 10);

const dayIndex = (date: string): number => {
  const [y, m, d] = date.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
};

/** Selisih hari kalender antara dua tanggal "YYYY-MM-DD" */
export const daysBetween = (from: string, to: string): number => dayIndex(to) - dayIndex(from);

export const shiftDate = (date: string, days: number): string =>
  new Date((dayIndex(date) + days) * DAY_MS).toISOString().slice(0, 10);

export const ageInMonths = (birthDate: string, today: string): number => {
  const [by, bm, bd] = dateOnly(birthDate).split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  return months;
};

export const getChildRole = (child: ApiChild, today: string): MonitoringRole | null => {
  const months = ageInMonths(child.tanggalLahir, today);
  if (months < 0 || months > MAX_CHILD_AGE_MONTHS) return null;
  return months <= 12 ? MONITORING_ROLES.bayi : MONITORING_ROLES.balita;
};

export const getHealthLogRole = (latestLog: ApiHealthLog): MonitoringRole =>
  latestLog.profile_type === 'pregnant' ? MONITORING_ROLES.ibuHamil : MONITORING_ROLES.penggunaBiasa;

/**
 * Jumlah hari berturut-turut user mengisi health log, dihitung mundur dari kemarin.
 * Dipakai untuk Kondisi 3: kalau hari ini belum mengisi, streak ini hilang besok.
 * Cara hitungnya sama dengan streak di Gamification & Reward (backend calculateUserStreak).
 */
export const getStreakEndingYesterday = (logs: ApiHealthLog[], today: string): number => {
  const loggedDays = new Set(logs.map((log) => dateOnly(log.date)));
  if (loggedDays.has(today)) return 0;

  let streak = 0;
  let cursor = shiftDate(today, -1);
  while (loggedDays.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
};

// ─── Rules ────────────────────────────────────────────────────────────────────
export interface MonitoringInput {
  children: { child: ApiChild; latestGrowth: ApiLatestGrowth | null }[];
  healthLogs: ApiHealthLog[];
  consultations: Consultation[];
  backendNotifications: { type: string; message: string }[];
}

const childName = (child: ApiChild) => child.namaDepan;

// Setiap id menyertakan tanggal acuannya (tanggal catatan terakhir atau hari ini).
// Status "sudah dibaca" hanya berlaku untuk siklus pengingat tersebut, sehingga
// pengingat pada siklus atau hari berikutnya muncul lagi sebagai notifikasi baru.

const buildChildNotification = (
  child: ApiChild,
  latestGrowth: ApiLatestGrowth | null,
  today: string,
): MonitoringNotification | null => {
  const role = getChildRole(child, today);
  if (!role) return null;

  const cta = { label: 'Catat Sekarang', href: '/growth-tracker' };

  if (!latestGrowth) {
    return {
      id: `growth-empty-${child.id}`,
      kind: 'reminder',
      title: `Pertumbuhan ${childName(child)} belum tercatat`,
      message: `Yuk catat tinggi dan berat badan ${childName(child)} untuk mulai memantau perkembangannya.`,
      meta: role.label,
      cta,
    };
  }

  const lastDate = dateOnly(latestGrowth.tanggalCatat);
  const days = daysBetween(lastDate, today);

  if (days >= role.criticalDays) {
    return {
      id: `growth-critical-${child.id}-${lastDate}`,
      kind: 'warning',
      title: `${childName(child)} belum dipantau ${days} hari`,
      message: 'Pemantauan rutin penting untuk deteksi dini stunting. Jangan sampai terlewat ya!',
      meta: `${role.label} · batas kritis ${role.criticalDays} hari`,
      cta,
    };
  }

  if (days >= role.normalDays) {
    return {
      id: `growth-normal-${child.id}-${lastDate}`,
      kind: 'reminder',
      title: `Sudah ${days} hari sejak terakhir mencatat ${childName(child)}`,
      message: `Yuk pantau perkembangan ${childName(child)} sekarang.`,
      meta: `${role.label} · interval ${role.normalDays} hari`,
      cta,
    };
  }

  return null;
};

const buildHealthLogNotification = (
  healthLogs: ApiHealthLog[],
  today: string,
): MonitoringNotification | null => {
  if (healthLogs.length === 0) return null;

  const latestLog = healthLogs.reduce((latest, log) => (dateOnly(log.date) > dateOnly(latest.date) ? log : latest));
  const role = getHealthLogRole(latestLog);
  const lastDate = dateOnly(latestLog.date);
  const days = daysBetween(lastDate, today);
  const cta = { label: 'Catat Sekarang', href: '/health-log' };

  if (days >= role.criticalDays) {
    return {
      id: `health-critical-${lastDate}`,
      kind: 'warning',
      title: `Catatan kesehatan kosong ${days} hari`,
      message: 'Pencatatan rutin membantu tenaga kesehatan memantau kondisimu. Yuk isi lagi hari ini!',
      meta: `${role.label} · batas kritis ${role.criticalDays} hari`,
      cta,
    };
  }

  if (days >= role.normalDays) {
    return {
      id: `health-normal-${lastDate}`,
      kind: 'reminder',
      title: `Sudah ${days} hari sejak catatan kesehatan terakhir`,
      message: 'Yuk catat hidrasi, tidur, dan suplemen hari ini.',
      meta: `${role.label} · interval ${role.normalDays} hari`,
      cta,
    };
  }

  return null;
};

/** Pesan streak yang menyebutkan bonus poin Gamification & Reward berikutnya */
export const streakRewardMessage = (streak: number): string => {
  const next = getNextStreakMilestone(streak);
  if (!next) return 'Isi catatan kesehatan hari ini untuk mempertahankan streak-mu.';
  const remaining = next.days - streak;
  return remaining === 1
    ? `Isi catatan kesehatan hari ini untuk mencapai streak ${next.days} hari dan dapatkan bonus +${next.bonus} poin!`
    : `Isi catatan kesehatan hari ini. Tinggal ${remaining} hari lagi menuju bonus streak ${next.days} hari (+${next.bonus} poin).`;
};

const buildStreakNotification = (
  healthLogs: ApiHealthLog[],
  today: string,
): MonitoringNotification | null => {
  const streak = getStreakEndingYesterday(healthLogs, today);
  if (streak < MIN_STREAK_TO_WARN) return null;

  return {
    id: `streak-${today}`,
    kind: 'streak',
    title: `Streak ${streak} hari kamu akan hilang besok!`,
    message: streakRewardMessage(streak),
    meta: 'Streak catatan kesehatan',
    cta: { label: 'Catat Sekarang', href: '/health-log' },
  };
};

const SESSION_HELD_STATUSES: Consultation['status'][] = ['DONE', 'CONFIRMED', 'IN_PROGRESS'];

const buildPostSessionNotification = (
  input: MonitoringInput,
  now: Date,
  today: string,
): MonitoringNotification | null => {
  const pastSessions = input.consultations
    .filter((c) => SESSION_HELD_STATUSES.includes(c.status) && new Date(c.jadwalSesi) < now)
    .sort((a, b) => new Date(b.jadwalSesi).getTime() - new Date(a.jadwalSesi).getTime());

  const lastSession = pastSessions[0];
  if (!lastSession) return null;

  const sessionDay = toWibDate(new Date(lastSession.jadwalSesi));
  const days = daysBetween(sessionDay, today);
  if (days < POST_SESSION_DELAY_DAYS || days > POST_SESSION_WINDOW_DAYS) return null;

  // Kalau sudah ada pencatatan setelah sesi, pengingat tidak perlu dikirim
  const loggedAfterSession =
    input.children.some((c) => c.latestGrowth && dateOnly(c.latestGrowth.tanggalCatat) > sessionDay) ||
    input.healthLogs.some((log) => dateOnly(log.date) > sessionDay);
  if (loggedAfterSession) return null;

  const nutritionist = lastSession.ahliGizi?.user?.nama ?? 'ahli gizi';
  const hasChildren = input.children.some((c) => getChildRole(c.child, today));

  return {
    id: `session-${lastSession.id}`,
    kind: 'session',
    title: `Bagaimana hasil sesi dengan ${nutritionist}?`,
    message: 'Yuk catat perkembangan terbaru untuk melihat apakah saran nutrisinya sudah berdampak!',
    meta: `${days} hari setelah sesi Tele-Consultation`,
    cta: hasChildren
      ? { label: 'Catat Sekarang', href: '/growth-tracker' }
      : { label: 'Catat Sekarang', href: '/health-log' },
  };
};

// Pertumbuhan anak sudah ditangani aturan interval di atas
const SKIPPED_BACKEND_TYPES = new Set(['baby_growth']);

const BACKEND_TITLES: Record<string, string> = {
  daily_check:     'Catatan hari ini belum lengkap',
  supplement_teen: 'Jangan lupa Tablet Tambah Darah',
  supplement_mom:  'Jangan lupa suplemen hari ini',
  menstruation:    'Sedang masa haid?',
  anc_reminder:    'Persiapan kontrol besok',
};

const buildBackendNotifications = (
  items: MonitoringInput['backendNotifications'],
  today: string,
): MonitoringNotification[] =>
  items
    .filter((item) => !SKIPPED_BACKEND_TYPES.has(item.type))
    .map((item) => ({
      // Pengingat harian → id per hari, supaya besok muncul lagi sebagai belum dibaca
      id: `info-${item.type}-${today}`,
      kind: 'info' as const,
      title: BACKEND_TITLES[item.type] ?? 'Pengingat sehat',
      message: item.message,
      meta: 'Pengingat harian',
      cta: item.type === 'anc_reminder'
        ? { label: 'Lihat Jadwal', href: '/konsultasi-saya' }
        : { label: 'Buka Catatan', href: '/health-log' },
    }));

const KIND_PRIORITY: Record<MonitoringKind, number> = {
  warning: 0,
  streak:  1,
  session: 2,
  reminder: 3,
  info:    4,
};

export const buildMonitoringNotifications = (
  input: MonitoringInput,
  now = new Date(),
): MonitoringNotification[] => {
  const today = toWibDate(now);
  const notifications = [
    ...input.children.map(({ child, latestGrowth }) => buildChildNotification(child, latestGrowth, today)),
    buildHealthLogNotification(input.healthLogs, today),
    buildStreakNotification(input.healthLogs, today),
    buildPostSessionNotification(input, now, today),
    ...buildBackendNotifications(input.backendNotifications, today),
  ].filter((n): n is MonitoringNotification => n !== null);

  return notifications.sort((a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind]);
};

// ─── Fetch ────────────────────────────────────────────────────────────────────
const settledValue = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
  result.status === 'fulfilled' ? result.value : fallback;

export const monitoringService = {
  /** Ambil semua data yang dibutuhkan; endpoint yang gagal tidak menggagalkan yang lain. */
  fetchInput: async (): Promise<MonitoringInput> => {
    const [childrenRes, logsRes, consultationsRes, backendRes] = await Promise.allSettled([
      childrenService.getAll(),
      healthLogService.getAllLogs(),
      teleNutritionistService.getMyConsultations(),
      healthLogService.getNotifications(),
    ]);

    const children = settledValue(childrenRes, [] as ApiChild[]);
    const growthRes = await Promise.allSettled(children.map((child) => childrenService.getLatestGrowth(child.id)));

    // Anak yang datanya gagal dimuat dilewati, supaya tidak dianggap "belum tercatat"
    const childrenWithGrowth = children.flatMap((child, i) => {
      const res = growthRes[i];
      return res.status === 'fulfilled' ? [{ child, latestGrowth: res.value }] : [];
    });

    return {
      children: childrenWithGrowth,
      healthLogs: settledValue(logsRes, [] as ApiHealthLog[]),
      consultations: settledValue(consultationsRes, [] as Consultation[]),
      backendNotifications: settledValue(backendRes, { notifications: [] }).notifications ?? [],
    };
  },

  getNotifications: async (now = new Date()): Promise<MonitoringNotification[]> =>
    buildMonitoringNotifications(await monitoringService.fetchInput(), now),
};
