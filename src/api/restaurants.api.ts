import apiClient from './apiClient'
import type { ApiRestaurant, ApiPage } from '@/types/api'

export interface RestaurantListParams {
  page?: number
  size?: number
  categorieId?: number | string
  latitude?: number
  longitude?: number
  maxDistance?: number
  vertical?: string
}

export const restaurantsApi = {
  /**
   * GET /api/restaurants
   * Public — paginated list with optional filters
   */
  getAll: (params: RestaurantListParams = {}) =>
    apiClient.get<ApiPage<ApiRestaurant>>('/api/restaurants', {
      params: { page: 0, size: 20, ...params },
    }),

  /**
   * GET /api/restaurants/:id
   * Public
   */
  getById: (id: number | string) =>
    apiClient.get<ApiRestaurant>(`/api/restaurants/${id}`),

  /**
   * GET /api/restaurants/search?keyword=...
   * Public
   */
  search: (keyword: string) =>
    apiClient.get<ApiRestaurant[]>('/api/restaurants/search', {
      params: { keyword },
    }),

  /**
   * GET /api/restaurants/top-rated?limit=N
   * Public
   */
  getTopRated: (limit = 6) =>
    apiClient.get<ApiRestaurant[]>('/api/restaurants/top-rated', {
      params: { limit },
    }),

  /**
   * GET /api/restaurants/nearby
   * Public
   */
  getNearby: (latitude: number, longitude: number, radiusKm = 10) =>
    apiClient.get<ApiRestaurant[]>('/api/restaurants/nearby', {
      params: { latitude, longitude, radiusKm },
    }),
}
