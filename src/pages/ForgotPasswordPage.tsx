import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, ArrowRight, Check } from 'lucide-react'
import { authApi, extractErrorMessage } from '@/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
      toast.success('Email de réinitialisation envoyé')
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erreur lors de l\'envoi'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="MySuku" className="h-10 w-10" />
          <span className="font-display font-extrabold text-xl text-warm-900">My<span className="text-brand-500">Suku</span></span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <Check size={32} className="text-emerald-500" />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-warm-900 mb-2">Email envoyé !</h1>
            <p className="text-warm-400 text-sm mb-6">
              Vérifiez votre boîte de réception à <strong>{email}</strong> pour réinitialiser votre mot de passe.
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-sm">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <Link to="/login" className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700 mb-6">
              <ArrowLeft size={16} /> Retour
            </Link>
            <h1 className="font-display font-extrabold text-3xl text-warm-900 mb-2">Mot de passe oublié</h1>
            <p className="text-warm-400 mb-8">Entrez votre email pour recevoir un lien de réinitialisation.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="input-field !pl-11" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Envoyer le lien <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
