import apiClient from './apiClient'
import type { ApiCategory, ApiRestaurant } from '@/types/api'

export const categoriesApi = {
  /**
   * GET /api/categories
   * Public
   */
  getAll: () =>
    apiClient.get<ApiCategory[]>('/api/categories'),

  /**
   * GET /api/categories/:id
   * Public
   */
  getById: (id: number | string) =>
    apiClient.get<ApiCategory>(`/api/categories/${id}`),

  /**
   * GET /api/categories/:id/restaurants
   * Public
   */
  getRestaurants: (id: number | string) =>
    apiClient.get<ApiRestaurant[]>(`/api/categories/${id}/restaurants`),
}
