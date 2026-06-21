import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { favorisApi, mapRestaurant } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { Restaurant } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import { RestaurantCardSkeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?redirect=/favoris'); return }
    favorisApi.getAll()
      .then(res => {
        const favs = res.data as Array<{ restaurant: Parameters<typeof mapRestaurant>[0] }>
        setRestaurants(favs.map(f => mapRestaurant(f.restaurant)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="section-title mb-2">Mes favoris</h1>
        <p className="section-subtitle mb-8">Vos restaurants préférés</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori"
            description="Ajoutez des restaurants à vos favoris pour les retrouver facilement."
            action={<Link to="/restaurants" className="btn-primary text-sm">Explorer les restaurants</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}
