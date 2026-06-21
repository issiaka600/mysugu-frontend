import apiClient from './apiClient'

export interface ApiOptionItem {
  id: number
  nom: string
  prixSupplement: number
  disponible: boolean
  ordre: number
}
export interface ApiOptionGroup {
  id: number
  nom: string
  selectionMode: 'SINGLE' | 'MULTIPLE'
  obligatoire: boolean
  minSelections: number
  maxSelections?: number | null
  ordre: number
  items: ApiOptionItem[]
}

export const platOptionsApi = {
  get: (platId: number) => apiClient.get<ApiOptionGroup[]>(`/api/plats/${platId}/options`),
}
