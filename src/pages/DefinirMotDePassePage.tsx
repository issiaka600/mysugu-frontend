import { useState, FormEvent } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Lock, ArrowRight } from 'lucide-react'
import { authApi, extractErrorMessage } from '@/api'
import toast from 'react-hot-toast'

export default function DefinirMotDePassePage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) { toast.error('Lien invalide'); return }
    if (pwd.length < 8) { toast.error('Au moins 8 caractères'); return }
    if (pwd !== confirm) { toast.error('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      await authApi.definirMotDePasse(token, pwd)
      toast.success('Mot de passe défini, vous pouvez vous connecter')
      navigate('/login')
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Lien expiré ou invalide'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="MySuku" className="h-10 w-10" />
          <span className="font-display font-extrabold text-xl text-warm-900">My<span className="text-brand-500">Suku</span></span>
        </Link>

        <>
          <Link to="/login" className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700 mb-6">
            <ArrowLeft size={16} /> Retour
          </Link>
          <h1 className="font-display font-extrabold text-3xl text-warm-900 mb-2">Définir votre mot de passe</h1>
          <p className="text-warm-400 mb-8">Choisissez un mot de passe sécurisé pour accéder à votre compte.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  type="password"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-1.5 block">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Définir le mot de passe <ArrowRight size={18} /></>
              }
            </button>
          </form>
        </>
      </div>
    </div>
  )
}
