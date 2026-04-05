/** Format a price in Moroccan Dirham */
export function formatPrice(amount: number): string {
  return amount.toLocaleString('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' DH'
}

/** Delivery fee in MAD */
export const DELIVERY_FEE = 15

/** Human-readable order status labels */
export const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE:      'En attente',
  CONFIRMEE:       'Confirmée',
  EN_PREPARATION:  'En préparation',
  PRETE:           'Prête',
  EN_COURS:        'En livraison',
  LIVREE:          'Livrée',
  ANNULEE:         'Annulée',
  NON_FINALISEE:   'Non finalisée',
}

/** Statuses considered "active" (order is ongoing) */
export const ACTIVE_STATUTS = new Set([
  'EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'EN_COURS',
])

/** Statuses where cancellation is allowed */
export const CANCELLABLE_STATUTS = new Set(['EN_ATTENTE'])
