import { useState, useEffect, useMemo } from 'react'
import { Search, X, Store } from 'lucide-react'
import { restaurantsApi, mapRestaurant } from '@/api'
import type { Restaurant } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import { RestaurantCardSkeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import Chip from '@/components/Chip'
import { filtresApi, type ApiFiltre } from '@/api/filtres.api'
import { iconForKey } from '@/lib/filterIcons'

type QuickFilter = 'all' | 'fruits_legumes' | 'epicerie' | 'boissons' | 'promotions' | 'closest' | 'fastest' | string

const COMPORTEMENT_TO_KEY: Record<string, string> = {
  TOUS: 'all', PROMOTIONS: 'promotions', PLUS_PROCHES: 'closest', PLUS_RAPIDES: 'fastest',
}

const FALLBACK_FILTERS = [
  { id: 'all',            label: 'Tous',            iconKey: 'Apple' },
  { id: 'fruits_legumes', label: 'Fruits & légumes', iconKey: 'Carrot' },
  { id: 'epicerie',       label: 'Épicerie',         iconKey: 'Wheat' },
  { id: 'boissons',       label: 'Boissons',         iconKey: 'Milk' },
  { id: 'promotions',     label: 'Promotions',       iconKey: 'Tag' },
  { id: 'closest',        label: 'Plus proches',     iconKey: 'MapPin' },
  { id: 'fastest',        label: 'Plus rapides',     iconKey: 'Clock' },
]

export default function AlimentairesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<QuickFilter>('all')
  const [items, setItems] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [quickFilters, setQuickFilters] = useState<{ id: string; label: string; iconKey?: string; categorieId?: number | null }[]>(FALLBACK_FILTERS)

  useEffect(() => {
    filtresApi.getByContexte('ALIMENTAIRE')
      .then(res => {
        const mapped = res.data.map((f: ApiFiltre) => ({
          id: f.comportement === 'CATEGORIE' ? `cat:${f.categorieId}` : (COMPORTEMENT_TO_KEY[f.comportement] || 'all'),
          label: f.libelle, iconKey: f.icone, categorieId: f.categorieId,
        }))
        if (mapped.length) setQuickFilters(mapped)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    restaurantsApi.getAll({ page: 0, size: 24, vertical: 'ALIMENTAIRE' } as never)
      .then(res => { if (alive) setItems(res.data.content.map(mapRestaurant)) })
      .catch(() => { if (alive) setItems([]) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const filteredItems = useMemo(() => {
    let list = [...items]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r => r.name?.toLowerCase().includes(q) || r.cuisineType?.toLowerCase().includes(q))
    }

    if (filter === 'promotions') {
      list = list.filter(r => (r.tags || []).some(t => /promo|offre|reduction|réduction/i.test(t)))
    } else if (filter.startsWith('cat:')) {
      const catId = filter.slice(4)
      list = list.filter(r => (r.categoryIds || []).includes(catId))
    } else if (filter !== 'all' && filter !== 'closest' && filter !== 'fastest') {
      // category-like local filter (fruits_legumes, epicerie, boissons)
      list = list.filter(r => {
        const haystack = `${(r.tags || []).join(' ')} ${r.cuisineType || ''}`.toLowerCase()
        return haystack.includes(filter.replace('_', ' '))
      })
    }

    if (filter === 'closest' || filter === 'fastest') {
      list = list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime))
    }

    return list
  }, [items, search, filter])

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="section-title text-2xl md:text-3xl">Alimentaires</h1>
          <p className="section-subtitle">Vos courses livrées en quelques minutes</p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <form onSubmit={e => e.preventDefault()} className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit, une boutique..."
              aria-label="Rechercher un produit ou une boutique"
              className="input-field !pl-11 !pr-10"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-warm-100 text-warm-400 min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-1">
          {quickFilters.map(f => {
            const Icon = iconForKey(f.iconKey)
            return (
              <Chip key={f.id} active={filter === f.id} icon={Icon} onClick={() => setFilter(f.id as QuickFilter)}>
                {f.label}
              </Chip>
            )
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Store} title="Aucun commerce alimentaire pour le moment" description="Revenez bientôt, nous ajoutons de nouveaux partenaires." />
        ) : (
          <>
            <p className="text-sm text-warm-500 mb-4">{filteredItems.length} commerce{filteredItems.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
