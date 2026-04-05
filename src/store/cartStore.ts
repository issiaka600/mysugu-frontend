import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Dish } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  restaurantId: string | null
  restaurantName: string | null

  addItem: (dish: Dish, restaurantId: string, restaurantName: string) => void
  removeItem: (dishId: string) => void
  updateQty: (dishId: string, qty: number) => void
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

      addItem: (dish, restaurantId, restaurantName) => {
        const { items, restaurantId: currentRestId } = get()

        // If cart has items from different restaurant, clear it first
        if (currentRestId && currentRestId !== restaurantId) {
          set({
            items: [{ dish, quantity: 1, restaurantId, restaurantName }],
            restaurantId,
            restaurantName,
            isOpen: true,
          })
          return
        }

        const existing = items.find(i => i.dish.id === dish.id)
        if (existing) {
          set({
            items: items.map(i =>
              i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...items, { dish, quantity: 1, restaurantId, restaurantName }],
            restaurantId,
            restaurantName,
            isOpen: true,
          })
        }
      },

      removeItem: (dishId) =>
        set(state => {
          const newItems = state.items.filter(i => i.dish.id !== dishId)
          return {
            items: newItems,
            restaurantId: newItems.length === 0 ? null : state.restaurantId,
            restaurantName: newItems.length === 0 ? null : state.restaurantName,
          }
        }),

      updateQty: (dishId, qty) => {
        if (qty <= 0) {
          get().removeItem(dishId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.dish.id === dishId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal:   () => get().items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0),
    }),
    { name: 'mysugu-cart' }
  )
)
