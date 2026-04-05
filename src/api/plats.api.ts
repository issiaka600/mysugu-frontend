import apiClient from './apiClient'
import type { ApiPlat, ApiPage, CategoriePlat } from '@/types/api'

export interface PlatListParams {
  page?: number
  size?: number
  restaurantId?: number | string
  categorie?: CategoriePlat
  available?: boolean
}

export const platsApi = {
  /**
   * GET /api/plats
   * Public — paginated
   */
  getAll: (params: PlatListParams = {}) =>
    apiClient.get<ApiPage<ApiPlat>>('/api/plats', {
      params: { page: 0, size: 50, ...params },
    }),

  /**
   * GET /api/plats/:id
   * Public
   */
  getById: (id: number | string) =>
    apiClient.get<ApiPlat>(`/api/plats/${id}`),

  /**
   * GET /api/plats/restaurant/:restaurantId
   * Public — all dishes for a restaurant
   */
  getByRestaurant: (restaurantId: number | string) =>
    apiClient.get<ApiPlat[]>(`/api/plats/restaurant/${restaurantId}`),

  /**
   * GET /api/plats/search?keyword=...
   * Public
   */
  search: (keyword: string) =>
    apiClient.get<ApiPlat[]>('/api/plats/search', {
      params: { keyword },
    }),
}
