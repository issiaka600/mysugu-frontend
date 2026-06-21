import apiClient from './apiClient'

export interface ContactCreatePayload {
  nom: string
  email: string
  telephone?: string
  sujet: string
  message: string
}

export interface ContactMessage {
  id: number
  nom: string
  email: string
  telephone?: string
  sujet: string
  message: string
  statut: 'NOUVEAU' | 'LU' | 'REPONDU' | 'ARCHIVE'
  reponse?: string
  reponduPar?: string
  reponduAt?: string
  createdAt: string
  updatedAt?: string
}

export const contactApi = {
  send: (payload: ContactCreatePayload) =>
    apiClient.post<ContactMessage>('/api/contact', payload),
}
