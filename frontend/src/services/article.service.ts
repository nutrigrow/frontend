import { apiClient } from './api'
import type { ArticleSection } from '../data/articles'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleCard {
  id: number
  title: string
  description: string
  category: string
  image?: string | null
  author: string
  date: string
  readTime: number
}

export interface ArticleDetail extends ArticleCard {
  content: {
    intro: string
    sections: ArticleSection[]
  }
}

export interface ArticlesResponse {
  articles: ArticleCard[]
  total: number
  page: number
  totalPages: number
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const articleService = {
  /** Get paginated + filtered list of articles */
  getArticles: async (params: {
    kategori?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<ArticlesResponse> => {
    const { data } = await apiClient.get('/api/articles', { params })
    return data.data
  },

  /** Get full article by ID including rich-text content */
  getArticleById: async (id: number | string): Promise<ArticleDetail> => {
    const { data } = await apiClient.get(`/api/articles/${id}`)
    return data.data
  },

  /** Get related articles (same category, excluding current) */
  getRelatedArticles: async (id: number | string): Promise<ArticleCard[]> => {
    const { data } = await apiClient.get(`/api/articles/${id}/related`)
    return data.data
  },
}
