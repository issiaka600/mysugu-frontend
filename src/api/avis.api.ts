import apiClient from './apiClient'
import type { ApiAvis } from '@/types/api'

export const avisApi = {
  create: (data: { note: number; commentaire: string; restaurantId: number }) =>
    apiClient.post<ApiAvis>('/api/avis', data),

  getByRestaurant: (restaurantId: number | string) =>
    apiClient.get<ApiAvis[]>(`/api/avis/restaurant/${restaurantId}`),

  getByLivreur: (livreurId: number | string) =>
    apiClient.get<ApiAvis[]>(`/api/avis/livreur/${livreurId}`),

  getMyReviews: () =>
    apiClient.get<ApiAvis[]>('/api/avis/mes-avis'),

  delete: (id: number) =>
    apiClient.delete(`/api/avis/${id}`),
}
