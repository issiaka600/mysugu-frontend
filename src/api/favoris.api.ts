import apiClient from './apiClient'
import type { ApiFavoriToggle } from '@/types/api'

export const favorisApi = {
  /**
   * GET /api/favoris
   * Requires CLIENT role
   */
  getAll: () =>
    apiClient.get('/api/favoris'),

  /**
   * POST /api/favoris/:restaurantId/toggle
   * Requires CLIENT role
   */
  toggle: (restaurantId: number | string) =>
    apiClient.post<ApiFavoriToggle>(`/api/favoris/${restaurantId}/toggle`),

  /**
   * GET /api/favoris/:restaurantId/status
   * Requires CLIENT role
   */
  getStatus: (restaurantId: number | string) =>
    apiClient.get<{ isFavori: boolean }>(`/api/favoris/${restaurantId}/status`),
}
