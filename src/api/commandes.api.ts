import apiClient from './apiClient'
import type { ApiCommande, ApiCommandeRequest, ApiPromoValidation } from '@/types/api'

export const commandesApi = {
  /**
   * POST /api/commandes
   * Requires CLIENT role
   */
  create: (data: ApiCommandeRequest) =>
    apiClient.post<ApiCommande>('/api/commandes', data),

  /**
   * GET /api/commandes/:id
   * Authenticated
   */
  getById: (id: number | string) =>
    apiClient.get<ApiCommande>(`/api/commandes/${id}`),

  /**
   * GET /api/commandes/numero/:numeroCommande
   * Authenticated
   */
  getByNumber: (numero: string) =>
    apiClient.get<ApiCommande>(`/api/commandes/numero/${numero}`),

  /**
   * GET /api/commandes/client/:clientId
   * Requires CLIENT or ADMIN role
   */
  getByClient: (clientId: number | string) =>
    apiClient.get<ApiCommande[]>(`/api/commandes/client/${clientId}`),

  /**
   * DELETE /api/commandes/:id
   * Cancel — returns updated order with statut=ANNULEE
   */
  cancel: (id: number | string) =>
    apiClient.delete<ApiCommande>(`/api/commandes/${id}`),

  /**
   * GET /api/commandes/:id/tracking
   * Authenticated
   */
  getTracking: (id: number | string) =>
    apiClient.get<{ trackingStatut: string; estimatedDeliveryTime: number; lastUpdate: string }>(
      `/api/commandes/${id}/tracking`
    ),

  /**
   * POST /api/codes-promo/valider
   * Requires CLIENT role
   */
  validatePromo: (code: string, montantCommande: number) =>
    apiClient.post<ApiPromoValidation>('/api/codes-promo/valider', { code, montantCommande }),
}
