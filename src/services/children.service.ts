import { apiClient } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiChild {
  id: number;
  namaDepan: string;
  namaAkhir: string | null;
  tanggalLahir: string;
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
}

export interface ApiLatestGrowth {
  tinggiBadan: number;
  beratBadan: number;
  tanggalCatat: string;
}

export interface ApiBmiChartItem {
  tanggalCatat: string;
  usiaHari: number;
  bmiAnak: number;
  bmiStandarWho: number | null;
  bmiSd2Neg: number | null;
  bmiSd2Pos: number | null;
}

export interface ApiPercentileItem {
  id: number;
  tanggalCatat: string;
  usiaHari: number;
  tinggiBadan: number;
  beratBadan: number;
  persentilTinggi: string;
  persentilBerat: string;
  medianTinggi: number | null;
  medianBerat: number | null;
  risikoStuntingMl: string | null;
  mlConfidence: number | null;
}

// ─── Transformers ─────────────────────────────────────────────────────────────
const formatAgeLabel = (days: number): string => {
  if (days < 31)  return `${days}d`;
  if (days < 365) return `${Math.round(days / 30.44)}m`;
  const y = Math.floor(days / 365.25);
  const m = Math.round((days % 365.25) / 30.44);
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
};

const formatAgeMonths = (days: number): string => {
  const months = Math.round(days / 30.44);
  if (months < 12) return `${months} months`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} yr ${m} mo` : `${y} years`;
};

const formatDateDisplay = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const transformBmiChartData = (items: ApiBmiChartItem[]) =>
  (items || []).map((item) => ({
    age:    formatAgeLabel(item.usiaHari || 0),
    child:  Number(item.bmiAnak) || 0,
    p50:    item.bmiStandarWho ?? undefined,
    sd2neg: item.bmiSd2Neg ?? undefined,
    sd2pos: item.bmiSd2Pos ?? undefined,
  }));

export const transformPercentileToMeasurements = (items: ApiPercentileItem[]) =>
  (items || []).map((item) => ({
    id:               item.id,
    date:             formatDateDisplay(item.tanggalCatat),
    age:              formatAgeMonths(item.usiaHari || 0),
    height:           `${(Number(item.tinggiBadan) || 0).toFixed(1)} cm`,
    weight:           `${(Number(item.beratBadan) || 0).toFixed(1)} kg`,
    heightPct:        item.persentilTinggi || 'N/A',
    weightPct:        item.persentilBerat || 'N/A',
    medianHeight:     item.medianTinggi ? `${Number(item.medianTinggi).toFixed(1)} cm` : '—',
    medianWeight:     item.medianBerat ? `${Number(item.medianBerat).toFixed(1)} kg` : '—',
    risikoStuntingMl: item.risikoStuntingMl,
    mlConfidence:     item.mlConfidence,
  }));

export const transformToSubChartData = (
  items: ApiPercentileItem[],
  field: 'height' | 'weight'
) =>
  [...(items || [])].reverse().map((item) => ({
    age:   formatAgeLabel(item.usiaHari || 0),
    child: field === 'height' ? (Number(item.tinggiBadan) || 0) : (Number(item.beratBadan) || 0),
    median: field === 'height' ? (item.medianTinggi ?? undefined) : (item.medianBerat ?? undefined),
  }));

// ─── Service ──────────────────────────────────────────────────────────────────
export const childrenService = {
  getAll: async (): Promise<ApiChild[]> => {
    const { data } = await apiClient.get('/api/children');
    return data.data as ApiChild[];
  },

  create: async (payload: {
    namaDepan: string;
    namaAkhir?: string;
    tanggalLahir: string;
    jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
  }): Promise<ApiChild> => {
    const { data } = await apiClient.post('/api/children', payload);
    return data.data as ApiChild;
  },

  getById: async (id: number): Promise<ApiChild> => {
    const { data } = await apiClient.get(`/api/children/${id}`);
    return data.data as ApiChild;
  },

  update: async (
    id: number,
    payload: Partial<{
      namaDepan: string;
      namaAkhir: string;
      tanggalLahir: string;
      jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
    }>
  ): Promise<ApiChild> => {
    const { data } = await apiClient.put(`/api/children/${id}`, payload);
    return data.data as ApiChild;
  },

  createGrowthRecord: async (
    childId: number,
    payload: { tinggiBadan: number; beratBadan: number; tanggalCatat: string }
  ) => {
    const { data } = await apiClient.post(`/api/children/${childId}/growth`, payload);
    return data.data;
  },

  getLatestGrowth: async (childId: number): Promise<ApiLatestGrowth | null> => {
    const { data } = await apiClient.get(`/api/children/${childId}/growth/latest`);
    return data.data as ApiLatestGrowth | null;
  },

  getBmiChart: async (childId: number): Promise<ApiBmiChartItem[]> => {
    const { data } = await apiClient.get(`/api/children/${childId}/growth/bmi-chart`);
    return data.data as ApiBmiChartItem[];
  },

  getPercentile: async (childId: number): Promise<ApiPercentileItem[]> => {
    const { data } = await apiClient.get(`/api/children/${childId}/growth/percentile`);
    return data.data as ApiPercentileItem[];
  },
  
  updateGrowthRecord: async (
    recordId: number,
    payload: { tinggiBadan: number; beratBadan: number; tanggalCatat: string }
  ) => {
    const { data } = await apiClient.put(`/api/children/growth/${recordId}`, payload);
    return data.data;
  },

  deleteGrowthRecord: async (recordId: number) => {
    await apiClient.delete(`/api/children/growth/${recordId}`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/children/${id}`);
  },
};
