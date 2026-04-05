import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, CreditCard, Banknote, Check, Navigation,
  Loader2, Tag, ShoppingBag, AlertCircle, Globe, XCircle, CheckCircle2,
  Lock, X, Shield,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { commandesApi, zonesApi, extractErrorMessage } from '@/api'
import type { ApiCommandeRequest, MethodePaiement, ModeReception, ApiZoneDeploiement } from '@/types/api'
import { formatPrice } from '@/utils/format'
import toast from 'react-hot-toast'
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

/** Haversine distance in km between two GPS points */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Estimate delivery fee from zone tariffs */
function estimateDeliveryFee(zone: ApiZoneDeploiement, distKm: number): number {
  const base = zone.fraisLivraisonMin ?? 15
  if (!zone.distanceMinKm || !zone.prixExtraParKm) return base
  if (distKm <= zone.distanceMinKm) return base
  const extra = (distKm - zone.distanceMinKm) * zone.prixExtraParKm
  return Math.max(base, base + extra)
}

type ZoneStatus = 'idle' | 'checking' | 'covered' | 'not-covered'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()

  // Zones
  const [zones, setZones] = useState<ApiZoneDeploiement[]>([])
  const [selectedZone, setSelectedZone] = useState<ApiZoneDeploiement | null>(null)
  const [zoneStatus, setZoneStatus] = useState<ZoneStatus>('idle')
  const [distanceToZone, setDistanceToZone] = useState(0)
  const [estimatedFee, setEstimatedFee] = useState(15)

  // Address
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [gpsAddress, setGpsAddress] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [reverseLoading, setReverseLoading] = useState(false)

  // Order
  const [comment, setComment] = useState('')
  const [payMethod, setPayMethod] = useState<MethodePaiement>('ESPECES')
  const [mode, setMode] = useState<ModeReception>('LIVRAISON')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const sub = subtotal()
  const deliveryFee = mode === 'LIVRAISON' ? estimatedFee : 0
  const total = sub + deliveryFee - promoDiscount

  // Load zones on mount
  useEffect(() => {
    if (items.length === 0) { navigate('/restaurants'); return }
    zonesApi.getActives()
      .then(res => {
        setZones(res.data)
        if (res.data.length === 1) {
          selectZone(res.data[0])
        }
      })
      .catch(() => {})
  }, [items, navigate])

  const selectZone = (zone: ApiZoneDeploiement) => {
    setSelectedZone(zone)
    setCity(zone.nom)
    // If we already have GPS, re-check coverage
    if (lat && lng) {
      checkCoverage(lat, lng, zone)
    } else {
      setZoneStatus('idle')
    }
  }

  /** Check if GPS coords are within the selected zone */
  const checkCoverage = (latitude: number, longitude: number, zone: ApiZoneDeploiement) => {
    setZoneStatus('checking')
    const dist = haversineKm(latitude, longitude, zone.centreLatitude, zone.centreLongitude)
    setDistanceToZone(Math.round(dist * 10) / 10)
    const fee = estimateDeliveryFee(zone, dist)
    setEstimatedFee(Math.round(fee * 100) / 100)

    if (dist <= zone.rayonKm) {
      setZoneStatus('covered')
    } else {
      setZoneStatus('not-covered')
    }
  }

  /** Reverse geocode GPS coordinates to get a human-readable address */
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setReverseLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      )
      const data = await res.json()
      if (data.display_name) {
        const addr = data.address || {}
        const parts = [
          addr.road || addr.pedestrian || addr.neighbourhood,
          addr.suburb || addr.city_district,
          addr.city || addr.town || addr.village,
        ].filter(Boolean)
        const readable = parts.join(', ') || data.display_name
        setGpsAddress(readable)
        setAddress(readable)
        if (addr.city || addr.town || addr.village) {
          setCity(addr.city || addr.town || addr.village)
        }
      }
    } catch {
      // Silently fail - we still have GPS coords
    }
    setReverseLoading(false)
  }

  const detectLocation = () => {
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        setLat(latitude)
        setLng(longitude)
        setLocLoading(false)
        toast.success('Position detectee')

        // Reverse geocode
        reverseGeocode(latitude, longitude)

        // Auto-check which zone covers this location
        if (selectedZone) {
          checkCoverage(latitude, longitude, selectedZone)
        } else if (zones.length > 0) {
          // Find closest zone that covers this point
          let bestZone: ApiZoneDeploiement | null = null
          let bestDist = Infinity
          for (const z of zones) {
            const d = haversineKm(latitude, longitude, z.centreLatitude, z.centreLongitude)
            if (d <= z.rayonKm && d < bestDist) {
              bestZone = z
              bestDist = d
            }
          }
          if (bestZone) {
            setSelectedZone(bestZone)
            setCity(bestZone.nom)
            checkCoverage(latitude, longitude, bestZone)
          } else {
            // No zone covers this point - pick closest and show not-covered
            const closest = zones.reduce((prev, curr) => {
              const dp = haversineKm(latitude, longitude, prev.centreLatitude, prev.centreLongitude)
              const dc = haversineKm(latitude, longitude, curr.centreLatitude, curr.centreLongitude)
              return dc < dp ? curr : prev
            })
            setSelectedZone(closest)
            setCity(closest.nom)
            checkCoverage(latitude, longitude, closest)
          }
        }
      },
      () => {
        setLocLoading(false)
        toast.error('Impossible de detecter la position')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const validatePromo = async () => {
    if (!promoCode.trim()) return
    try {
      const res = await commandesApi.validatePromo(promoCode, sub)
      if (res.data.valid) {
        setPromoDiscount(res.data.remise)
        setPromoApplied(true)
        toast.success(res.data.message)
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  // Stripe payment modal state
  const [stripeSecret, setStripeSecret] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)

  const canOrder =
    isAuthenticated &&
    !submitting &&
    (mode !== 'LIVRAISON' || (address.trim() && zoneStatus !== 'not-covered'))

  const buildOrderData = (): ApiCommandeRequest => ({
    clientId: Number(user!.id),
    restaurantId: Number(items[0].restaurantId),
    lignes: items.map(i => ({ platId: Number(i.dish.id), quantite: i.quantity })),
    adresseLivraison: {
      latitude: lat || 0,
      longitude: lng || 0,
      adresse: address,
      ville: city || (selectedZone?.nom ?? ''),
    },
    methodePaiement: payMethod,
    modeReception: mode,
    commentaire: comment || undefined,
    codePromo: promoApplied ? promoCode : undefined,
  })

  const handleOrder = async () => {
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return }
    if (mode === 'LIVRAISON') {
      if (!address.trim()) { toast.error('Veuillez renseigner une adresse'); return }
      if (!lat && !lng) { toast.error('Veuillez activer la localisation GPS'); return }
      if (zoneStatus === 'not-covered') { toast.error('La livraison n\'est pas disponible dans cette zone'); return }
    }

    setSubmitting(true)
    try {
      const res = await commandesApi.create(buildOrderData())

      // If card payment with Stripe secret → show payment modal
      if (payMethod === 'CARTE_BANCAIRE' && res.data.stripeClientSecret) {
        setPendingOrderId(res.data.id)
        setStripeSecret(res.data.stripeClientSecret)
        setSubmitting(false)
        return
      }

      // Cash or Stripe not enabled → go to tracking
      clearCart()
      toast.success('Commande passee avec succes !')
      navigate(`/commandes/${res.data.id}`)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erreur lors de la commande'))
    }
    setSubmitting(false)
  }

  const onPaymentSuccess = () => {
    clearCart()
    toast.success('Paiement effectue avec succes !')
    navigate(`/commandes/${pendingOrderId}`)
  }

  const onPaymentCancel = () => {
    setStripeSecret(null)
    setPendingOrderId(null)
    toast('Paiement annule. La commande reste en attente.', { icon: '\u2139\uFE0F' })
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 mb-6">
          <ArrowLeft size={18} /> Retour
        </button>

        <h1 className="section-title mb-8">Finaliser la commande</h1>

        <div className="space-y-6">
          {/* Mode de reception */}
          <div className="bg-white rounded-2xl p-6 border border-warm-100">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Mode de reception</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'LIVRAISON' as const, label: 'Livraison', emoji: '\uD83D\uDEF5' },
                { value: 'RETRAIT_SUR_PLACE' as const, label: 'Retrait sur place', emoji: '\uD83C\uDFEA' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${mode === opt.value ? 'border-brand-500 bg-brand-50' : 'border-warm-100 hover:border-warm-200'}`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <p className="font-semibold text-sm text-warm-900 mt-2">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Zone de livraison + Adresse */}
          {mode === 'LIVRAISON' && (
            <div className="bg-white rounded-2xl p-6 border border-warm-100 space-y-5">
              {/* Zone selector */}
              <div>
                <h2 className="font-display font-bold text-lg text-warm-900 mb-1 flex items-center gap-2">
                  <Globe size={20} className="text-brand-500" /> Zone de livraison
                </h2>
                <p className="text-xs text-warm-400 mb-4">Selectionnez la zone ou vous souhaitez etre livre</p>

                {zones.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
                    <AlertCircle size={16} className="shrink-0" />
                    Aucune zone de livraison disponible pour le moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {zones.map(zone => (
                      <button
                        key={zone.id}
                        onClick={() => selectZone(zone)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          selectedZone?.id === zone.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-warm-100 hover:border-warm-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={16} className={selectedZone?.id === zone.id ? 'text-brand-500' : 'text-warm-400'} />
                          <span className="font-semibold text-sm text-warm-900">{zone.nom}</span>
                        </div>
                        <p className="text-xs text-warm-400 line-clamp-1">{zone.description || `Rayon de ${zone.rayonKm} km`}</p>
                        {zone.fraisLivraisonMin != null && (
                          <p className="text-xs text-brand-500 font-medium mt-1">
                            A partir de {formatPrice(zone.fraisLivraisonMin)}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-warm-100" />

              {/* Address */}
              <div>
                <h3 className="font-semibold text-warm-900 mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-brand-500" /> Adresse de livraison
                </h3>

                {/* GPS detection button */}
                <button
                  onClick={detectLocation}
                  disabled={locLoading}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-warm-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all mb-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    {locLoading ? <Loader2 size={20} className="text-brand-500 animate-spin" /> : <Navigation size={20} className="text-brand-500" />}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-warm-900">Utiliser ma position GPS</p>
                    <p className="text-xs text-warm-400">Detecter automatiquement mon adresse exacte</p>
                  </div>
                </button>

                {/* GPS result - show detected address */}
                {lat > 0 && lng > 0 && (
                  <div className={`p-4 rounded-2xl mb-4 ${
                    zoneStatus === 'covered' ? 'bg-emerald-50 border border-emerald-200' :
                    zoneStatus === 'not-covered' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {zoneStatus === 'covered' && <CheckCircle2 size={20} className="text-emerald-500" />}
                        {zoneStatus === 'not-covered' && <XCircle size={20} className="text-red-500" />}
                        {(zoneStatus === 'idle' || zoneStatus === 'checking') && <MapPin size={20} className="text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${
                          zoneStatus === 'covered' ? 'text-emerald-800' :
                          zoneStatus === 'not-covered' ? 'text-red-800' : 'text-blue-800'
                        }`}>
                          {zoneStatus === 'covered' && 'Adresse couverte !'}
                          {zoneStatus === 'not-covered' && 'Zone non couverte'}
                          {zoneStatus === 'idle' && 'Position detectee'}
                          {zoneStatus === 'checking' && 'Verification...'}
                        </p>

                        {reverseLoading ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Loader2 size={12} className="animate-spin text-warm-400" />
                            <span className="text-xs text-warm-400">Recherche de l'adresse...</span>
                          </div>
                        ) : gpsAddress ? (
                          <p className="text-sm text-warm-600 mt-1">{gpsAddress}</p>
                        ) : null}

                        <p className="text-xs text-warm-400 mt-1">
                          GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
                          {distanceToZone > 0 && selectedZone && (
                            <> &bull; {distanceToZone} km du centre de {selectedZone.nom}</>
                          )}
                        </p>

                        {zoneStatus === 'not-covered' && selectedZone && (
                          <div className="mt-3 p-3 bg-white/60 rounded-xl">
                            <p className="text-xs text-red-700 font-medium">
                              Votre position se trouve a {distanceToZone} km du centre de la zone "{selectedZone.nom}"
                              (rayon maximum : {selectedZone.rayonKm} km).
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              La livraison n'est pas encore disponible a cette adresse.
                              Veuillez choisir une adresse dans une zone couverte.
                            </p>
                          </div>
                        )}

                        {zoneStatus === 'covered' && (
                          <p className="text-xs text-emerald-600 font-medium mt-1">
                            Frais de livraison estimes : {formatPrice(estimatedFee)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual address fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-1.5 block">Adresse</label>
                    <input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Rue, quartier, repere..."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-1.5 block">Ville</label>
                    <input
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Ville"
                      className="input-field"
                      readOnly={!!selectedZone}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paiement */}
          <div className="bg-white rounded-2xl p-6 border border-warm-100">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Mode de paiement</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPayMethod('ESPECES')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${payMethod === 'ESPECES' ? 'border-brand-500 bg-brand-50' : 'border-warm-100 hover:border-warm-200'}`}
              >
                <Banknote size={24} className={payMethod === 'ESPECES' ? 'text-brand-500' : 'text-warm-400'} />
                <div className="text-left">
                  <p className="font-semibold text-sm text-warm-900">Especes</p>
                  <p className="text-xs text-warm-400">Payer a la livraison</p>
                </div>
              </button>
              <button
                onClick={() => setPayMethod('CARTE_BANCAIRE')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${payMethod === 'CARTE_BANCAIRE' ? 'border-brand-500 bg-brand-50' : 'border-warm-100 hover:border-warm-200'}`}
              >
                <CreditCard size={24} className={payMethod === 'CARTE_BANCAIRE' ? 'text-brand-500' : 'text-warm-400'} />
                <div className="text-left">
                  <p className="font-semibold text-sm text-warm-900">Carte bancaire</p>
                  <p className="text-xs text-warm-400">Visa, Mastercard</p>
                </div>
              </button>
            </div>
          </div>

          {/* Code promo */}
          <div className="bg-white rounded-2xl p-6 border border-warm-100">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-4 flex items-center gap-2">
              <Tag size={20} className="text-brand-500" /> Code promo
            </h2>
            <div className="flex gap-2">
              <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="Entrez votre code" className="input-field flex-1" disabled={promoApplied} />
              {promoApplied ? (
                <div className="flex items-center gap-1 px-4 text-emerald-600 font-semibold text-sm">
                  <Check size={16} /> Applique
                </div>
              ) : (
                <button onClick={validatePromo} className="btn-outline !py-2.5 shrink-0">Appliquer</button>
              )}
            </div>
          </div>

          {/* Commentaire */}
          <div className="bg-white rounded-2xl p-6 border border-warm-100">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Commentaire (optionnel)</h2>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Instructions speciales..." className="input-field !rounded-2xl" rows={2} />
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl p-6 border border-warm-100">
            <h2 className="font-display font-bold text-lg text-warm-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-brand-500" /> Resume
            </h2>
            <div className="space-y-2.5 mb-4">
              {items.map(item => (
                <div key={item.dish.id} className="flex justify-between text-sm">
                  <span className="text-warm-600">{item.quantity}x {item.dish.name}</span>
                  <span className="font-medium text-warm-800">{formatPrice(item.dish.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-warm-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-warm-500">
                <span>Sous-total</span><span className="text-warm-700">{formatPrice(sub)}</span>
              </div>
              {mode === 'LIVRAISON' && (
                <div className="flex justify-between text-warm-500">
                  <span>Livraison{zoneStatus === 'covered' ? '' : ' (estimation)'}</span>
                  <span className="text-warm-700">{formatPrice(deliveryFee)}</span>
                </div>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Remise</span><span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-warm-100">
                <span className="font-bold text-warm-900 text-base">Total</span>
                <span className="font-bold text-xl text-brand-500">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Auth wall */}
          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-800 mb-1">Connexion requise</p>
                <p className="text-sm text-amber-600 mb-3">Vous devez etre connecte pour passer commande.</p>
                <Link to="/login?redirect=/checkout" className="btn-primary text-sm !py-2 !px-4">Se connecter</Link>
              </div>
            </div>
          )}

          {/* Zone not covered warning */}
          {mode === 'LIVRAISON' && zoneStatus === 'not-covered' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
              <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-red-800 mb-1">Livraison non disponible</p>
                <p className="text-sm text-red-600">
                  Votre adresse se trouve en dehors de nos zones de livraison.
                  Choisissez le retrait sur place ou essayez une autre adresse.
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleOrder}
            disabled={!canOrder}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-4 text-base"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : payMethod === 'CARTE_BANCAIRE' ? (
              <>
                <Lock size={18} />
                Payer par carte &mdash; {formatPrice(total)}
              </>
            ) : (
              <>Confirmer la commande &mdash; {formatPrice(total)}</>
            )}
          </button>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      {stripeSecret && stripePromise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onPaymentCancel} />
          <div className="relative bg-white rounded-3xl shadow-float w-full max-w-md overflow-hidden animate-scale-in">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <CreditCard size={20} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-warm-900">Paiement securise</h3>
                  <p className="text-xs text-warm-400">Entrez vos informations de carte</p>
                </div>
              </div>
              <button onClick={onPaymentCancel} className="p-2 rounded-xl hover:bg-warm-100 text-warm-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Amount summary */}
            <div className="px-6 py-4 bg-warm-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-warm-600">Montant a payer</span>
                <span className="font-display font-extrabold text-2xl text-brand-500">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Stripe Elements form */}
            <div className="px-6 py-5">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripeSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#E84723',
                      colorBackground: '#ffffff',
                      colorText: '#1C1208',
                      colorDanger: '#dc2626',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      borderRadius: '12px',
                      spacingUnit: '4px',
                    },
                    rules: {
                      '.Input': {
                        border: '1px solid #F5EDD8',
                        boxShadow: 'none',
                        padding: '12px 16px',
                      },
                      '.Input:focus': {
                        border: '1px solid #E84723',
                        boxShadow: '0 0 0 3px rgba(232, 71, 35, 0.1)',
                      },
                      '.Label': {
                        fontWeight: '600',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#9A845E',
                      },
                    },
                  },
                }}
              >
                <StripePaymentForm
                  amount={total}
                  onSuccess={onPaymentSuccess}
                  onCancel={onPaymentCancel}
                />
              </Elements>
            </div>

            {/* Security badge */}
            <div className="px-6 py-3 border-t border-warm-100 bg-warm-50/50 flex items-center justify-center gap-2 text-xs text-warm-400">
              <Shield size={12} />
              <span>Paiement securise par Stripe &bull; Vos donnees sont chiffrees</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Stripe payment form rendered inside <Elements> */
function StripePaymentForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'Erreur de validation')
      setProcessing(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/mes-commandes',
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
        setError(confirmError.message || 'Erreur de paiement')
      } else {
        setError('Une erreur inattendue est survenue')
      }
      setProcessing(false)
    } else {
      // Payment succeeded without redirect
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost flex-1"
          disabled={processing}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!stripe || !ready || processing}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {processing ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Lock size={16} />
              Payer {formatPrice(amount)}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
