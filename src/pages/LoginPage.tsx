import { useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import { extractErrorMessage } from '@/api/apiClient'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Bienvenue !')
      navigate(redirect)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Identifiants incorrects'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Left side - branding (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white max-w-md">
          <img src="/logo.png" alt="MySugu" className="h-20 w-20 mx-auto mb-8 brightness-0 invert" />
          <h2 className="font-display font-extrabold text-4xl mb-4">Bienvenue sur MySugu</h2>
          <p className="text-white/80 text-lg">
            Vos plats preferes, livres en quelques minutes. Rejoignez la communaute !
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="MySugu" className="h-12 w-12" />
              <span className="font-display font-extrabold text-2xl text-warm-900">
                My<span className="text-brand-500">Sugu</span>
              </span>
            </Link>
          </div>

          <h1 className="font-display font-extrabold text-3xl text-warm-900 mb-2">Se connecter</h1>
          <p className="text-warm-400 mb-8">Connectez-vous pour commander vos plats preferes</p>

          {/* Google Auth */}
          <GoogleAuthButton onSuccess={() => navigate(redirect)} />

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-warm-200" />
            <span className="text-sm text-warm-400">ou</span>
            <div className="flex-1 h-px bg-warm-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-warm-600 uppercase tracking-wider">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                  Oublie ?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="input-field !pl-11 !pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Se connecter <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-warm-400 mt-8">
            Pas encore de compte ?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-brand-500 font-semibold hover:text-brand-600">
              Creer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
