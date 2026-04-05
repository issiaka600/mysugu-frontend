import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { favorisApi, mapRestaurant } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { Restaurant } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import { RestaurantCardSkeleton } from '@/components/Skeleton'

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
        <p className="section-subtitle mb-8">Vos restaurants preferes</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-warm-300" />
            </div>
            <h3 className="font-display font-bold text-xl text-warm-900 mb-2">Aucun favori</h3>
            <p className="text-sm text-warm-400 mb-6">Ajoutez des restaurants a vos favoris pour les retrouver facilement.</p>
            <Link to="/restaurants" className="btn-primary text-sm">Explorer les restaurants</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}
