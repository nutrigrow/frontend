import { apiClient } from './api';

export interface RewardSummary {
  points: number;
  levelName: string;
  nextLevelName: string;
  nextLevelTarget: number;
  streakDays: number;
  streakBonus: number;
  levelProgressPercent?: number;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  points: number;
  status: 'done' | 'action';
  actionLabel?: string;
  to?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category?: string;
}

export interface PointTransaction {
  id: string;
  title: string;
  time: string;
  amount: number;
  jenis: string;
  keterangan: string;
}

export interface RedeemResult {
  redemptionId: number;
  reward: {
    id: string;
    title: string;
    cost: number;
  };
  remainingPoints: number;
  message: string;
}

export const rewardService = {
  getSummary: async (): Promise<RewardSummary> => {
    const { data } = await apiClient.get('/api/rewards/summary');
    return data.data as RewardSummary;
  },

  getCatalog: async (): Promise<RewardItem[]> => {
    const { data } = await apiClient.get('/api/rewards/catalog');
    return data.data as RewardItem[];
  },

  getMissions: async (): Promise<Mission[]> => {
    const { data } = await apiClient.get('/api/rewards/missions');
    return data.data as Mission[];
  },

  getHistory: async (): Promise<PointTransaction[]> => {
    const { data } = await apiClient.get('/api/rewards/history');
    return data.data as PointTransaction[];
  },

  redeem: async (rewardId: string): Promise<RedeemResult> => {
    const { data } = await apiClient.post('/api/rewards/redeem', { rewardId });
    return data.data as RedeemResult;
  },

  readArticle: async (articleId: number): Promise<{ awarded: boolean; pointsAwarded: number; currentPoints: number }> => {
    const { data } = await apiClient.post(`/api/rewards/read-article/${articleId}`);
    return data.data;
  },
};
