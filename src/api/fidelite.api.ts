import apiClient from './apiClient'
import type { ApiPointsFidelite, ApiTransactionPoints, ApiPage } from '@/types/api'

export const fideliteApi = {
  get: () =>
    apiClient.get<ApiPointsFidelite>('/api/fidelite'),

  getHistory: (page = 0, size = 20) =>
    apiClient.get<ApiPage<ApiTransactionPoints>>('/api/fidelite/historique', { params: { page, size } }),
}
