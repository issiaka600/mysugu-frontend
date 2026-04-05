import { Link } from 'react-router-dom'
import { Star, Clock, MapPin } from 'lucide-react'
import type { Restaurant } from '@/types'

interface Props {
  restaurant: Restaurant
  className?: string
}

export default function RestaurantCard({ restaurant: r, className = '' }: Props) {
  return (
    <Link
      to={`/restaurants/${r.id}`}
      className={`group block bg-white rounded-3xl overflow-hidden shadow-card card-lift ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={r.coverImage}
          alt={r.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Tags */}
        {r.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1.5">
            {r.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-warm-800">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {r.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-warm-900">{r.rating.toFixed(1)}</span>
            <span className="text-[10px] text-warm-400">({r.reviewCount})</span>
          </div>
        )}

        {/* Closed overlay */}
        {!r.isOpen && (
          <div className="absolute inset-0 bg-warm-900/60 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-white/90 text-sm font-semibold text-warm-800">
              Ferme
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-bold text-warm-900 text-base mb-1 group-hover:text-brand-500 transition-colors truncate">
          {r.name}
        </h3>
        <p className="text-sm text-warm-400 line-clamp-1 mb-3">{r.cuisineType}</p>
        <div className="flex items-center gap-4 text-xs text-warm-500">
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-brand-400" />
            {r.deliveryTime} min
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-brand-400" />
            {r.address.split(',')[0]}
          </span>
        </div>
      </div>
    </Link>
  )
}
