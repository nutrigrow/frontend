import { apiClient } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiHealthLog {
  id: number;
  user_id: number;
  date: string;
  day: string;
  profile_type: 'teen' | 'pregnant' | 'breastfeeding';
  water_glasses: number;
  sleep_hours: number;
  took_supplement: boolean;
  mood: number;
  is_menstruating?: boolean;
  weight_kg?: number;
  breastfeeding_count?: number;
  created_at?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MOOD_INT_TO_STR: Record<number, string> = {
  5: 'Bahagia',
  4: 'Nyaman',
  3: 'Biasa',
  2: 'Lelah',
  1: 'Sedih',
};

export const MOOD_STR_TO_INT: Record<string, number> = {
  bahagia: 5,
  nyaman:  4,
  biasa:   3,
  lelah:   2,
  sedih:   1,
};

export const CATEGORY_TO_PROFILE: Record<string, 'teen' | 'pregnant' | 'breastfeeding'> = {
  teenage:       'teen',
  pregnant:      'pregnant',
  breastfeeding: 'breastfeeding',
};

const DAY_ABBR: Record<string, string> = {
  Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
};

// ─── Transformers ─────────────────────────────────────────────────────────────
export const toISODate = (ddmmyyyy: string): string => {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};

export const mapLogToRow = (log: ApiHealthLog) => {
  const [y, mo, d] = log.date.split('-').map(Number);
  const dateObj = new Date(y, mo - 1, d);

  const dateStr = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const dayFull = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  const supplementLabel =
    log.profile_type === 'teen'     ? (log.took_supplement ? '✓ TTD'      : '✗ TTD')
    : log.profile_type === 'pregnant' ? (log.took_supplement ? '✓ Suplemen' : '✗ Suplemen')
    :                                    (log.took_supplement ? '✓ Iron'     : '✗ Iron');

  const specific =
    log.profile_type === 'teen'       ? (log.is_menstruating ? 'Sedang Haid' : 'Tidak Haid')
    : log.profile_type === 'pregnant'   ? (log.weight_kg != null ? `BB: ${log.weight_kg} Kg` : '')
    :                                      (log.breastfeeding_count != null ? `Pumping: ${log.breastfeeding_count} Sesi` : '');

  return {
    id:         log.id,
    day:        DAY_ABBR[dayFull] ?? dayFull.slice(0, 3),
    date:       dateStr,
    mood:       MOOD_INT_TO_STR[log.mood] ?? 'Biasa',
    sleep:      `${log.sleep_hours}h`,
    fluid:      `${log.water_glasses} Gelas`,
    supplement: supplementLabel,
    specific,
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────
export const healthLogService = {
  getAllLogs: async (): Promise<ApiHealthLog[]> => {
    const { data } = await apiClient.get('/api/health-logs');
    return data.data as ApiHealthLog[];
  },

  getTodayLog: async (): Promise<ApiHealthLog | null> => {
    const { data } = await apiClient.get('/api/health-logs/today');
    return data.data as ApiHealthLog | null;
  },

  getInsight: async () => {
    const { data } = await apiClient.get('/api/health-logs/insight');
    return data.data;
  },

  getNotifications: async () => {
    const { data } = await apiClient.get('/api/health-logs/notifications');
    return data.data;
  },

  createOrUpdate: async (payload: {
    date: string;
    profile_type: 'teen' | 'pregnant' | 'breastfeeding';
    water_glasses: number;
    sleep_hours: number;
    took_supplement: boolean;
    mood: number;
    is_menstruating?: boolean;
    weight_kg?: number;
    breastfeeding_count?: number;
    is_edit?: boolean;
  }): Promise<ApiHealthLog> => {
    const { data } = await apiClient.post('/api/health-logs', payload);
    return data.data as ApiHealthLog;
  },
};
