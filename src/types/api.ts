// ─── Backend API Response Types ────────────────────────────────────────────

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

export interface ApiLocalisation {
  latitude: number
  longitude: number
  adresse: string
  ville: string
  codePostal: string
  pays: string
}

export interface ApiUser {
  id: number
  email: string
  nom: string
  prenom: string
  telephone: string
  role: 'CLIENT' | 'LIVREUR' | 'RESTAURANT_OWNER' | 'RESTAURANT_STAFF' | 'ADMIN'
  avatar: string | null
  localisation: ApiLocalisation | null
  isActive: boolean
  emailVerified: boolean
  livreurDisponible: boolean
  createdAt: string
  updatedAt?: string
}

export interface ApiLoginResponse {
  token: string
  user: ApiUser
}

export interface ApiCategory {
  id: number
  nom: string
  description: string | null
  imageUrl: string | null
}

export interface ApiRestaurant {
  id: number
  nom: string
  description: string
  logoUrl: string | null
  appreciation: number
  nombreAvis: number
  tempsLivraisonMoyen: number
  localisation: ApiLocalisation
  categorie: ApiCategory | null
  isActive: boolean
  autoCloseEnabled: boolean
  openNow: boolean
  heureOuverture: string
  heureFermeture: string
  distance?: number
  commissionPourcentage: number
  zoneDeploiement?: { id: number; nom: string } | null
}

export type CategoriePlat = 'ENTREE' | 'PLAT_PRINCIPAL' | 'DESSERT' | 'BOISSON' | 'ACCOMPAGNEMENT'
export type DispoMode    = 'DISPONIBLE' | 'INDISPONIBLE_JUSQUA' | 'RUPTURE_DE_STOCK'

export interface ApiPlat {
  id: number
  nom: string
  description: string
  prix: number
  currency: string
  currencySymbol: string
  imageUrl: string | null
  ingredients: string[]
  categoriePlat: CategoriePlat
  isAvailable: boolean
  availabilityMode: DispoMode
  indisponibleJusqua: string | null
  tempsPreparation: number
  restaurantId: number
  restaurantNom: string
  optionGroups?: ApiOptionGroup[]
}

export interface ApiPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface ApiLigneCommande {
  id: number
  plat: ApiPlat
  quantite: number
  prixUnitaire: number
  montantTotal: number
  currency: string
  currencySymbol: string
  remarque: string | null
}

export type StatutCommande =
  | 'EN_ATTENTE' | 'CONFIRMEE' | 'EN_PREPARATION'
  | 'PRETE' | 'EN_COURS' | 'LIVREE' | 'ANNULEE' | 'NON_FINALISEE'

export type MethodePaiement = 'CARTE_BANCAIRE' | 'ESPECES'
export type ModeReception   = 'LIVRAISON' | 'RETRAIT_SUR_PLACE'
export type StatutPaiement  = 'EN_ATTENTE' | 'PAYE' | 'REMBOURSE' | 'ECHOUE'

export interface ApiCommande {
  id: number
  numeroCommande: string
  client: ApiUser
  restaurant: ApiRestaurant
  livreur: ApiUser | null
  lignesCommande: ApiLigneCommande[]
  statut: StatutCommande
  adresseLivraison: ApiLocalisation
  montantTotal: number
  montantRemise: number
  montantFinal: number
  codePromoUtilise: string | null
  fraisLivraison: number
  tempsLivraisonEstime: number
  commentaire: string | null
  raisonAnnulation: string | null
  modeReception: ModeReception
  methodePaiement: MethodePaiement
  statutPaiement: StatutPaiement
  montantCommissionTotal: number
  stripeClientSecret?: string
  createdAt: string
  updatedAt: string
  livreeAt: string | null
}

export interface ApiCommandeRequest {
  clientId: number
  restaurantId: number
  lignes: { platId: number; quantite: number; remarque?: string; optionItemIds?: number[] }[]
  adresseLivraison: {
    latitude: number
    longitude: number
    adresse: string
    ville: string
    codePostal?: string
    pays?: string
  }
  commentaire?: string
  methodePaiement: MethodePaiement
  modeReception: ModeReception
  codePromo?: string
}

export interface ApiPromoValidation {
  valid: boolean
  code: string
  remise: number
  montantApresRemise: number
  message: string
}

export interface ApiFavoriToggle {
  isFavori: boolean
  action: 'AJOUTE' | 'SUPPRIME'
}

// ─── Notifications ────────────────────────────────────────────────────────

export type TypeNotification =
  | 'COMMANDE_CONFIRMEE' | 'COMMANDE_EN_PREPARATION' | 'COMMANDE_PRETE'
  | 'COMMANDE_EN_COURS' | 'COMMANDE_LIVREE' | 'COMMANDE_ANNULEE'
  | 'LIVREUR_ASSIGNE' | 'AVIS_MODERE' | 'PROMOTION' | 'SYSTEME'

export interface ApiNotification {
  id: number
  titre: string
  message: string
  type: TypeNotification
  lue: boolean
  createdAt: string
  entityId: number | null
}

// ─── Wallet ───────────────────────────────────────────────────────────────

export interface ApiWallet {
  solde: number
  montantTotalRechargements: number
  derniereMaj: string
}

export type TypeTransaction = 'CREDIT' | 'DEBIT' | 'REMBOURSEMENT' | 'RECHARGE'

export interface ApiTransactionWallet {
  id: number
  type: TypeTransaction
  montant: number
  soldeApres: number
  description: string
  reference: string | null
  createdAt: string
}

// ─── Loyalty ──────────────────────────────────────────────────────────────

export type NiveauFidelite = 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE'
export type TypeTransactionPoints = 'GAIN' | 'UTILISATION' | 'EXPIRATION' | 'BONUS'

export interface ApiPointsFidelite {
  points: number
  niveauFidelite: NiveauFidelite
  pointsProchainNiveau: number
}

export interface ApiTransactionPoints {
  id: number
  type: TypeTransactionPoints
  points: number
  description: string
  createdAt: string
}

// ─── Reviews ──────────────────────────────────────────────────────────────

export type StatutAvis = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE'

export interface ApiAvis {
  id: number
  note: number
  commentaire: string
  statut: StatutAvis
  restaurant?: ApiRestaurant
  livreur?: ApiUser
  createur: ApiUser
  createdAt: string
}

// ─── Promotions ───────────────────────────────────────────────────────────

export type TypeReduction = 'POURCENTAGE' | 'MONTANT_FIXE'

export interface ApiPromotion {
  id: number
  code: string
  description: string
  pourcentage: number
  montantMinCommande: number
  dateDebut: string
  dateFin: string
  isActive: boolean
  estFlash: boolean
  restaurantId: number | null
  restaurantNom: string | null
  usageCount: number
  usageMax: number | null
}

// ─── Addresses ────────────────────────────────────────────────────────────

export interface ApiAdresseLivraison {
  id: number
  label: string
  adresse: string
  ville: string
  codePostal: string
  pays: string
  latitude: number
  longitude: number
  isDefault: boolean
}

export interface ApiAdresseLivraisonCreate {
  label: string
  adresse: string
  ville: string
  codePostal?: string
  pays?: string
  latitude: number
  longitude: number
}

// ─── Zones de deploiement ─────────────────────────────────────────────────

export interface ApiZoneDeploiement {
  id: number
  nom: string
  description: string | null
  centreLatitude: number
  centreLongitude: number
  rayonKm: number
  fraisLivraisonMin: number | null
  distanceMinKm: number | null
  prixExtraParKm: number | null
  isActive: boolean
  createdAt: string
}

// ─── Favori ───────────────────────────────────────────────────────────────

export interface ApiFavori {
  id: number
  restaurant: ApiRestaurant
  createdAt: string
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string>
}
