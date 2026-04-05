import { useNavigate } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, DELIVERY_FEE } from '@/utils/format'

export default function CartSidebar() {
  const navigate = useNavigate()
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, subtotal, totalItems } = useCartStore()
  const sub = subtotal()
  const total = sub + (items.length > 0 ? DELIVERY_FEE : 0)
  const count = totalItems()
  const restaurantName = items[0]?.restaurantName

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={closeCart} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 animate-slide-in-right flex flex-col shadow-float">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
              <ShoppingBag size={20} className="text-brand-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-warm-900">Mon panier</h2>
              <p className="text-xs text-warm-400">{count > 0 ? `${count} article${count > 1 ? 's' : ''}` : 'Vide'}</p>
            </div>
          </div>
          <button onClick={closeCart} className="p-2 rounded-xl hover:bg-warm-100 text-warm-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-24 h-24 rounded-full bg-warm-50 flex items-center justify-center mb-5">
              <ShoppingBag size={40} className="text-warm-300" />
            </div>
            <h3 className="font-display font-bold text-xl text-warm-900 mb-2">Panier vide</h3>
            <p className="text-sm text-warm-400 mb-6">Parcourez nos restaurants et ajoutez des plats delicieux !</p>
            <button onClick={() => { closeCart(); navigate('/restaurants') }} className="btn-primary text-sm">
              Explorer les restaurants
            </button>
          </div>
        ) : (
          <>
            {restaurantName && (
              <div className="px-6 py-3 bg-brand-50/50">
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">{restaurantName}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto cart-items px-6 py-4 space-y-3">
              {items.map(item => (
                <div key={item.dish.id} className="flex gap-3 p-3 rounded-2xl bg-warm-50/50 hover:bg-warm-50 transition-colors group">
                  <img src={item.dish.image} alt={item.dish.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-warm-900 truncate">{item.dish.name}</h4>
                    <p className="text-sm font-bold text-brand-500 mt-0.5">{formatPrice(item.dish.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.dish.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-warm-200 flex items-center justify-center hover:border-brand-300 text-warm-600 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-warm-900">{item.quantity}</span>
                        <button onClick={() => updateQty(item.dish.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-warm-200 flex items-center justify-center hover:border-brand-300 text-warm-600 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.dish.id)}
                        className="p-1.5 rounded-lg text-warm-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-warm-100 px-6 py-5 space-y-4 bg-white">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-warm-500">
                  <span>Sous-total</span><span className="font-medium text-warm-700">{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between text-warm-500">
                  <span>Frais de livraison</span><span className="font-medium text-warm-700">{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-warm-100">
                  <span className="font-bold text-warm-900">Total</span>
                  <span className="font-bold text-lg text-brand-500">{formatPrice(total)}</span>
                </div>
              </div>
              <button onClick={() => { closeCart(); navigate('/checkout') }} className="btn-primary w-full flex items-center justify-center gap-2">
                Commander <ArrowRight size={18} />
              </button>
              <button onClick={clearCart} className="w-full text-center text-sm text-warm-400 hover:text-red-500 transition-colors py-1">
                Vider le panier
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
