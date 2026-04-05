import apiClient from './apiClient'
import type { ApiPromotion } from '@/types/api'

export const promotionsApi = {
  getAll: () =>
    apiClient.get<ApiPromotion[]>('/api/promotions'),

  getById: (id: number | string) =>
    apiClient.get<ApiPromotion>(`/api/promotions/${id}`),

  getFlash: () =>
    apiClient.get<ApiPromotion[]>('/api/promotions/flash'),

  getByRestaurant: (restaurantId: number | string) =>
    apiClient.get<ApiPromotion[]>(`/api/promotions/restaurant/${restaurantId}`),
}
