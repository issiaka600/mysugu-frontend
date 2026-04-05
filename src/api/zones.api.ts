import apiClient from './apiClient'
import type { ApiZoneDeploiement } from '@/types/api'

export const zonesApi = {
  getActives: () =>
    apiClient.get<ApiZoneDeploiement[]>('/api/zones-deploiement/actives'),
}
