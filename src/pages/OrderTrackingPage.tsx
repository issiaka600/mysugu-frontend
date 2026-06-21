import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, ChefHat, Truck,
  Package, Phone, MapPin, CreditCard,
} from 'lucide-react'
import { commandesApi, extractErrorMessage } from '@/api'
import type { ApiCommande, StatutCommande } from '@/types/api'
import { formatPrice, STATUT_LABELS } from '@/utils/format'
import toast from 'react-hot-toast'

const TIMELINE_STEPS: { status: StatutCommande; label: string; icon: React.ReactNode }[] = [
  { status: 'EN_ATTENTE', label: 'Commande passee', icon: <Clock size={18} /> },
  { status: 'CONFIRMEE', label: 'Confirmee', icon: <CheckCircle2 size={18} /> },
  { status: 'EN_PREPARATION', label: 'En preparation', icon: <ChefHat size={18} /> },
  { status: 'PRETE', label: 'Prete', icon: <Package size={18} /> },
  { status: 'EN_COURS', label: 'En livraison', icon: <Truck size={18} /> },
  { status: 'LIVREE', label: 'Livree', icon: <CheckCircle2 size={18} /> },
]

const STATUS_ORDER: Record<string, number> = {
  EN_ATTENTE: 0, CONFIRMEE: 1, EN_PREPARATION: 2, PRETE: 3, EN_COURS: 4, LIVREE: 5,
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ApiCommande | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await commandesApi.getById(id)
        setOrder(res.data)
      } catch { navigate('/mes-commandes') }
      setLoading(false)
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [id, navigate])

  const cancelOrder = async () => {
    if (!order) return
    try {
      await commandesApi.cancel(order.id)
      toast.success('Commande annulee')
      const res = await commandesApi.getById(order.id)
      setOrder(res.data)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) return null

  const currentStep = STATUS_ORDER[order.statut] ?? -1
  const isCancelled = order.statut === 'ANNULEE'

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate('/mes-commandes')} className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 mb-6">
          <ArrowLeft size={18} /> Mes commandes
        </button>

        {/* Order header */}
        <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-warm-900">Commande #{order.numeroCommande}</h1>
              <p className="text-sm text-warm-400 mt-1">
                {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className={`badge text-sm ${isCancelled ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
              {STATUT_LABELS[order.statut]}
            </span>
          </div>

          {/* Restaurant info */}
          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-warm-100 overflow-hidden">
              {order.restaurant.logoUrl && <img src={order.restaurant.logoUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="font-semibold text-warm-900">{order.restaurant.nom}</p>
              <p className="text-xs text-warm-400">{order.restaurant.localisation?.adresse}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-6">Suivi de la commande</h2>
            <div className="relative">
              {TIMELINE_STEPS.map((step, i) => {
                const stepIdx = STATUS_ORDER[step.status]
                const isCompleted = currentStep >= stepIdx
                const isCurrent = currentStep === stepIdx
                return (
                  <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isCurrent ? 'bg-brand-500 text-white shadow-brand' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-warm-100 text-warm-400'
                      }`}>
                        {step.icon}
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 ${isCompleted ? 'bg-emerald-300' : 'bg-warm-100'}`} />
                      )}
                    </div>
                    <div className="pt-2">
                      <p className={`font-semibold text-sm ${isCompleted ? 'text-warm-900' : 'text-warm-400'}`}>{step.label}</p>
                      {isCurrent && <p className="text-xs text-brand-500 mt-0.5 pulse-dot">En cours...</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cancelled */}
        {isCancelled && (
          <div className="bg-red-50 rounded-3xl p-6 border border-red-100 mb-6 flex items-start gap-3">
            <XCircle size={24} className="text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Commande annulee</p>
              {order.raisonAnnulation && <p className="text-sm text-red-600 mt-1">{order.raisonAnnulation}</p>}
            </div>
          </div>
        )}

        {/* Driver info */}
        {order.livreur && (
          <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Votre livreur</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xl font-bold">
                {order.livreur.prenom?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-warm-900">{order.livreur.prenom} {order.livreur.nom}</p>
                <p className="text-sm text-warm-400">Livreur MySuku</p>
              </div>
              {order.livreur.telephone && (
                <a href={`tel:${order.livreur.telephone}`} className="p-3 rounded-xl bg-brand-50 text-brand-500 hover:bg-brand-100 transition-colors">
                  <Phone size={20} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order.adresseLivraison && (
          <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-brand-500" /> Adresse de livraison
            </h2>
            <p className="text-sm text-warm-600">{order.adresseLivraison.adresse}, {order.adresseLivraison.ville}</p>
          </div>
        )}

        {/* Order details */}
        <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
          <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Details de la commande</h2>
          <div className="space-y-3 mb-4">
            {order.lignesCommande.map(l => (
              <div key={l.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-warm-50 flex items-center justify-center text-xs font-bold text-warm-600">{l.quantite}x</span>
                  <span className="text-sm text-warm-700">{l.plat.nom}</span>
                </div>
                <span className="text-sm font-medium text-warm-800">{formatPrice(l.montantTotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-warm-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-warm-500">
              <span>Sous-total</span><span>{formatPrice(order.montantTotal)}</span>
            </div>
            <div className="flex justify-between text-warm-500">
              <span>Livraison</span><span>{formatPrice(order.fraisLivraison)}</span>
            </div>
            {order.montantRemise > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Remise</span><span>-{formatPrice(order.montantRemise)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-warm-100">
              <span className="font-bold text-warm-900">Total</span>
              <span className="font-bold text-lg text-brand-500">{formatPrice(order.montantFinal)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-warm-100 flex items-center gap-2 text-sm text-warm-400">
            <CreditCard size={14} />
            <span>{order.methodePaiement === 'CARTE_BANCAIRE' ? 'Carte bancaire' : 'Especes'}</span>
            <span className="text-warm-300">&bull;</span>
            <span className={order.statutPaiement === 'PAYE' ? 'text-emerald-500' : order.statutPaiement === 'ECHOUE' ? 'text-red-500' : 'text-amber-500'}>
              {order.statutPaiement === 'PAYE' ? 'Paye' : order.statutPaiement === 'ECHOUE' ? 'Echoue' : 'En attente'}
            </span>
          </div>
        </div>

        {/* Actions */}
        {order.statut === 'EN_ATTENTE' && (
          <button onClick={cancelOrder} className="w-full py-3 text-center text-red-500 font-semibold text-sm hover:bg-red-50 rounded-2xl transition-colors">
            Annuler la commande
          </button>
        )}
      </div>
    </div>
  )
}
