import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, ChevronRight, Clock, CheckCircle2, XCircle,
  Truck, ChefHat, Package, RefreshCw, AlertCircle,
} from 'lucide-react'
import { commandesApi, extractErrorMessage } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiCommande, StatutCommande } from '@/types/api'
import { formatPrice, STATUT_LABELS, ACTIVE_STATUTS, CANCELLABLE_STATUTS } from '@/utils/format'
import { OrderCardSkeleton } from '@/components/Skeleton'
import toast from 'react-hot-toast'

const STATUS_ICON: Record<string, React.ReactNode> = {
  EN_ATTENTE:     <Clock size={16} className="text-amber-500" />,
  CONFIRMEE:      <CheckCircle2 size={16} className="text-blue-500" />,
  EN_PREPARATION: <ChefHat size={16} className="text-orange-500" />,
  PRETE:          <Package size={16} className="text-purple-500" />,
  EN_COURS:       <Truck size={16} className="text-brand-500" />,
  LIVREE:         <CheckCircle2 size={16} className="text-emerald-500" />,
  ANNULEE:        <XCircle size={16} className="text-red-500" />,
}

const STATUS_COLOR: Record<string, string> = {
  EN_ATTENTE:     'bg-amber-50 text-amber-700',
  CONFIRMEE:      'bg-blue-50 text-blue-700',
  EN_PREPARATION: 'bg-orange-50 text-orange-700',
  PRETE:          'bg-purple-50 text-purple-700',
  EN_COURS:       'bg-brand-50 text-brand-700',
  LIVREE:         'bg-emerald-50 text-emerald-700',
  ANNULEE:        'bg-red-50 text-red-700',
}

type Filter = 'all' | 'active' | 'completed' | 'cancelled'

export default function OrdersPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [orders, setOrders] = useState<ApiCommande[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?redirect=/mes-commandes'); return }
    loadOrders()
  }, [isAuthenticated, navigate])

  const loadOrders = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await commandesApi.getByClient(user.id)
      setOrders(res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch { /* ignore */ }
    setLoading(false)
  }

  const cancelOrder = async (id: number) => {
    try {
      await commandesApi.cancel(id)
      toast.success('Commande annulee')
      loadOrders()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const filtered = orders.filter(o => {
    if (filter === 'active') return ACTIVE_STATUTS.has(o.statut)
    if (filter === 'completed') return o.statut === 'LIVREE'
    if (filter === 'cancelled') return o.statut === 'ANNULEE'
    return true
  })

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Mes commandes</h1>
            <p className="section-subtitle">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={loadOrders} className="p-2.5 rounded-xl hover:bg-warm-100 text-warm-400 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
          {([
            { value: 'all', label: 'Toutes' },
            { value: 'active', label: 'En cours' },
            { value: 'completed', label: 'Livrees' },
            { value: 'cancelled', label: 'Annulees' },
          ] as const).map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.value ? 'bg-brand-500 text-white' : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-warm-300" />
            </div>
            <h3 className="font-display font-bold text-xl text-warm-900 mb-2">Aucune commande</h3>
            <p className="text-sm text-warm-400 mb-6">Vous n'avez pas encore passe de commande.</p>
            <Link to="/restaurants" className="btn-primary text-sm">Explorer les restaurants</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-5 border border-warm-100 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-warm-900">#{order.numeroCommande}</p>
                    <p className="text-sm text-warm-400">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[order.statut] || 'bg-warm-100 text-warm-600'}`}>
                    {STATUS_ICON[order.statut]}
                    {STATUT_LABELS[order.statut] || order.statut}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <img src={order.restaurant.logoUrl || ''} alt="" className="w-8 h-8 rounded-lg object-cover bg-warm-100" />
                  <span className="text-sm font-medium text-warm-700">{order.restaurant.nom}</span>
                </div>

                <p className="text-sm text-warm-400 mb-3 line-clamp-1">
                  {order.lignesCommande.map(l => `${l.quantite}x ${l.plat.nom}`).join(', ')}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-warm-100">
                  <span className="font-bold text-brand-500">{formatPrice(order.montantFinal)}</span>
                  <div className="flex gap-2">
                    {CANCELLABLE_STATUTS.has(order.statut) && (
                      <button onClick={() => cancelOrder(order.id)} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                        Annuler
                      </button>
                    )}
                    <Link to={`/commandes/${order.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-500 bg-brand-50 hover:bg-brand-100 transition-colors">
                      Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
