import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Calendar, Tag } from 'lucide-react'
import { promotionsApi, mapPromotion } from '@/api'
import type { Promotion } from '@/types'
import { PromotionSkeleton } from '@/components/Skeleton'
import { formatPrice } from '@/utils/format'

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([])
  const [flashPromos, setFlashPromos] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [allRes, flashRes] = await Promise.allSettled([
          promotionsApi.getAll(),
          promotionsApi.getFlash(),
        ])
        if (allRes.status === 'fulfilled') setPromos(allRes.value.data.map(mapPromotion))
        if (flashRes.status === 'fulfilled') setFlashPromos(flashRes.value.data.map(mapPromotion))
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  const regularPromos = promos.filter(p => !p.isFlash)

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="section-title mb-2">Promotions</h1>
        <p className="section-subtitle mb-8">Profitez de nos offres exclusives</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <PromotionSkeleton key={i} />)}
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <Tag size={32} className="text-warm-300" />
            </div>
            <h3 className="font-display font-bold text-xl text-warm-900 mb-2">Aucune promotion</h3>
            <p className="text-sm text-warm-400">Revenez bientot pour decouvrir nos offres !</p>
          </div>
        ) : (
          <>
            {/* Flash sales */}
            {flashPromos.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <Zap size={20} className="text-amber-500 fill-amber-500" />
                  <h2 className="font-display font-bold text-xl text-warm-900">Ventes flash</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {flashPromos.map(promo => <PromoCard key={promo.id} promo={promo} flash />)}
                </div>
              </section>
            )}

            {/* Regular promos */}
            {regularPromos.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-warm-900 mb-5">Toutes les offres</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {regularPromos.map(promo => <PromoCard key={promo.id} promo={promo} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PromoCard({ promo, flash }: { promo: Promotion; flash?: boolean }) {
  const endDate = new Date(promo.endDate)
  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className={`rounded-3xl overflow-hidden ${flash ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-brand-500 to-brand-600'} text-white shadow-card hover:shadow-brand-lg transition-shadow`}>
      <div className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-8 -translate-x-8" />

        <div className="relative">
          {flash && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold mb-3">
              <Zap size={10} className="fill-white" /> FLASH
            </span>
          )}
          <h3 className="font-display font-bold text-xl mb-2">{promo.name}</h3>
          <p className="text-white/80 text-sm mb-4 line-clamp-2">{promo.description}</p>

          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-extrabold text-3xl">
              {promo.type === 'POURCENTAGE' ? `-${promo.value}%` : `-${formatPrice(promo.value)}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-white/70 text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}` : 'Expire bientot'}
            </span>
            {promo.minAmount > 0 && <span>Min. {formatPrice(promo.minAmount)}</span>}
          </div>

          {promo.restaurantName && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <Link
                to={`/restaurants/${promo.restaurantId}`}
                className="flex items-center justify-between text-sm hover:text-white transition-colors"
              >
                <span>{promo.restaurantName}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
