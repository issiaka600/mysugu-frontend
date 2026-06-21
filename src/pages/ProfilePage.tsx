import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Lock, LogOut, Shield,
  ChevronRight, Heart, Wallet, ClipboardList, Star, Edit3,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi, addressesApi, fideliteApi, extractErrorMessage, mapAddress } from '@/api'
import type { Address } from '@/types'
import type { ApiPointsFidelite } from '@/types/api'
import toast from 'react-hot-toast'

const LEVEL_COLORS: Record<string, string> = {
  BRONZE: 'from-amber-600 to-amber-400',
  ARGENT: 'from-slate-400 to-slate-300',
  OR: 'from-yellow-500 to-yellow-300',
  PLATINE: 'from-purple-500 to-purple-300',
}

const LEVEL_LABELS: Record<string, string> = {
  BRONZE: 'Bronze', ARGENT: 'Argent', OR: 'Or', PLATINE: 'Platine',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [fidelite, setFidelite] = useState<ApiPointsFidelite | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?redirect=/profil'); return }
    addressesApi.getAll().then(r => setAddresses(r.data.map(mapAddress))).catch(() => {})
    fideliteApi.get().then(r => setFidelite(r.data)).catch(() => {})
  }, [isAuthenticated, navigate])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw.length < 6) { toast.error('Min 6 caractères'); return }
    setPwLoading(true)
    try {
      await authApi.changePassword(oldPw, newPw)
      toast.success('Mot de passe modifié')
      setShowPasswordForm(false)
      setOldPw('')
      setNewPw('')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
    setPwLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="section-title mb-8">Mon profil</h1>

        {/* User card */}
        <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-xl text-warm-900">{user.name}</h2>
              <p className="text-sm text-warm-400">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
              <Mail size={18} className="text-brand-500" />
              <div className="min-w-0">
                <p className="text-xs text-warm-400">Email</p>
                <p className="text-sm font-medium text-warm-900 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
              <Phone size={18} className="text-brand-500" />
              <div className="min-w-0">
                <p className="text-xs text-warm-400">Téléphone</p>
                <p className="text-sm font-medium text-warm-900">{user.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty card */}
        {fidelite && (
          <div className={`bg-gradient-to-r ${LEVEL_COLORS[fidelite.niveauFidelite] || LEVEL_COLORS.BRONZE} rounded-3xl p-6 text-white mb-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm">Niveau fidélité</p>
                  <p className="font-display font-extrabold text-2xl">{LEVEL_LABELS[fidelite.niveauFidelite]}</p>
                </div>
                <Star size={32} className="text-white/30" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-extrabold">{fidelite.points}</p>
                  <p className="text-white/70 text-sm">points</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">Prochain niveau</p>
                  <p className="font-bold">{fidelite.pointsProchainNiveau} pts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-white rounded-3xl border border-warm-100 mb-6 overflow-hidden">
          <ProfileLink to="/mes-commandes" icon={<ClipboardList size={18} />} label="Mes commandes" />
          <ProfileLink to="/favoris" icon={<Heart size={18} />} label="Mes favoris" />
          <ProfileLink to="/wallet" icon={<Wallet size={18} />} label="Mon portefeuille" />
          <ProfileLink to="/notifications" icon={<Shield size={18} />} label="Notifications" last />
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-warm-900 flex items-center gap-2">
              <MapPin size={18} className="text-brand-500" /> Mes adresses
            </h2>
          </div>
          {addresses.length === 0 ? (
            <p className="text-sm text-warm-400">Aucune adresse enregistrée.</p>
          ) : (
            <div className="space-y-2">
              {addresses.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
                  <MapPin size={16} className="text-warm-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900">{a.label}</p>
                    <p className="text-xs text-warm-400 truncate">{a.address}, {a.city}</p>
                  </div>
                  {a.isDefault && <span className="text-[10px] font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">Défaut</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security */}
        <div className="bg-white rounded-3xl p-6 border border-warm-100 mb-6">
          <h2 className="font-display font-bold text-lg text-warm-900 flex items-center gap-2 mb-4">
            <Lock size={18} className="text-brand-500" /> Sécurité
          </h2>
          {showPasswordForm ? (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input type="password" aria-label="Mot de passe actuel" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Mot de passe actuel" className="input-field" required />
              <input type="password" aria-label="Nouveau mot de passe" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Nouveau mot de passe (min 6 car.)" className="input-field" required minLength={6} />
              <div className="flex gap-2">
                <button type="submit" disabled={pwLoading} className="btn-primary text-sm">
                  {pwLoading ? 'Modification...' : 'Modifier'}
                </button>
                <button type="button" onClick={() => setShowPasswordForm(false)} className="btn-ghost text-sm">Annuler</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowPasswordForm(true)} className="flex items-center gap-2 text-sm text-brand-500 font-semibold hover:text-brand-600">
              <Edit3 size={14} /> Changer le mot de passe
            </button>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-semibold hover:bg-red-50 rounded-2xl transition-colors">
          <LogOut size={18} /> Se déconnecter
        </button>
      </div>
    </div>
  )
}

function ProfileLink({ to, icon, label, last }: { to: string; icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-6 py-4 hover:bg-warm-50 transition-colors ${!last ? 'border-b border-warm-50' : ''}`}>
      <span className="text-brand-500">{icon}</span>
      <span className="flex-1 text-sm font-medium text-warm-700">{label}</span>
      <ChevronRight size={16} className="text-warm-300" />
    </Link>
  )
}
