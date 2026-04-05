import apiClient from './apiClient'
import type { ApiWallet, ApiTransactionWallet, ApiPage } from '@/types/api'

export const walletApi = {
  get: () =>
    apiClient.get<ApiWallet>('/api/wallet'),

  recharge: (montant: number, methodePaiement: string) =>
    apiClient.post<ApiWallet>('/api/wallet/recharger', { montant, methodePaiement }),

  pay: (montant: number, reference: string) =>
    apiClient.post<ApiWallet>('/api/wallet/payer', { montant, reference }),

  getTransactions: (page = 0, size = 20) =>
    apiClient.get<ApiPage<ApiTransactionWallet>>('/api/wallet/transactions', { params: { page, size } }),
}
