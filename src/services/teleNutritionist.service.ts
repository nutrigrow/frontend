import { apiClient } from './api';

export interface JadwalSpesialis {
  hari: string[];
  waktu: string[];
}

export interface Spesialis {
  id: number;
  nama: string;
  gelar: string;
  spesialisasi: string;
  pengalamanTahun: number;
  harga: {
    videoCall: number;
    chat: number;
  };
  foto: string;
  pendidikan: string[];
  registrasiMedis: string;
  tentang: string;
  bidangKeahlian: string[];
  jadwal: JadwalSpesialis;
  nextAvailable?: string;
}

export interface Consultation {
  id: number;
  jadwalSesi: string;
  metode: 'VIDEO_CALL' | 'CHAT';
  status: 'BOOKED' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  ahliGizi: {
    user: {
      nama: string;
      avatarUrl: string;
    };
    spesialisasi: string;
    fotoUrl?: string;
  };
  transaksi?: {
    id: number;
    totalHarga: number;
    statusBayar: string;
    snapToken?: string;
  };
  followUp?: {
    id: number;
    nutritionStatusEvaluation: string;
    dietaryRecommendations: string;
    nextEvaluationDate: string;
    specialNotes?: string | null;
  };
}

export interface ConsultationUserSummary {
  consultation_id: string;
  child_name: string;
  child_info: {
    child_id: string;
    name: string;
    age_months: number | null;
    gender: string;
    latest_anthropometry: {
      height_cm: number;
      weight_kg: number;
      measured_at: string;
    } | null;
  };
  ai_assessment: {
    risk_level: string;
    risk_label: string;
    z_score_height_for_age: number | null;
    z_score_weight_for_age: number | null;
    keyword_warnings: string[];
  };
  recent_health_logs: {
    avg_daily_fluid_glasses: number | null;
    mpasi_compliance: string | null;
  };
}

export interface FollowUpPayload {
  nutrition_status_evaluation: string;
  dietary_recommendations: string;
  next_evaluation_date: string;
  special_notes?: string;
}

export interface UserFollowUp {
  follow_up_id: string;
  consultation_id: string;
  nutritionist_name: string;
  consultation_date: string;
  evaluation_summary: {
    status_label: string;
    recommendations: string;
    next_evaluation_date: string;
    special_notes: string | null;
  };
}

const mapSpecialist = (s: any): Spesialis => ({
  id: s.id,
  nama: s.user?.nama || 'Spesialis',
  gelar: s.gelar || '',
  spesialisasi: s.spesialisasi || '',
  pengalamanTahun: s.pengalamanTahun || 0,
  harga: {
    videoCall: s.biayaVideoCall || 0,
    chat: s.biayaChat || 0,
  },
  foto: s.fotoUrl || s.user?.avatarUrl || '',
  pendidikan: s.pendidikan || [],
  registrasiMedis: s.registrasiMedis || '',
  tentang: s.bio || '',
  bidangKeahlian: s.bidangKeahlian || [],
  jadwal: s.jadwal || { hari: [], waktu: [] },
  nextAvailable: s.nextAvailable,
});

export const teleNutritionistService = {
  /** Get all specialists with filters */
  getSpecialists: async (filters: { search?: string; category?: string; page?: number }) => {
    const { data } = await apiClient.get('/api/specialists', { params: filters });
    return {
      specialists: data.data.specialists.map(mapSpecialist),
      pagination: data.data.pagination,
    };
  },

  /** Get specialist detail */
  getSpecialistById: async (id: string | number) => {
    const { data } = await apiClient.get(`/api/specialists/${id}`);
    return mapSpecialist(data.data.specialist);
  },

  /** Check availability for a date */
  getAvailability: async (specialistId: number, date: string) => {
    const { data } = await apiClient.get(`/api/consultations/availability/${specialistId}`, {
      params: { date },
    });
    return data.data;
  },

  /** Book a consultation */
  bookConsultation: async (payload: { ahliGiziId: number; jadwalSesi: string; metode: string }) => {
    const { data } = await apiClient.post('/api/consultations/book', payload);
    return data.data;
  },

  /** Get my consultations */
  getMyConsultations: async () => {
    const { data } = await apiClient.get('/api/consultations/me');
    return data.data as Consultation[];
  },

  /** Reschedule */
  reschedule: async (id: number, newJadwalSesi: string) => {
    const { data } = await apiClient.patch(`/api/consultations/${id}/reschedule`, { newJadwalSesi });
    return data.data;
  },

  /** Cancel */
  cancel: async (id: number, reason?: string) => {
    const { data } = await apiClient.patch(`/api/consultations/${id}/cancel`, { reason });
    return data.data;
  },

  /** Confirm payment after Midtrans success */
  confirmPayment: async (konsultasiId: number) => {
    const { data } = await apiClient.patch(`/api/consultations/${konsultasiId}/confirm-payment`);
    return data.data;
  },

  /** Get user summary for consultation (nutritionist only) */
  getUserSummary: async (consultationId: string | number): Promise<ConsultationUserSummary> => {
    const { data } = await apiClient.get(`/api/consultations/nutritionist/consultations/${consultationId}/user-summary`);
    return data.data as ConsultationUserSummary;
  },

  /** Create or update follow-up note (nutritionist only) */
  createFollowUp: async (consultationId: string | number, payload: FollowUpPayload) => {
    const { data } = await apiClient.post(`/api/consultations/nutritionist/consultations/${consultationId}/follow-up`, payload);
    return data.data;
  },

  /** Get user follow-up note (user/pasien only) */
  getUserFollowUp: async (consultationId: string | number): Promise<UserFollowUp> => {
    const { data } = await apiClient.get(`/api/consultations/user/consultations/${consultationId}/follow-up`);
    return data.data as UserFollowUp;
  },
};
