import { Plus, Minus, Clock } from 'lucide-react'
import type { Dish } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/format'
import toast from 'react-hot-toast'

interface Props {
  dish: Dish
  restaurantId: string
  restaurantName: string
  layout?: 'grid' | 'horizontal'
}

export default function DishCard({ dish, restaurantId, restaurantName, layout = 'grid' }: Props) {
  const { items, addItem, updateQty, removeItem } = useCartStore()
  const cartItem = items.find(i => i.dish.id === dish.id)
  const qty = cartItem?.quantity || 0

  const platOptions = dish.optionGroups ?? []

  const handleAdd = () => {
    if (!dish.isAvailable) return
    addItem(dish, restaurantId, restaurantName)
    toast.success(`${dish.name} ajoute au panier`)
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex gap-4 p-4 rounded-2xl bg-white border border-warm-100 hover:shadow-card transition-all ${!dish.isAvailable ? 'opacity-60' : ''}`}>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-warm-900 mb-1">{dish.name}</h4>
          <p className="text-sm text-warm-400 line-clamp-2 mb-2">{dish.description}</p>
          <div className="flex items-center gap-3">
            <span className="font-bold text-brand-500">{formatPrice(dish.price)}</span>
            {dish.tempsPreparation && (
              <span className="flex items-center gap-1 text-xs text-warm-400">
                <Clock size={12} /> {dish.tempsPreparation} min
              </span>
            )}
          </div>
          {platOptions.length > 0 && (
            <div className="mt-3 space-y-3">
              {platOptions.map(g => (
                <div key={g.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-xs text-warm-800">{g.nom}</h5>
                    {g.obligatoire && (
                      <span className="text-[10px] uppercase tracking-wide text-brand-500">obligatoire</span>
                    )}
                    <span className="text-[10px] text-warm-400">
                      {g.selectionMode === 'SINGLE' ? 'choisir 1' : 'choix multiple'}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {g.items.map(it => (
                      <li key={it.id} className="flex justify-between text-xs text-warm-600">
                        <span className={it.disponible ? '' : 'line-through opacity-50'}>{it.nom}</span>
                        <span className="ml-2 shrink-0">
                          {it.prixSupplement > 0 ? `+${it.prixSupplement} DH` : 'inclus'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative shrink-0">
          <img src={dish.image} alt={dish.name} className="w-28 h-28 rounded-2xl object-cover" />
          {dish.isAvailable && (
            <div className="absolute -bottom-2 -right-2">
              {qty > 0 ? (
                <div className="flex items-center gap-0.5 bg-white rounded-full shadow-card border border-warm-100">
                  <button onClick={() => qty === 1 ? removeItem(dish.id) : updateQty(dish.id, qty - 1)} aria-label="Diminuer la quantité"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-warm-500 hover:text-brand-500 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-warm-900">{qty}</span>
                  <button onClick={() => updateQty(dish.id, qty + 1)} aria-label="Augmenter la quantité"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-warm-500 hover:text-brand-500 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={handleAdd} aria-label="Ajouter au panier"
                  className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-brand-sm hover:bg-brand-600 active:scale-90 transition-all">
                  <Plus size={18} />
                </button>
              )}
            </div>
          )}
          {!dish.isAvailable && (
            <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
              <span className="text-[10px] font-semibold text-warm-500 bg-warm-100 px-2 py-0.5 rounded-full">Indisponible</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all ${!dish.isAvailable ? 'opacity-60' : ''}`}>
      <div className="relative aspect-square overflow-hidden">
        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {!dish.isAvailable && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-warm-600 bg-warm-100 px-3 py-1 rounded-full">Indisponible</span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h4 className="font-semibold text-sm text-warm-900 truncate mb-0.5">{dish.name}</h4>
        <p className="text-xs text-warm-400 line-clamp-1 mb-2">{dish.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-brand-500 text-sm">{formatPrice(dish.price)}</span>
          {dish.isAvailable && (
            qty > 0 ? (
              <div className="flex items-center gap-0.5">
                <button onClick={() => qty === 1 ? removeItem(dish.id) : updateQty(dish.id, qty - 1)} aria-label="Diminuer la quantité"
                  className="w-7 h-7 rounded-lg border border-warm-200 flex items-center justify-center text-warm-500 hover:border-brand-300 transition-colors">
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-warm-900">{qty}</span>
                <button onClick={() => updateQty(dish.id, qty + 1)} aria-label="Augmenter la quantité"
                  className="w-7 h-7 rounded-lg border border-warm-200 flex items-center justify-center text-warm-500 hover:border-brand-300 transition-colors">
                  <Plus size={13} />
                </button>
              </div>
            ) : (
              <button onClick={handleAdd} aria-label="Ajouter au panier"
                className="w-8 h-8 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center hover:bg-brand-500 hover:text-white active:scale-90 transition-all">
                <Plus size={16} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
