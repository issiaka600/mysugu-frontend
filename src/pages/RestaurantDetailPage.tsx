import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Clock, MapPin, Heart, Share2, Phone } from 'lucide-react'
import { restaurantsApi, platsApi, favorisApi, avisApi, mapRestaurant, mapPlat, mapReview, extractErrorMessage } from '@/api'
import type { Restaurant, Dish, Review } from '@/types'
import DishCard from '@/components/DishCard'
import { DishHorizontalSkeleton } from '@/components/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/format'
import toast from 'react-hot-toast'

const CATEGORY_ORDER = ['Entrees', 'Plats principaux', 'Accompagnements', 'Desserts', 'Boissons']

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { totalItems, subtotal } = useCartStore()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isFav, setIsFav] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const [restRes, dishRes] = await Promise.all([
          restaurantsApi.getById(id),
          platsApi.getByRestaurant(id),
        ])
        setRestaurant(mapRestaurant(restRes.data))
        const mapped = dishRes.data.map(mapPlat)
        setDishes(mapped)
        if (mapped.length > 0) setActiveCategory(mapped[0].categoryName)

        try {
          const revRes = await avisApi.getByRestaurant(id)
          setReviews(revRes.data.map(mapReview))
        } catch { /* ignore */ }

        if (isAuthenticated) {
          try {
            const favRes = await favorisApi.getStatus(id)
            setIsFav(favRes.data.isFavori)
          } catch { /* ignore */ }
        }
      } catch {
        navigate('/restaurants')
      }
      setLoading(false)
    }
    load()
  }, [id, isAuthenticated, navigate])

  const toggleFav = async () => {
    if (!isAuthenticated || !id) { navigate('/login?redirect=/restaurants/' + id); return }
    try {
      const res = await favorisApi.toggle(id)
      setIsFav(res.data.isFavori)
      toast.success(res.data.isFavori ? 'Ajoute aux favoris' : 'Retire des favoris')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const menuCategories = [...new Set(dishes.map(d => d.categoryName))]
    .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))

  const cartCount = totalItems()
  const cartTotal = subtotal()

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse">
            <div className="h-64 bg-warm-100 rounded-3xl mb-6" />
            <div className="h-8 bg-warm-100 rounded-xl w-64 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <DishHorizontalSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 mb-4 transition-colors">
          <ArrowLeft size={18} /> Retour
        </button>

        {/* Header Card */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-56 md:h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={toggleFav} aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isFav} className={`p-2.5 rounded-full backdrop-blur-sm transition-colors ${isFav ? 'bg-red-500 text-white' : 'bg-white/80 text-warm-700 hover:bg-white'}`}>
              <Heart size={18} className={isFav ? 'fill-white' : ''} />
            </button>
            <button aria-label="Partager" className="p-2.5 rounded-full bg-white/80 text-warm-700 hover:bg-white backdrop-blur-sm transition-colors">
              <Share2 size={18} />
            </button>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              {!restaurant.isOpen && (
                <span className="badge bg-red-500/80 text-white text-xs backdrop-blur-sm">Ferme</span>
              )}
              <span className="badge bg-white/20 text-white text-xs backdrop-blur-sm">{restaurant.cuisineType}</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl text-white mb-3">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {restaurant.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <strong className="text-white">{restaurant.rating.toFixed(1)}</strong>
                  <span>({restaurant.reviewCount} avis)</span>
                </span>
              )}
              <span className="flex items-center gap-1"><Clock size={14} /> {restaurant.deliveryTime} min</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {restaurant.address}</span>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        {menuCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 sticky top-16 z-20 bg-warm-50 py-2 -mx-4 px-4">
            {menuCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${activeCategory === cat ? 'bg-brand-500 text-white shadow-brand-sm' : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu */}
        <div className="space-y-8">
          {menuCategories.map(cat => (
            <section key={cat} className={activeCategory && activeCategory !== cat ? 'hidden' : ''}>
              <h2 className="font-display font-bold text-xl text-warm-900 mb-4">{cat}</h2>
              <div className="space-y-3">
                {dishes
                  .filter(d => d.categoryName === cat)
                  .map(d => (
                    <DishCard key={d.id} dish={d} restaurantId={restaurant.id} restaurantName={restaurant.name} layout="horizontal" />
                  ))
                }
              </div>
            </section>
          ))}
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-bold text-xl text-warm-900 mb-4">Avis clients ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-4 border border-warm-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                      {r.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-warm-900 truncate">{r.authorName}</p>
                      <p className="text-xs text-warm-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-warm-900">{r.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-warm-600">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full btn-primary flex items-center justify-between !rounded-2xl !py-4 !px-6 shadow-brand-lg"
          >
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{cartCount}</span>
              <span>Voir le panier</span>
            </span>
            <span className="font-bold">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
