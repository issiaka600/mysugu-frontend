import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, ChevronRight, Star, ArrowRight, Sparkles, TrendingUp,
  UtensilsCrossed, ShoppingCart, Sparkle, Apple,
} from 'lucide-react'
import { categoriesApi, restaurantsApi, platsApi, promotionsApi, mapCategory, mapRestaurant, mapPlat, mapPromotion } from '@/api'
import type { Category, Restaurant, Dish, Promotion } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import DishCard from '@/components/DishCard'
import { RestaurantCardSkeleton, DishCardSkeleton } from '@/components/Skeleton'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80'

const HOME_CATEGORIES = [
  {
    title: 'Restaurants',
    tagline: 'Savourez vos plats préférés chez vous.',
    icon: UtensilsCrossed,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    to: '/restaurants',
  },
  {
    title: 'Alimentaires',
    tagline: 'Vos courses livrées en 30 minutes.',
    icon: ShoppingCart,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    to: '/alimentaires',
  },
  {
    title: 'Cosmétiques',
    tagline: 'Beauté et bien-être à domicile.',
    icon: Sparkle,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
    to: '/cosmetiques',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [, setCategories] = useState<Category[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [promos, setPromos] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, restRes, dishRes] = await Promise.allSettled([
          categoriesApi.getAll(),
          restaurantsApi.getTopRated(8),
          platsApi.getAll({ size: 8 }),
        ])
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data.map(mapCategory))

        // Restaurants populaires — fallback to getAll if primary yields < 4
        if (restRes.status === 'fulfilled') {
          let restList = restRes.value.data.map(mapRestaurant)
          if (restList.length < 4) {
            try {
              const extra = await restaurantsApi.getAll({ size: 8 })
              const more = (extra.data.content ?? []).map(mapRestaurant)
              const seen = new Set(restList.map(r => r.id))
              restList = [...restList, ...more.filter(r => !seen.has(r.id))].slice(0, 8)
            } catch { /* keep primary */ }
          }
          setRestaurants(restList)
        }

        // Plats tendances — fallback to getAll (page 1) if primary yields < 4
        if (dishRes.status === 'fulfilled') {
          let dishList = (dishRes.value.data.content ?? []).map(mapPlat)
          if (dishList.length < 4) {
            try {
              const extra = await platsApi.getAll({ page: 0, size: 8 })
              const more = (extra.data.content ?? []).map(mapPlat)
              const seen = new Set(dishList.map(d => d.id))
              dishList = [...dishList, ...more.filter(d => !seen.has(d.id))].slice(0, 8)
            } catch { /* keep primary */ }
          }
          setDishes(dishList)
        }

        try {
          const promoRes = await promotionsApi.getAll()
          setPromos(promoRes.data.map(mapPromotion))
        } catch { /* ignore */ }
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/restaurants?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Hero */}
      <section className="relative bg-hero-gradient overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-brand-200/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <AnimatedElement className="delay-100">
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-warm-900 leading-[1.05] mb-4">
                  Tout ce dont vous avez envie,{' '}
                  <span className="text-brand-gradient">livré chez vous.</span>
                </h1>
              </AnimatedElement>

              <AnimatedElement className="delay-200">
                <p className="font-display font-semibold text-lg md:text-xl text-warm-700 mb-4 inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-2">
                  <Apple size={18} className="fill-brand-500 text-brand-500" />
                  Repas · Alimentation · Cosmétiques · et bien plus
                </p>
              </AnimatedElement>

              <AnimatedElement className="delay-300">
                <p className="text-base md:text-lg text-warm-500 mb-8 max-w-xl mx-auto lg:mx-0">
                  MySuku, c'est plus qu'une application de livraison, c'est toute une vie simplifiée.
                </p>
              </AnimatedElement>

              <AnimatedElement className="delay-400">
                <form onSubmit={handleSearch} className="relative max-w-xl mx-auto lg:mx-0">
                  <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-warm-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un restaurant ou un plat..."
                    className="w-full pl-14 pr-32 py-4 bg-white rounded-2xl shadow-card text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:shadow-brand-sm transition-all text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-2.5 !px-5 text-sm"
                  >
                    Rechercher
                  </button>
                </form>
              </AnimatedElement>
            </div>

            {/* Hero visual */}
            <AnimatedElement className="lg:col-span-5 delay-300">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -top-6 -right-6 w-40 h-40 bg-brand-200/40 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-brand-100/60 rounded-full blur-2xl" />
                <div className="relative aspect-square rounded-[40%_60%_55%_45%/45%_55%_45%_55%] overflow-hidden shadow-warm-lg ring-8 ring-white/70">
                  <img
                    src={HERO_IMAGE}
                    alt="Délicieux repas livré"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-float px-4 py-3 hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Sparkles size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-warm-400">Note moyenne</p>
                    <p className="font-display font-bold text-warm-900 text-sm">4.8 / 5 ★</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-2 bg-white rounded-2xl shadow-float px-4 py-3 hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <ShoppingCart size={18} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-warm-400">Livraison</p>
                    <p className="font-display font-bold text-warm-900 text-sm">30-45 min</p>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          </div>

          {/* Centered, larger stats */}
          <AnimatedElement className="delay-500">
            <div className="mt-14 md:mt-20 flex flex-wrap items-start justify-center gap-x-10 sm:gap-x-16 gap-y-6">
              {[
                { value: '30+',     label: 'Partenaires' },
                { value: '30-45min',label: 'Livraison' },
                { value: '10+',     label: 'Variétés' },
                { value: '24/7',    label: 'Disponible' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="font-display font-extrabold text-3xl md:text-4xl text-brand-500">{stat.value}</p>
                  <p className="text-sm md:text-base text-warm-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Intro + Category cards (image-backed) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 md:mt-16">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <p className="text-base md:text-lg text-warm-700 leading-relaxed">
            Découvrez les meilleurs <span className="font-semibold text-warm-900">plats subsahariens et locaux</span>,
            vos <span className="font-semibold text-warm-900">produits alimentaires</span> et{' '}
            <span className="font-semibold text-warm-900">cosmétiques</span>, tout en un seul endroit.
            Passez votre commande et faites-vous livrer en quelques minutes,
            avec des frais de livraison bas !
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOME_CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.to}
                to={cat.to}
                className="group relative aspect-[4/3] sm:aspect-[5/3] md:aspect-[4/5] rounded-3xl overflow-hidden card-lift shadow-card"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full bg-white/95 text-warm-900 text-xs font-bold shadow">
                  {cat.title}
                </span>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                  <h3 className="font-display font-extrabold text-white text-2xl md:text-3xl leading-tight max-w-[70%] drop-shadow">
                    {cat.tagline}
                  </h3>
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white shrink-0 ring-1 ring-white/40 group-hover:bg-brand-500 group-hover:ring-brand-500 transition-colors">
                    <Icon size={20} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Promotions */}
      {promos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
          <SectionHeader title="Offres du moment" subtitle="Profitez de nos promotions exclusives" icon={<Sparkles size={20} className="text-brand-500" />} linkTo="/promotions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {promos.slice(0, 3).map(promo => (
              <div key={promo.id} className="relative bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-6 text-white overflow-hidden group cursor-pointer hover:shadow-brand-lg transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
                <div className="relative">
                  {promo.isFlash && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold mb-3">
                      FLASH
                    </span>
                  )}
                  <h3 className="font-display font-bold text-xl mb-2">{promo.name}</h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{promo.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-2xl">
                      {promo.type === 'POURCENTAGE' ? `-${promo.value}%` : `-${promo.value} DH`}
                    </span>
                    <ArrowRight size={20} className="text-white/60 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured restaurants — hidden when empty after loading */}
      {(loading || restaurants.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
          <SectionHeader title="Restaurants populaires" subtitle="Les mieux notés par nos clients" icon={<Star size={20} className="text-amber-400 fill-amber-400" />} linkTo="/restaurants" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
              : restaurants.slice(0, 4).map(r => <RestaurantCard key={r.id} restaurant={r} />)
            }
          </div>
          {!loading && restaurants.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
              {restaurants.slice(4, 8).map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          )}
        </section>
      )}

      {/* Popular dishes — hidden when empty after loading */}
      {(loading || dishes.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
          <SectionHeader title="Plats tendances" subtitle="Les plus commandés du moment" icon={<TrendingUp size={20} className="text-brand-500" />} linkTo="/restaurants" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <DishCardSkeleton key={i} />)
              : dishes.slice(0, 8).map(d => (
                  <DishCard key={d.id} dish={d} restaurantId={d.restaurantId} restaurantName={d.restaurantName || ''} layout="grid" />
                ))
            }
          </div>
        </section>
      )}

      {/* Download app section (replaces dark CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 mb-8">
        <div className="bg-white rounded-4xl shadow-card overflow-hidden">
          <div className="grid md:grid-cols-2 items-center">
            {/* Phone visual */}
            <div className="relative bg-gradient-to-br from-brand-50 via-warm-100 to-brand-100 p-8 md:p-12 min-h-[360px] flex items-center justify-center overflow-hidden">
              <div className="absolute top-10 left-10 w-24 h-24 bg-brand-300/30 rounded-full blur-2xl" />
              <div className="absolute bottom-12 right-8 w-32 h-32 bg-brand-400/30 rounded-full blur-2xl" />
              <div className="relative w-[228px] rotate-[-6deg] hover:rotate-0 transition-transform duration-500" aria-label="Aperçu de l'application MySuku">
                <div className="rounded-[2.2rem] bg-warm-900 p-2.5 shadow-float">
                  <div className="rounded-[1.7rem] overflow-hidden bg-warm-50 aspect-[9/19]">
                    <div className="bg-brand-gradient px-4 pt-7 pb-5 text-white">
                      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/40" />
                      <p className="font-display font-extrabold text-lg leading-none">MySuku</p>
                      <p className="text-[11px] text-white/80 mt-1">Livré chez vous en minutes</p>
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2">
                        <Search size={13} className="text-warm-500" />
                        <span className="text-[10px] text-warm-500">Rechercher…</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-sm">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-200 to-brand-400" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 w-2/3 rounded-full bg-warm-200" />
                            <div className="h-2 w-1/3 rounded-full bg-warm-100" />
                          </div>
                          <div className="h-5 w-5 rounded-full bg-brand-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text + store badges */}
            <div className="p-8 md:p-12 text-center md:text-left">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-brand-500 mb-4">
                Téléchargez l'application MySuku
              </h2>
              <p className="text-warm-600 leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                Commandez tout ce dont vous avez envie et faites-vous livrer
                en quelques minutes, avec des frais de livraison bas !
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-warm-900 text-white rounded-2xl pl-4 pr-5 py-3 hover:bg-black transition-colors shadow-card"
                  aria-label="Télécharger sur l'App Store"
                >
                  <AppleIcon />
                  <span className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider opacity-80">Download on the</span>
                    <span className="block font-display font-bold text-base leading-none">App Store</span>
                  </span>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-warm-900 text-white rounded-2xl pl-4 pr-5 py-3 hover:bg-black transition-colors shadow-card"
                  aria-label="Disponible sur Google Play"
                >
                  <PlayIcon />
                  <span className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider opacity-80">Disponible sur</span>
                    <span className="block font-display font-bold text-base leading-none">Google Play</span>
                  </span>
                </a>
              </div>

              <Link
                to="/restaurants"
                className="mt-8 inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold text-sm"
              >
                Ou commandez directement ici <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ title, subtitle, icon, linkTo }: { title: string; subtitle: string; icon: React.ReactNode; linkTo: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <Link to={linkTo} className="text-sm text-brand-500 font-semibold hover:text-brand-600 flex items-center gap-1 shrink-0">
        Voir tout <ChevronRight size={16} />
      </Link>
    </div>
  )
}

function AnimatedElement({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`${visible ? 'animate-fade-up' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.42 2.21-1.115 3.005-.7.815-1.86 1.45-2.99 1.36-.13-1.085.4-2.21 1.05-2.94.74-.83 2.04-1.47 3.055-1.425zM20.5 17.27c-.55 1.27-.81 1.83-1.52 2.95-.99 1.55-2.385 3.48-4.115 3.5-1.535.015-1.93-.99-4.005-.98-2.075.01-2.51 1-4.045.985-1.73-.02-3.05-1.77-4.04-3.32-2.78-4.34-3.07-9.43-1.355-12.13.96-1.51 2.555-2.39 4.05-2.39 1.525 0 2.485.83 3.745.83 1.225 0 1.97-.83 3.735-.83 1.34 0 2.755.73 3.78 2-3.32 1.81-2.78 6.55.77 6.96-.66 1.45-.79 1.62-.99 2.225z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="#FFCE48" d="M3 3.5v17l9-8.5z" />
      <path fill="#FF3D44" d="M21 12l-5-2.8L12 12l4 2.8z" />
      <path fill="#48C7F4" d="M3 3.5L12 12 3 20.5l-.55-.55c-.28-.28-.45-.66-.45-1.05V5.1c0-.39.17-.77.45-1.05L3 3.5z" />
      <path fill="#5ABF6F" d="M12 12L3 3.5l13 7.7z" />
      <path fill="#3FA855" d="M12 12L3 20.5l13-7.7z" opacity=".95" />
    </svg>
  )
}
