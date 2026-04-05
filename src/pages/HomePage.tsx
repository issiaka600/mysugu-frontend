import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ChevronRight, Clock, Star, ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { categoriesApi, restaurantsApi, platsApi, promotionsApi, mapCategory, mapRestaurant, mapPlat, mapPromotion, extractErrorMessage } from '@/api'
import type { Category, Restaurant, Dish, Promotion } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import DishCard from '@/components/DishCard'
import { RestaurantCardSkeleton, DishCardSkeleton, CategorySkeleton } from '@/components/Skeleton'

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
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
        if (restRes.status === 'fulfilled') setRestaurants(restRes.value.data.map(mapRestaurant))
        if (dishRes.status === 'fulfilled') setDishes(dishRes.value.data.content.map(mapPlat))

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
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-brand-200/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-28 relative">
          <div className="max-w-2xl">
            <AnimatedElement className="delay-100">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold mb-6">
                <Zap size={14} className="fill-brand-500" />
                Livraison en 30 min
              </span>
            </AnimatedElement>

            <AnimatedElement className="delay-200">
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-warm-900 leading-[1.1] mb-5">
                Vos plats preferes,{' '}
                <span className="text-brand-gradient">livres chez vous</span>
              </h1>
            </AnimatedElement>

            <AnimatedElement className="delay-300">
              <p className="text-lg text-warm-500 mb-8 max-w-lg">
                Decouvrez les meilleurs restaurants de Bamako et commandez en quelques clics.
              </p>
            </AnimatedElement>

            <AnimatedElement className="delay-400">
              <form onSubmit={handleSearch} className="relative max-w-xl">
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

            {/* Stats */}
            <AnimatedElement className="delay-500">
              <div className="flex items-center gap-6 mt-10">
                {[
                  { value: '500+', label: 'Restaurants' },
                  { value: '30min', label: 'Livraison' },
                  { value: '24/7', label: 'Disponible' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display font-extrabold text-xl text-brand-500">{stat.value}</p>
                    <p className="text-xs text-warm-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title text-lg">Categories</h2>
            <Link to="/restaurants" className="text-sm text-brand-500 font-semibold hover:text-brand-600 flex items-center gap-1">
              Tout voir <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-thin pb-2">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
            ) : (
              categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/restaurants?cat=${cat.id}`}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-warm-50 group-hover:bg-brand-50 flex items-center justify-center text-2xl transition-colors group-hover:shadow-brand-sm">
                    {cat.emoji}
                  </div>
                  <span className="text-xs font-medium text-warm-600 group-hover:text-brand-500 transition-colors text-center w-16 truncate">
                    {cat.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promotions */}
      {promos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
          <SectionHeader title="Offres du moment" subtitle="Profitez de nos promotions exclusives" icon={<Sparkles size={20} className="text-brand-500" />} linkTo="/promotions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {promos.slice(0, 3).map(promo => (
              <div key={promo.id} className="relative bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl p-6 text-white overflow-hidden group cursor-pointer hover:shadow-brand-lg transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
                <div className="relative">
                  {promo.isFlash && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold mb-3">
                      <Zap size={10} className="fill-white" /> FLASH
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

      {/* Featured restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <SectionHeader title="Restaurants populaires" subtitle="Les mieux notes par nos clients" icon={<Star size={20} className="text-amber-400 fill-amber-400" />} linkTo="/restaurants" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
            : restaurants.slice(0, 4).map(r => <RestaurantCard key={r.id} restaurant={r} />)
          }
        </div>
        {restaurants.length > 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            {restaurants.slice(4, 8).map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </section>

      {/* Popular dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <SectionHeader title="Plats tendances" subtitle="Les plus commandes du moment" icon={<TrendingUp size={20} className="text-brand-500" />} linkTo="/restaurants" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <DishCardSkeleton key={i} />)
            : dishes.slice(0, 8).map(d => (
                <DishCard key={d.id} dish={d} restaurantId={d.restaurantId} restaurantName={d.restaurantName || ''} layout="grid" />
              ))
          }
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 mb-8">
        <div className="relative bg-warm-900 rounded-4xl p-10 md:p-16 overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-brand-500/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative max-w-xl mx-auto">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
              Pret a commander ?
            </h2>
            <p className="text-warm-400 mb-8">
              Decouvrez des centaines de restaurants et faites-vous livrer en quelques minutes.
            </p>
            <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2 text-lg !px-8 !py-4">
              Commander maintenant <ArrowRight size={20} />
            </Link>
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
