import { childrenService, type ApiChild, type ApiLatestGrowth } from './children.service';
import { healthLogService, type ApiHealthLog } from './healthLog.service';
import { teleNutritionistService, type Consultation } from './teleNutritionist.service';

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

// ─── Date helpers (semua dihitung per tanggal lokal, bukan per jam) ──────────
const DAY_MS = 24 * 60 * 60 * 1000;

/** "2026-10-08" atau "2026-10-08T00:00:00.000Z" → Date lokal jam 00.00 */
export const parseDateOnly = (value: string): Date => {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const startOfToday = (now = new Date()): Date =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const daysBetween = (from: Date, to: Date): number =>
  Math.round((startOfToday(to).getTime() - startOfToday(from).getTime()) / DAY_MS);

const toKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const ageInMonths = (birthDate: string, now = new Date()): number => {
  const birth = parseDateOnly(birthDate);
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return months;
};

export const getChildRole = (child: ApiChild, now = new Date()): MonitoringRole | null => {
  const months = ageInMonths(child.tanggalLahir, now);
  if (months < 0 || months > MAX_CHILD_AGE_MONTHS) return null;
  return months <= 12 ? MONITORING_ROLES.bayi : MONITORING_ROLES.balita;
};

export const getHealthLogRole = (latestLog: ApiHealthLog): MonitoringRole =>
  latestLog.profile_type === 'pregnant' ? MONITORING_ROLES.ibuHamil : MONITORING_ROLES.penggunaBiasa;

/**
 * Jumlah hari berturut-turut user mengisi health log, dihitung mundur dari kemarin.
 * Dipakai untuk Kondisi 3: kalau hari ini belum mengisi, streak ini hilang besok.
 */
export const getStreakEndingYesterday = (logs: ApiHealthLog[], now = new Date()): number => {
  const loggedDays = new Set(logs.map((log) => toKey(parseDateOnly(log.date))));
  const cursor = startOfToday(now);
  if (loggedDays.has(toKey(cursor))) return 0;

  let streak = 0;
  cursor.setDate(cursor.getDate() - 1);
  while (loggedDays.has(toKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
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

const buildChildNotification = (
  child: ApiChild,
  latestGrowth: ApiLatestGrowth | null,
  now: Date,
): MonitoringNotification | null => {
  const role = getChildRole(child, now);
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

  const days = daysBetween(parseDateOnly(latestGrowth.tanggalCatat), now);

  if (days >= role.criticalDays) {
    return {
      id: `growth-critical-${child.id}`,
      kind: 'warning',
      title: `${childName(child)} belum dipantau ${days} hari`,
      message: 'Pemantauan rutin penting untuk deteksi dini stunting. Jangan sampai terlewat ya!',
      meta: `${role.label} · batas kritis ${role.criticalDays} hari`,
      cta,
    };
  }

  if (days >= role.normalDays) {
    return {
      id: `growth-normal-${child.id}`,
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
  now: Date,
): MonitoringNotification | null => {
  if (healthLogs.length === 0) return null;

  const latestLog = healthLogs.reduce((latest, log) => (log.date > latest.date ? log : latest));
  const role = getHealthLogRole(latestLog);
  const days = daysBetween(parseDateOnly(latestLog.date), now);
  const cta = { label: 'Catat Sekarang', href: '/health-log' };

  if (days >= role.criticalDays) {
    return {
      id: 'health-critical',
      kind: 'warning',
      title: `Catatan kesehatan kosong ${days} hari`,
      message: 'Pencatatan rutin membantu tenaga kesehatan memantau kondisimu. Yuk isi lagi hari ini!',
      meta: `${role.label} · batas kritis ${role.criticalDays} hari`,
      cta,
    };
  }

  if (days >= role.normalDays) {
    return {
      id: 'health-normal',
      kind: 'reminder',
      title: `Sudah ${days} hari sejak catatan kesehatan terakhir`,
      message: 'Yuk catat hidrasi, tidur, dan suplemen hari ini.',
      meta: `${role.label} · interval ${role.normalDays} hari`,
      cta,
    };
  }

  return null;
};

const buildStreakNotification = (
  healthLogs: ApiHealthLog[],
  now: Date,
): MonitoringNotification | null => {
  const streak = getStreakEndingYesterday(healthLogs, now);
  if (streak < MIN_STREAK_TO_WARN) return null;

  return {
    id: `streak-${toKey(startOfToday(now))}`,
    kind: 'streak',
    title: `Streak ${streak} hari kamu akan hilang besok!`,
    message: 'Isi catatan kesehatan hari ini untuk mempertahankan streak-mu.',
    meta: 'Streak catatan kesehatan',
    cta: { label: 'Catat Sekarang', href: '/health-log' },
  };
};

const SESSION_HELD_STATUSES: Consultation['status'][] = ['DONE', 'CONFIRMED', 'IN_PROGRESS'];

const buildPostSessionNotification = (
  input: MonitoringInput,
  now: Date,
): MonitoringNotification | null => {
  const pastSessions = input.consultations
    .filter((c) => SESSION_HELD_STATUSES.includes(c.status) && new Date(c.jadwalSesi) < now)
    .sort((a, b) => new Date(b.jadwalSesi).getTime() - new Date(a.jadwalSesi).getTime());

  const lastSession = pastSessions[0];
  if (!lastSession) return null;

  const sessionDate = new Date(lastSession.jadwalSesi);
  const days = daysBetween(sessionDate, now);
  if (days < POST_SESSION_DELAY_DAYS || days > POST_SESSION_WINDOW_DAYS) return null;

  // Kalau sudah ada pencatatan setelah sesi, pengingat tidak perlu dikirim
  const sessionDay = startOfToday(sessionDate);
  const loggedAfterSession =
    input.children.some((c) => c.latestGrowth && parseDateOnly(c.latestGrowth.tanggalCatat) > sessionDay) ||
    input.healthLogs.some((log) => parseDateOnly(log.date) > sessionDay);
  if (loggedAfterSession) return null;

  const nutritionist = lastSession.ahliGizi?.user?.nama ?? 'ahli gizi';
  const hasChildren = input.children.some((c) => getChildRole(c.child, now));

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
): MonitoringNotification[] =>
  items
    .filter((item) => !SKIPPED_BACKEND_TYPES.has(item.type))
    .map((item) => ({
      id: `info-${item.type}`,
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
  const notifications = [
    ...input.children.map(({ child, latestGrowth }) => buildChildNotification(child, latestGrowth, now)),
    buildHealthLogNotification(input.healthLogs, now),
    buildStreakNotification(input.healthLogs, now),
    buildPostSessionNotification(input, now),
    ...buildBackendNotifications(input.backendNotifications),
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
