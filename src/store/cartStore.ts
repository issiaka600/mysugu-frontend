import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Dish, SelectedOption } from '@/types'

function makeLineId(dishId: string, selectedOptions: SelectedOption[]): string {
  const sortedIds = [...selectedOptions].map(o => o.optionItemId).sort((a, b) => a - b).join(',')
  return dishId + '|' + sortedIds
}

function linePrice(dish: Dish, selectedOptions: SelectedOption[]): number {
  return dish.price + selectedOptions.reduce((sum, o) => sum + o.prixSupplement, 0)
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  restaurantId: string | null
  restaurantName: string | null

  addItem: (dish: Dish, restaurantId: string, restaurantName: string, selectedOptions?: SelectedOption[]) => void
  removeItem: (lineId: string) => void
  updateQty: (lineId: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      restaurantId: null,
      restaurantName: null,

      addItem: (dish, restaurantId, restaurantName, selectedOptions = []) => {
        const { items, restaurantId: currentRestId } = get()
        const lineId = makeLineId(dish.id, selectedOptions)

        // If cart has items from a different restaurant, clear it first
        if (currentRestId && currentRestId !== restaurantId) {
          set({
            items: [{ lineId, dish, quantity: 1, restaurantId, restaurantName, selectedOptions }],
            restaurantId,
            restaurantName,
            isOpen: true,
          })
          return
        }

        const existing = items.find(i => i.lineId === lineId)
        if (existing) {
          set({
            items: items.map(i =>
              i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...items, { lineId, dish, quantity: 1, restaurantId, restaurantName, selectedOptions }],
            restaurantId,
            restaurantName,
            isOpen: true,
          })
        }
      },

      removeItem: (lineId) =>
        set(state => {
          const newItems = state.items.filter(i => i.lineId !== lineId)
          return {
            items: newItems,
            restaurantId: newItems.length === 0 ? null : state.restaurantId,
            restaurantName: newItems.length === 0 ? null : state.restaurantName,
          }
        }),

      updateQty: (lineId, qty) => {
        if (qty <= 0) {
          get().removeItem(lineId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.lineId === lineId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal:   () => get().items.reduce(
        (sum, i) => sum + linePrice(i.dish, i.selectedOptions ?? []) * i.quantity,
        0
      ),
    }),
    { name: 'mysugu-cart' }
  )
)
