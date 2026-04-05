import type { Category, Restaurant, Dish } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Tout voir',       emoji: '🍽️',  slug: 'all' },
  { id: 'c2', name: 'Riz & Céréales',  emoji: '🍚',  slug: 'riz',      count: 42 },
  { id: 'c3', name: 'Poulet',          emoji: '🍗',  slug: 'poulet',   count: 38 },
  { id: 'c4', name: 'Poisson',         emoji: '🐟',  slug: 'poisson',  count: 29 },
  { id: 'c5', name: 'Burgers',         emoji: '🍔',  slug: 'burgers',  count: 24 },
  { id: 'c6', name: 'Pizza',           emoji: '🍕',  slug: 'pizza',    count: 18 },
  { id: 'c7', name: 'Épicerie',        emoji: '🛒',  slug: 'epicerie', count: 60 },
  { id: 'c8', name: 'Desserts',        emoji: '🍰',  slug: 'desserts', count: 21 },
  { id: 'c9', name: 'Boissons',        emoji: '🧃',  slug: 'boissons', count: 33 },
  { id: 'c10', name: 'Sandwichs',      emoji: '🥖',  slug: 'sandwichs',count: 15 },
  { id: 'c11', name: 'Salades',        emoji: '🥗',  slug: 'salades',  count: 12 },
  { id: 'c12', name: 'Grillades',      emoji: '🔥',  slug: 'grillades',count: 20 },
]

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Chez Aminata',
    description: 'Cuisine sénégalaise authentique — Thiéboudienne, Yassa, Mafé maison',
    cuisineType: 'Cuisine sénégalaise',
    rating: 4.9,
    reviewCount: 312,
    deliveryTime: '25-40',
    deliveryFee: 500,
    minOrder: 2000,
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80',
    isOpen: true,
    isFeatured: true,
    tags: ['⭐ Top Noté', '🇸🇳 Sénégalais', '❤️ Populaire'],
    categoryIds: ['c2', 'c3', 'c4'],
    address: 'Hamdallaye, Bamako',
  },
  {
    id: 'r2',
    name: 'Le Griot d\'Or',
    description: 'Saveurs maliennes traditionnelles — Riz gras, Tô, Poulet téliko',
    cuisineType: 'Cuisine malienne',
    rating: 4.7,
    reviewCount: 198,
    deliveryTime: '30-45',
    deliveryFee: 500,
    minOrder: 1500,
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80',
    isOpen: true,
    isFeatured: true,
    tags: ['🇲🇱 Malien', '🏠 Fait maison'],
    categoryIds: ['c2', 'c3', 'c12'],
    address: 'ACI 2000, Bamako',
  },
  {
    id: 'r3',
    name: 'Burger Bamako',
    description: 'Burgers artisanaux, frites croustillantes, sauces maison. Le meilleur burger de la capitale.',
    cuisineType: 'Fast-Food',
    rating: 4.6,
    reviewCount: 276,
    deliveryTime: '15-25',
    deliveryFee: 750,
    minOrder: 3000,
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&q=80',
    isOpen: true,
    isFeatured: true,
    tags: ['🍔 Burgers', '⚡ Rapide'],
    categoryIds: ['c5'],
    address: 'Badalabougou, Bamako',
  },
  {
    id: 'r4',
    name: 'Pizza Palace',
    description: 'Pizzas au feu de bois, pâte fine croustillante. Ingrédients frais chaque jour.',
    cuisineType: 'Pizzeria',
    rating: 4.5,
    reviewCount: 143,
    deliveryTime: '20-35',
    deliveryFee: 1000,
    minOrder: 4000,
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=80',
    isOpen: true,
    isFeatured: false,
    tags: ['🍕 Pizza', '🔥 Four à bois'],
    categoryIds: ['c6'],
    address: 'Hippodrome, Bamako',
  },
  {
    id: 'r5',
    name: 'Dakar Express',
    description: 'Sandwichs chauds, dibi, brochettes de mouton grillées. La street food de Dakar chez vous.',
    cuisineType: 'Street food',
    rating: 4.8,
    reviewCount: 421,
    deliveryTime: '15-30',
    deliveryFee: 500,
    minOrder: 1000,
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=80',
    isOpen: true,
    isFeatured: true,
    tags: ['🥖 Sandwichs', '🔥 Grillades', '⚡ Express'],
    categoryIds: ['c10', 'c12'],
    address: 'Quinzambougou, Bamako',
  },
  {
    id: 'r6',
    name: 'La Pâtisserie',
    description: 'Gâteaux, croissants, pains artisanaux. Douceurs françaises et créations locales.',
    cuisineType: 'Boulangerie & Pâtisserie',
    rating: 4.4,
    reviewCount: 87,
    deliveryTime: '20-30',
    deliveryFee: 750,
    minOrder: 2000,
    coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&q=80',
    isOpen: false,
    isFeatured: false,
    tags: ['🍰 Desserts', '🥐 Boulangerie'],
    categoryIds: ['c8'],
    address: 'Niarela, Bamako',
  },
  {
    id: 'r7',
    name: 'Fresh Market',
    description: 'Épicerie fraîche livrée en 30 min. Fruits, légumes, viandes, produits laitiers.',
    cuisineType: 'Épicerie & Supérette',
    rating: 4.6,
    reviewCount: 534,
    deliveryTime: '20-35',
    deliveryFee: 500,
    minOrder: 5000,
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80',
    isOpen: true,
    isFeatured: true,
    tags: ['🛒 Épicerie', '🍅 Frais', '⚡ Express'],
    categoryIds: ['c7'],
    address: 'Magnambougou, Bamako',
  },
  {
    id: 'r8',
    name: 'Wok d\'Asie',
    description: 'Cuisine asiatique fusion — nems, riz cantonnais, soupes pho, sushis.',
    cuisineType: 'Cuisine asiatique',
    rating: 4.3,
    reviewCount: 95,
    deliveryTime: '25-40',
    deliveryFee: 1000,
    minOrder: 3000,
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&q=80',
    isOpen: true,
    isFeatured: false,
    tags: ['🍜 Asiatique', '🥢 Fusion'],
    categoryIds: ['c2'],
    address: 'Djélibougou, Bamako',
  },
]

export const DISHES: Dish[] = [
  // Chez Aminata (r1)
  {
    id: 'd1', restaurantId: 'r1',
    name: 'Thiéboudienne Royal',
    description: 'Le roi des plats sénégalais — riz au poisson thiof avec légumes variés, sauce tomate maison',
    price: 3500, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
    categoryName: 'Plats principaux', isPopular: true, isAvailable: true,
  },
  {
    id: 'd2', restaurantId: 'r1',
    name: 'Yassa Poulet',
    description: 'Poulet mariné au citron et oignons caramélisés, servi avec riz blanc parfumé',
    price: 3000, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
    categoryName: 'Plats principaux', isPopular: true, isAvailable: true,
  },
  {
    id: 'd3', restaurantId: 'r1',
    name: 'Mafé Bœuf',
    description: 'Ragoût d\'arachides maison avec morceaux de bœuf tendres, légumes et riz',
    price: 3500, image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=80',
    categoryName: 'Plats principaux', isPopular: false, isAvailable: true,
  },
  {
    id: 'd4', restaurantId: 'r1',
    name: 'Thiébou Yapp',
    description: 'Riz à la viande de mouton, version viande du thiéboudienne classique',
    price: 4000, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
    categoryName: 'Plats principaux', isPopular: false, isAvailable: true,
  },
  {
    id: 'd5', restaurantId: 'r1',
    name: 'Jus de Bissap',
    description: 'Infusion de fleurs d\'hibiscus fraîche, légèrement sucrée',
    price: 500, image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
    categoryName: 'Boissons', isPopular: true, isAvailable: true,
  },
  {
    id: 'd6', restaurantId: 'r1',
    name: 'Thiakry',
    description: 'Dessert sénégalais au couscous de mil avec crème de lait caillé sucré',
    price: 800, image: 'https://images.unsplash.com/photo-1567364816614-4afef71a796b?w=400&q=80',
    categoryName: 'Desserts', isPopular: false, isAvailable: true,
  },
  // Le Griot d'Or (r2)
  {
    id: 'd7', restaurantId: 'r2',
    name: 'Riz Gras Complet',
    description: 'Riz cuisiné dans un bouillon de viande et légumes, accompagné de viande de bœuf',
    price: 2500, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
    categoryName: 'Plats principaux', isPopular: true, isAvailable: true,
  },
  {
    id: 'd8', restaurantId: 'r2',
    name: 'Poulet Téliko',
    description: 'Poulet entier grillé aux épices maliennes, servi avec attiéké ou riz',
    price: 5000, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c1?w=400&q=80',
    categoryName: 'Plats principaux', isPopular: true, isAvailable: true,
  },
  {
    id: 'd9', restaurantId: 'r2',
    name: 'Sauce Arachide + Tô',
    description: 'Tô de mil accompagné d\'une onctueuse sauce arachide et légumes de saison',
    price: 1500, image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=80',
    categoryName: 'Plats principaux', isPopular: false, isAvailable: true,
  },
  {
    id: 'd10', restaurantId: 'r2',
    name: 'Brochettes de Mouton',
    description: 'Brochettes de mouton marinées et grillées, servies avec oignons et moutarde',
    price: 2000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    categoryName: 'Grillades', isPopular: true, isAvailable: true,
  },
  // Burger Bamako (r3)
  {
    id: 'd11', restaurantId: 'r3',
    name: 'Classic Burger',
    description: 'Steak haché bœuf, cheddar fondu, salade, tomate, oignon, cornichons, sauce maison',
    price: 3500, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    categoryName: 'Burgers', isPopular: true, isAvailable: true,
  },
  {
    id: 'd12', restaurantId: 'r3',
    name: 'BBQ Spécial',
    description: 'Double steak, bacon croustillant, cheddar x2, sauce BBQ fumée, oignons caramélisés',
    price: 5000, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    categoryName: 'Burgers', isPopular: true, isAvailable: true,
  },
  {
    id: 'd13', restaurantId: 'r3',
    name: 'Chicken Crispy',
    description: 'Filet de poulet pané croustillant, mayo citronnée, coleslaw, pain brioché',
    price: 4000, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80',
    categoryName: 'Burgers', isPopular: false, isAvailable: true,
  },
  {
    id: 'd14', restaurantId: 'r3',
    name: 'Frites Maison',
    description: 'Frites coupées épaisses, croustillantes dehors, moelleuses dedans',
    price: 1000, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
    categoryName: 'Accompagnements', isPopular: true, isAvailable: true,
  },
  {
    id: 'd15', restaurantId: 'r3',
    name: 'Milkshake Chocolat',
    description: 'Milkshake épais au chocolat belge, chantilly maison',
    price: 1500, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
    categoryName: 'Boissons', isPopular: false, isAvailable: true,
  },
  // Pizza Palace (r4)
  {
    id: 'd16', restaurantId: 'r4',
    name: 'Margherita',
    description: 'Sauce tomate San Marzano, mozzarella di bufala, basilic frais',
    price: 5000, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    categoryName: 'Pizzas', isPopular: false, isAvailable: true,
  },
  {
    id: 'd17', restaurantId: 'r4',
    name: 'Poulet Piquant',
    description: 'Sauce tomate, poulet épicé, poivrons, oignons rouges, crème fraîche',
    price: 6500, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80',
    categoryName: 'Pizzas', isPopular: true, isAvailable: true,
  },
  {
    id: 'd18', restaurantId: 'r4',
    name: '4 Fromages',
    description: 'Mozzarella, gorgonzola, chèvre, parmesan, miel de thym',
    price: 7000, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    categoryName: 'Pizzas', isPopular: false, isAvailable: true,
  },
  // Dakar Express (r5)
  {
    id: 'd19', restaurantId: 'r5',
    name: 'Sandwich Dibi',
    description: 'Pain baguette croustillant, agneau grillé, oignons caramélisés, moutarde',
    price: 1500, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=80',
    categoryName: 'Sandwichs', isPopular: true, isAvailable: true,
  },
  {
    id: 'd20', restaurantId: 'r5',
    name: 'Brochettes Mix',
    description: '6 brochettes assorties : bœuf, mouton, poulet, sauce piquante maison',
    price: 3000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    categoryName: 'Grillades', isPopular: true, isAvailable: true,
  },
]

export function getRestaurantDishes(restaurantId: string): Dish[] {
  return DISHES.filter(d => d.restaurantId === restaurantId)
}

export function getFeaturedRestaurants(): Restaurant[] {
  return RESTAURANTS.filter(r => r.isFeatured && r.isOpen)
}

export function getPopularDishes(): Dish[] {
  return DISHES.filter(d => d.isPopular).slice(0, 8)
}

export function searchRestaurants(query: string): Restaurant[] {
  const q = query.toLowerCase()
  return RESTAURANTS.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.cuisineType.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q)
  )
}

export function filterRestaurantsByCategory(slug: string): Restaurant[] {
  if (slug === 'all') return RESTAURANTS
  const cat = CATEGORIES.find(c => c.slug === slug)
  if (!cat) return RESTAURANTS
  return RESTAURANTS.filter(r => r.categoryIds.includes(cat.id))
}

export const PROMO_BANNERS = [
  {
    id: 'p1',
    headline: 'Livraison offerte',
    sub: 'Sur votre 1ère commande',
    code: 'BIENVENUE',
    bg: 'from-brand-500 to-brand-400',
    emoji: '🎁',
  },
  {
    id: 'p2',
    headline: '-20% ce soir',
    sub: 'Chez Aminata jusqu\'à 22h',
    code: 'SOIR20',
    bg: 'from-amber-500 to-orange-400',
    emoji: '🌙',
  },
]
