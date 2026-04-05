export interface Category {
  id: string
  name: string
  emoji: string
  slug: string
  imageUrl?: string
  count?: number
}

export interface Restaurant {
  id: string
  name: string
  description: string
  cuisineType: string
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  minOrder: number
  coverImage: string
  logoImage?: string
  isOpen: boolean
  isFeatured: boolean
  tags: string[]
  categoryIds: string[]
  address: string
  heureOuverture?: string
  heureFermeture?: string
}

export interface DishCategory {
  id: string
  name: string
}

export interface Dish {
  id: string
  restaurantId: string
  restaurantName?: string
  name: string
  description: string
  price: number
  image: string
  categoryName: string
  isPopular: boolean
  isAvailable: boolean
  ingredients?: string[]
  tempsPreparation?: number
  options?: DishOption[]
}

export interface DishOption {
  name: string
  choices: { label: string; extra: number }[]
}

export interface CartItem {
  dish: Dish
  quantity: number
  restaurantId: string
  restaurantName: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  address?: string
}

export interface CheckoutStep {
  id: number
  label: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  entityId: number | null
}

export interface Promotion {
  id: number
  name: string
  description: string
  type: 'POURCENTAGE' | 'MONTANT_FIXE'
  value: number
  minAmount: number
  startDate: string
  endDate: string
  isFlash: boolean
  restaurantId?: string
  restaurantName?: string
}

export interface Address {
  id: number
  label: string
  address: string
  city: string
  postalCode: string
  country: string
  latitude: number
  longitude: number
  isDefault: boolean
}

export interface Review {
  id: number
  rating: number
  comment: string
  status: string
  restaurantName?: string
  authorName: string
  authorAvatar?: string
  createdAt: string
}
