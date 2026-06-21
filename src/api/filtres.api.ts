import apiClient from './apiClient'

export interface ApiFiltre {
  id: number
  contexte: string
  comportement: string
  categorieId?: number | null
  libelle: string
  icone?: string
  ordre: number
  actif: boolean
}

export const filtresApi = {
  getByContexte: (contexte: string) =>
    apiClient.get<ApiFiltre[]>('/api/filtres', { params: { contexte } }),
}
