import { useState, useEffect } from 'react'
import { Search, X, MapPin, Clock, Tag, Apple, Carrot, Milk, Wheat, Store } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { restaurantsApi, mapRestaurant } from '@/api'
import type { Restaurant } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import { RestaurantCardSkeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import Chip from '@/components/Chip'

type QuickFilter =
  | 'all'
  | 'fruits_legumes'
  | 'epicerie'
  | 'boissons'
  | 'promotions'
  | 'closest'
  | 'fastest'

const QUICK_FILTERS: { id: QuickFilter; label: string; icon: LucideIcon }[] = [
  { id: 'all',            label: 'Tous',           icon: Apple },
  { id: 'fruits_legumes', label: 'Fruits & légumes', icon: Carrot },
  { id: 'epicerie',       label: 'Épicerie',       icon: Wheat },
  { id: 'boissons',       label: 'Boissons',       icon: Milk },
  { id: 'promotions',     label: 'Promotions',     icon: Tag },
  { id: 'closest',        label: 'Plus proches',   icon: MapPin },
  { id: 'fastest',        label: 'Plus rapides',   icon: Clock },
]

export default function AlimentairesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<QuickFilter>('all')
  const [items, setItems] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    restaurantsApi.getAll({ page: 0, size: 24, vertical: 'ALIMENTAIRE' } as never)
      .then(res => { if (alive) setItems(res.data.content.map(mapRestaurant)) })
      .catch(() => { if (alive) setItems([]) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

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
          {QUICK_FILTERS.map(f => (
            <Chip key={f.id} active={filter === f.id} icon={f.icon} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Store} title="Aucun commerce alimentaire pour le moment" description="Revenez bientôt, nous ajoutons de nouveaux partenaires." />
        ) : (
          <>
            <p className="text-sm text-warm-500 mb-4">{items.length} commerce{items.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
