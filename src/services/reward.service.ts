import { apiClient } from './api';

export interface RewardSummary {
  points: number;
  totalEarnedPoints: number;
  levelName: string;
  nextLevelName: string | null;
  nextLevelTarget: number;
  streakDays: number;
  streakBonus: number;
}

export type MissionTone = 'green' | 'orange' | 'blue' | 'purple';

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  tone: MissionTone;
  icon: string;
  status: 'done' | 'action';
  actionLabel?: string;
  to?: string;
  progress: number;
  max: number;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category?: string;
}

export type TransactionTone = 'yellow' | 'green' | 'red';

export interface PointTransaction {
  id: string;
  title: string;
  time: string;
  amount: number;
  tone: TransactionTone;
  icon: string;
}

export interface RedeemResult {
  redemptionId: number;
  /** Nama hadiah yang ditukar */
  reward: string;
  cost: number;
  remainingPoints: number;
  createdAt: string;
}

// ─── Aturan streak & level (sama dengan backend) ──────────────────────────────
// Bonus diberikan sekali per siklus streak saat streak mencapai 3, 7, dan 30 hari.
export const STREAK_MILESTONES = [
  { days: 3, bonus: 15 },
  { days: 7, bonus: 50 },
  { days: 30, bonus: 200 },
] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/** Milestone bonus streak berikutnya yang belum tercapai, atau null bila semua sudah tercapai. */
export const getNextStreakMilestone = (streakDays: number): StreakMilestone | null =>
  STREAK_MILESTONES.find((m) => m.days > streakDays) ?? null;

export interface LevelProgress {
  isMaxLevel: boolean;
  percent: number;
  pointsToNext: number;
}

/**
 * Level dihitung dari total poin yang pernah diperoleh (bukan saldo aktif),
 * sehingga menukar hadiah tidak menurunkan progres level.
 */
export const getLevelProgress = (summary: Pick<RewardSummary, 'totalEarnedPoints' | 'nextLevelName' | 'nextLevelTarget'>): LevelProgress => {
  if (!summary.nextLevelName || summary.nextLevelTarget <= 0) {
    return { isMaxLevel: true, percent: 100, pointsToNext: 0 };
  }
  const earned = Math.max(0, summary.totalEarnedPoints);
  return {
    isMaxLevel: false,
    percent: Math.min(100, Math.round((earned / summary.nextLevelTarget) * 100)),
    pointsToNext: Math.max(0, summary.nextLevelTarget - earned),
  };
};

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

  readArticle: async (articleId: number): Promise<{ awarded: boolean; pointsAwarded?: number; message: string }> => {
    const { data } = await apiClient.post(`/api/rewards/read-article/${articleId}`);
    return data.data;
  },
};
