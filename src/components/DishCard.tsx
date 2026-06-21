import { useState, useMemo } from 'react'
import { Plus, Minus, Clock } from 'lucide-react'
import type { Dish } from '@/types'
import type { SelectedOption } from '@/types'
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

  // selected: { [groupId]: itemId[] }
  const [selected, setSelected] = useState<Record<number, number[]>>({})

  const platOptions = dish.optionGroups ?? []

  // Build SelectedOption[] from current selection state
  const buildSelectedOptions = (): SelectedOption[] => {
    const result: SelectedOption[] = []
    for (const group of platOptions) {
      const chosenIds = selected[group.id] ?? []
      for (const itemId of chosenIds) {
        const item = group.items.find(it => it.id === itemId)
        if (item) {
          result.push({
            optionItemId: item.id,
            optionGroupNom: group.nom,
            optionNom: item.nom,
            prixSupplement: item.prixSupplement,
          })
        }
      }
    }
    return result
  }

  // Dynamic price: base price + selected supplements
  const displayPrice = useMemo(() => {
    let extra = 0
    for (const group of platOptions) {
      const chosenIds = selected[group.id] ?? []
      for (const id of chosenIds) {
        const item = group.items.find(it => it.id === id)
        if (item) extra += item.prixSupplement
      }
    }
    return dish.price + extra
  }, [dish.price, platOptions, selected])

  // lineId for the current selection (to look up in cart)
  const currentSelectedOptions = buildSelectedOptions()
  const currentLineId = dish.id + '|' + currentSelectedOptions.map(o => o.optionItemId).sort((a, b) => a - b).join(',')
  const cartItem = items.find(i => i.lineId === currentLineId)
  const qty = cartItem?.quantity ?? 0

  // For cards without options, total qty across all lines of this dish
  const totalQtyForDish = platOptions.length === 0
    ? items.filter(i => i.dish.id === dish.id).reduce((s, i) => s + i.quantity, 0)
    : qty

  const handleToggleItem = (groupId: number, itemId: number, mode: 'SINGLE' | 'MULTIPLE', maxSel?: number | null) => {
    setSelected(prev => {
      const current = prev[groupId] ?? []
      if (mode === 'SINGLE') {
        // Radio: selecting same deselects, else replace
        return { ...prev, [groupId]: current.includes(itemId) ? [] : [itemId] }
      } else {
        // Checkbox
        if (current.includes(itemId)) {
          return { ...prev, [groupId]: current.filter(id => id !== itemId) }
        } else {
          if (maxSel != null && current.length >= maxSel) {
            toast.error(`Maximum ${maxSel} choix pour ce groupe`)
            return prev
          }
          return { ...prev, [groupId]: [...current, itemId] }
        }
      }
    })
  }

  const validateAndAdd = () => {
    if (!dish.isAvailable) return

    // Validate required groups
    for (const group of platOptions) {
      if (group.obligatoire) {
        const minRequired = Math.max(group.minSelections ?? 1, 1)
        const chosen = selected[group.id] ?? []
        if (chosen.length < minRequired) {
          toast.error(`Veuillez choisir au moins ${minRequired} option pour « ${group.nom} »`)
          return
        }
      }
    }

    const selectedOptions = buildSelectedOptions()
    addItem(dish, restaurantId, restaurantName, selectedOptions)
    toast.success(`${dish.name} ajouté au panier`)
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex gap-4 p-4 rounded-2xl bg-white border border-warm-100 hover:shadow-card transition-all ${!dish.isAvailable ? 'opacity-60' : ''}`}>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-warm-900 mb-1">{dish.name}</h4>
          <p className="text-sm text-warm-400 line-clamp-2 mb-2">{dish.description}</p>
          <div className="flex items-center gap-3">
            <span className="font-bold text-brand-500">{formatPrice(displayPrice)}</span>
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
                    {g.items.map(it => {
                      const chosen = (selected[g.id] ?? []).includes(it.id)
                      return (
                        <li key={it.id}
                          className={`flex justify-between text-xs cursor-pointer rounded px-1 py-0.5 transition-colors
                            ${!it.disponible ? 'opacity-40 pointer-events-none' : ''}
                            ${chosen ? 'bg-brand-50 text-brand-700' : 'text-warm-600 hover:bg-warm-50'}`}
                          onClick={() => it.disponible && handleToggleItem(g.id, it.id, g.selectionMode, g.maxSelections)}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`inline-block w-3.5 h-3.5 rounded-full border flex-shrink-0
                              ${chosen ? 'bg-brand-500 border-brand-500' : 'border-warm-300'}`}
                            />
                            {it.nom}
                          </span>
                          <span className="ml-2 shrink-0">
                            {it.prixSupplement > 0 ? `+${it.prixSupplement} DH` : 'inclus'}
                          </span>
                        </li>
                      )
                    })}
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
              {totalQtyForDish > 0 && platOptions.length === 0 ? (
                <div className="flex items-center gap-0.5 bg-white rounded-full shadow-card border border-warm-100">
                  <button
                    onClick={() => qty === 1 ? removeItem(currentLineId) : updateQty(currentLineId, qty - 1)}
                    aria-label="Diminuer la quantité"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-warm-500 hover:text-brand-500 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-warm-900">{totalQtyForDish}</span>
                  <button
                    onClick={() => updateQty(currentLineId, qty + 1)}
                    aria-label="Augmenter la quantité"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-warm-500 hover:text-brand-500 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={validateAndAdd} aria-label="Ajouter au panier"
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

  // Grid layout
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

        {platOptions.length > 0 && (
          <div className="mb-3 space-y-2">
            {platOptions.map(g => (
              <div key={g.id}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold text-warm-700">{g.nom}</span>
                  {g.obligatoire && (
                    <span className="text-[10px] text-brand-500 uppercase">*</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.items.map(it => {
                    const chosen = (selected[g.id] ?? []).includes(it.id)
                    return (
                      <button
                        key={it.id}
                        disabled={!it.disponible}
                        onClick={() => handleToggleItem(g.id, it.id, g.selectionMode, g.maxSelections)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors
                          ${!it.disponible ? 'opacity-40 cursor-not-allowed border-warm-100 text-warm-300' : ''}
                          ${chosen
                            ? 'bg-brand-500 text-white border-brand-500'
                            : 'border-warm-200 text-warm-600 hover:border-brand-300'
                          }`}
                      >
                        {it.nom}{it.prixSupplement > 0 ? ` +${it.prixSupplement}` : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-brand-500 text-sm">{formatPrice(displayPrice)}</span>
          {dish.isAvailable && (
            totalQtyForDish > 0 && platOptions.length === 0 ? (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => qty === 1 ? removeItem(currentLineId) : updateQty(currentLineId, qty - 1)}
                  aria-label="Diminuer la quantité"
                  className="w-7 h-7 rounded-lg border border-warm-200 flex items-center justify-center text-warm-500 hover:border-brand-300 transition-colors">
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-warm-900">{totalQtyForDish}</span>
                <button
                  onClick={() => updateQty(currentLineId, qty + 1)}
                  aria-label="Augmenter la quantité"
                  className="w-7 h-7 rounded-lg border border-warm-200 flex items-center justify-center text-warm-500 hover:border-brand-300 transition-colors">
                  <Plus size={13} />
                </button>
              </div>
            ) : (
              <button onClick={validateAndAdd} aria-label="Ajouter au panier"
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
