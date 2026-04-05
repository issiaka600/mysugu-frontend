import type { Restaurant, Dish, Category, User, Notification, Promotion, Address, Review } from '@/types'
import type {
  ApiRestaurant, ApiPlat, ApiCategory, ApiUser, CategoriePlat,
  ApiNotification, ApiPromotion, ApiAdresseLivraison, ApiAvis,
} from '@/types/api'
import { DELIVERY_FEE } from '@/utils/format'

// ─── Category ──────────────────────────────────────────────────────────────

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  africain:       '🍽️',
  'cuisine africaine': '🍽️',
  sénégalais:     '🍚',
  malien:         '🍛',
  'fast-food':    '🍔',
  burger:         '🍔',
  pizza:          '🍕',
  asiatique:      '🍜',
  pâtisserie:     '🍰',
  épicerie:       '🛒',
  supérette:      '🛒',
  boisson:        '🧃',
  dessert:        '🍰',
  poisson:        '🐟',
  poulet:         '🍗',
  grillade:       '🔥',
  sandwich:       '🥖',
  salade:         '🥗',
  marocain:       '🥘',
  traditionnel:   '🍲',
  italien:        '🍝',
}

function getCategoryEmoji(nom: string): string {
  const key = nom.toLowerCase()
  for (const [k, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
    if (key.includes(k)) return emoji
  }
  return '🍽️'
}

export function mapCategory(c: ApiCategory): Category {
  return {
    id: String(c.id),
    name: c.nom,
    emoji: getCategoryEmoji(c.nom),
    slug: c.nom.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    imageUrl: c.imageUrl ? ensureAbsoluteUrl(c.imageUrl) : undefined,
  }
}

// ─── Plat ──────────────────────────────────────────────────────────────────

const PLAT_CATEGORY_LABELS: Record<CategoriePlat, string> = {
  ENTREE:         'Entrees',
  PLAT_PRINCIPAL: 'Plats principaux',
  DESSERT:        'Desserts',
  BOISSON:        'Boissons',
  ACCOMPAGNEMENT: 'Accompagnements',
}

const FALLBACK_IMAGES: Record<CategoriePlat, string> = {
  ENTREE:         'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
  PLAT_PRINCIPAL: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
  DESSERT:        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
  BOISSON:        'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
  ACCOMPAGNEMENT: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
}

export function mapPlat(p: ApiPlat): Dish {
  return {
    id: String(p.id),
    restaurantId: String(p.restaurantId),
    restaurantName: p.restaurantNom,
    name: p.nom,
    description: p.description,
    price: p.prix,
    image: p.imageUrl
      ? ensureAbsoluteUrl(p.imageUrl)
      : FALLBACK_IMAGES[p.categoriePlat] || FALLBACK_IMAGES.PLAT_PRINCIPAL,
    categoryName: PLAT_CATEGORY_LABELS[p.categoriePlat] || p.categoriePlat,
    isPopular: false,
    isAvailable: p.isAvailable && p.availabilityMode === 'DISPONIBLE',
    ingredients: p.ingredients,
    tempsPreparation: p.tempsPreparation,
  }
}

// ─── Restaurant ────────────────────────────────────────────────────────────

const FALLBACK_RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=80',
]

export function mapRestaurant(r: ApiRestaurant): Restaurant {
  const delivery = r.tempsLivraisonMoyen || 30
  const min = Math.max(10, delivery - 10)
  const max = delivery + 10
  const fallbackImg = FALLBACK_RESTAURANT_IMAGES[r.id % FALLBACK_RESTAURANT_IMAGES.length]

  return {
    id: String(r.id),
    name: r.nom,
    description: r.description || '',
    cuisineType: r.categorie?.nom || 'Restaurant',
    rating: r.appreciation || 0,
    reviewCount: r.nombreAvis || 0,
    deliveryTime: `${min}-${max}`,
    deliveryFee: DELIVERY_FEE,
    minOrder: 0,
    coverImage: r.logoUrl ? ensureAbsoluteUrl(r.logoUrl) : fallbackImg,
    isOpen: r.isActive && r.openNow,
    isFeatured: (r.appreciation || 0) >= 4.5 && (r.nombreAvis || 0) >= 20,
    tags: buildRestaurantTags(r),
    categoryIds: r.categorie ? [String(r.categorie.id)] : [],
    address: buildAddress(r),
    heureOuverture: r.heureOuverture,
    heureFermeture: r.heureFermeture,
  }
}

function buildRestaurantTags(r: ApiRestaurant): string[] {
  const tags: string[] = []
  if ((r.appreciation || 0) >= 4.7) tags.push('Top Note')
  if (r.categorie?.nom) tags.push(r.categorie.nom)
  return tags.slice(0, 3)
}

function buildAddress(r: ApiRestaurant): string {
  if (!r.localisation) return 'Marrakech'
  const parts = [r.localisation.adresse, r.localisation.ville].filter(Boolean)
  return parts.join(', ') || 'Marrakech'
}

// ─── User ──────────────────────────────────────────────────────────────────

export function mapUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: [u.prenom, u.nom].filter(Boolean).join(' '),
    email: u.email,
    phone: u.telephone,
    avatar: u.avatar ? ensureAbsoluteUrl(u.avatar) : undefined,
    address: u.localisation?.adresse,
  }
}

// ─── Notification ─────────────────────────────────────────────────────────

export function mapNotification(n: ApiNotification): Notification {
  return {
    id: n.id,
    title: n.titre,
    message: n.message,
    type: n.type,
    read: n.lue,
    createdAt: n.createdAt,
    entityId: n.entityId,
  }
}

// ─── Promotion ────────────────────────────────────────────────────────────

export function mapPromotion(p: ApiPromotion): Promotion {
  return {
    id: p.id,
    name: p.code,
    description: p.description,
    type: 'POURCENTAGE',
    value: p.pourcentage,
    minAmount: p.montantMinCommande,
    startDate: p.dateDebut,
    endDate: p.dateFin,
    isFlash: p.estFlash,
    restaurantId: p.restaurantId ? String(p.restaurantId) : undefined,
    restaurantName: p.restaurantNom ?? undefined,
  }
}

// ─── Address ──────────────────────────────────────────────────────────────

export function mapAddress(a: ApiAdresseLivraison): Address {
  return {
    id: a.id,
    label: a.label,
    address: a.adresse,
    city: a.ville,
    postalCode: a.codePostal,
    country: a.pays,
    latitude: a.latitude,
    longitude: a.longitude,
    isDefault: a.isDefault,
  }
}

// ─── Review ───────────────────────────────────────────────────────────────

export function mapReview(a: ApiAvis): Review {
  return {
    id: a.id,
    rating: a.note,
    comment: a.commentaire,
    status: a.statut,
    restaurantName: a.restaurant?.nom,
    authorName: [a.createur.prenom, a.createur.nom].filter(Boolean).join(' '),
    authorAvatar: a.createur.avatar ? ensureAbsoluteUrl(a.createur.avatar) : undefined,
    createdAt: a.createdAt,
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function ensureAbsoluteUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:8083${url.startsWith('/') ? '' : '/'}${url}`
}
