import apiClient from './apiClient'
import type { ApiNotification, ApiPage } from '@/types/api'

export const notificationsApi = {
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiPage<ApiNotification>>('/api/notifications', { params: { page, size } }),

  getUnread: () =>
    apiClient.get<ApiNotification[]>('/api/notifications/non-lues'),

  getUnreadCount: () =>
    apiClient.get<{ nonLues: number }>('/api/notifications/count'),

  markAsRead: (id: number) =>
    apiClient.patch<ApiNotification>(`/api/notifications/${id}/lire`),

  markAllAsRead: () =>
    apiClient.post('/api/notifications/lire-toutes'),
}
