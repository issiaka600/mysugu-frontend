import apiClient from './apiClient'
import type { ApiAdresseLivraison, ApiAdresseLivraisonCreate } from '@/types/api'

export const addressesApi = {
  getAll: () =>
    apiClient.get<ApiAdresseLivraison[]>('/api/users/adresses'),

  create: (data: ApiAdresseLivraisonCreate) =>
    apiClient.post<ApiAdresseLivraison>('/api/users/adresses', data),

  update: (id: number, data: ApiAdresseLivraisonCreate) =>
    apiClient.put<ApiAdresseLivraison>(`/api/users/adresses/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/users/adresses/${id}`),

  setDefault: (id: number) =>
    apiClient.patch<ApiAdresseLivraison>(`/api/users/adresses/${id}/default`),
}
