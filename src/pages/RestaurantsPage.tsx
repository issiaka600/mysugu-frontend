import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { categoriesApi, restaurantsApi, mapCategory, mapRestaurant } from '@/api'
import type { Category, Restaurant } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import { RestaurantCardSkeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import Chip from '@/components/Chip'
import { filtresApi, type ApiFiltre } from '@/api/filtres.api'
import { iconForKey } from '@/lib/filterIcons'

type SortOption = 'recommended' | 'rating' | 'delivery_time'
type QuickFilter = 'all' | 'subsahariens' | 'promotions' | 'closest' | 'top_rated' | 'fastest' | 'open_now' | string

// comportement backend -> clé de logique locale déjà implémentée dans cette page
const COMPORTEMENT_TO_KEY: Record<string, string> = {
  TOUS: 'all',
  PROMOTIONS: 'promotions',
  MIEUX_NOTES: 'top_rated',
  PLUS_PROCHES: 'closest',
  PLUS_RAPIDES: 'fastest',
  OUVERTS: 'open_now',
}

// repli si l'API échoue : reproduit la barre actuelle
const FALLBACK_FILTERS = [
  { id: 'all', label: 'Tous', iconKey: 'Flame' },
  { id: 'promotions', label: 'Promotions', iconKey: 'Zap' },
  { id: 'top_rated', label: 'Mieux notés', iconKey: 'Star' },
  { id: 'closest', label: 'Plus proches', iconKey: 'MapPin' },
  { id: 'fastest', label: 'Plus rapides', iconKey: 'Clock' },
  { id: 'open_now', label: 'Ouverts', iconKey: 'Zap' },
]

export default function RestaurantsPage() {
  const [params, setParams] = useSearchParams()
  const initialQ = params.get('q') || ''
  const initialCat = params.get('cat') || ''

  const [search, setSearch] = useState(initialQ)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCat, setSelectedCat] = useState(initialCat)
  const [sort, setSort] = useState<SortOption>('recommended')
  const [openOnly, setOpenOnly] = useState(false)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [quickFilters, setQuickFilters] = useState<{ id: string; label: string; iconKey?: string; categorieId?: number | null }[]>(FALLBACK_FILTERS)

  useEffect(() => {
    categoriesApi.getAll().then(res => setCategories(res.data.map(mapCategory))).catch(() => {})
  }, [])

  useEffect(() => {
    filtresApi.getByContexte('RESTAURANT')
      .then(res => {
        const mapped = res.data
          .map((f: ApiFiltre) => ({
            id: f.comportement === 'CATEGORIE' ? `cat:${f.categorieId}` : (COMPORTEMENT_TO_KEY[f.comportement] || 'all'),
            label: f.libelle,
            iconKey: f.icone,
            categorieId: f.categorieId,
          }))
        if (mapped.length) setQuickFilters(mapped)
      })
      .catch(() => { /* garde le repli */ })
  }, [])

  const fetchRestaurants = useCallback(async (pageNum = 0) => {
    setLoading(true)
    try {
      if (search.trim()) {
        const res = await restaurantsApi.search(search.trim())
        setRestaurants(res.data.map(mapRestaurant))
        setTotalPages(1)
      } else {
        const params: Record<string, unknown> = { page: pageNum, size: 12 }
        if (selectedCat) params.categorieId = selectedCat
        const res = await restaurantsApi.getAll(params as never)
        setRestaurants(prev => pageNum === 0 ? res.data.content.map(mapRestaurant) : [...prev, ...res.data.content.map(mapRestaurant)])
        setTotalPages(res.data.totalPages)
      }
    } catch {
      setRestaurants([])
    }
    setLoading(false)
  }, [search, selectedCat])

  useEffect(() => {
    setPage(0)
    fetchRestaurants(0)
  }, [fetchRestaurants])

  const filteredRestaurants = useMemo(() => {
    let list = [...restaurants]

    if (openOnly || quickFilter === 'open_now') list = list.filter(r => r.isOpen)
    if (quickFilter === 'subsahariens') {
      list = list.filter(r => {
        const haystack = `${(r.tags || []).join(' ')} ${r.cuisineType || ''}`.toLowerCase()
        return /subsah|africain|malien|sénégalais|senegalais|wolof|bambara/.test(haystack)
      })
    }
    if (quickFilter === 'promotions') {
      list = list.filter(r => (r.tags || []).some(t => /promo|offre|reduction|réduction/i.test(t)))
    }
    if (quickFilter.startsWith('cat:')) {
      const catId = quickFilter.slice(4)
      list = list.filter(r => (r.categoryIds || []).includes(catId))
    }

    let activeSort = sort
    if (quickFilter === 'top_rated') activeSort = 'rating'
    if (quickFilter === 'fastest' || quickFilter === 'closest') activeSort = 'delivery_time'

    return list.sort((a, b) => {
      if (activeSort === 'rating') return b.rating - a.rating
      if (activeSort === 'delivery_time') return parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
      return 0
    })
  }, [restaurants, openOnly, sort, quickFilter])

  const handleCat = (catId: string) => {
    const next = selectedCat === catId ? '' : catId
    setSelectedCat(next)
    setParams(prev => {
      if (next) prev.set('cat', next)
      else prev.delete('cat')
      return prev
    })
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchRestaurants(nextPage)
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="section-title text-2xl md:text-3xl">Restaurants</h1>
          <p className="section-subtitle">Trouvez le restaurant parfait</p>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex items-center gap-3 mb-6">
          <form onSubmit={e => { e.preventDefault(); fetchRestaurants(0) }} className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un restaurant..."
              aria-label="Rechercher un restaurant"
              className="input-field !pl-11 !pr-10"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); }} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-warm-100 text-warm-400 min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                <X size={16} />
              </button>
            )}
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filtres"
            aria-expanded={showFilters}
            className={`p-3.5 rounded-2xl border transition-colors shrink-0 ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-500' : 'bg-white border-warm-200 text-warm-600 hover:bg-warm-50'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-6 animate-fade-up space-y-4">
            <div>
              <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-2 block">Trier par</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'recommended', label: 'Recommandé' },
                  { value: 'rating', label: 'Mieux noté' },
                  { value: 'delivery_time', label: 'Plus rapide' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value as SortOption)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${sort === opt.value ? 'bg-brand-500 text-white' : 'bg-warm-50 text-warm-600 hover:bg-warm-100'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-warm-700">Ouverts uniquement</span>
              <button
                onClick={() => setOpenOnly(!openOnly)}
                className={`w-11 h-6 rounded-full transition-colors relative ${openOnly ? 'bg-brand-500' : 'bg-warm-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${openOnly ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Quick filters (mobile-app style) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
          {quickFilters.map(f => {
            const Icon = iconForKey(f.iconKey)
            return (
              <Chip key={f.id} active={quickFilter === f.id} icon={Icon} onClick={() => setQuickFilter(f.id as QuickFilter)}>
                {f.label}
              </Chip>
            )
          })}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-1">
          <Chip active={!selectedCat} onClick={() => handleCat('')}>Toutes catégories</Chip>
          {categories.map(cat => (
            <Chip key={cat.id} active={selectedCat === cat.id} onClick={() => handleCat(cat.id)}>
              {cat.emoji} {cat.name}
            </Chip>
          ))}
        </div>

        {/* Results */}
        {loading && page === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState icon={Search} title="Aucun résultat" description="Essayez avec d'autres filtres ou termes de recherche." />
        ) : (
          <>
            <p className="text-sm text-warm-500 mb-4">{filteredRestaurants.length} restaurant{filteredRestaurants.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRestaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
            {page + 1 < totalPages && (
              <div className="text-center mt-10">
                <button onClick={loadMore} className="btn-outline inline-flex items-center gap-2">
                  Voir plus <ChevronDown size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
