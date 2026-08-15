import { useState, useEffect, useRef, FormEvent } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Mail, ArrowRight } from 'lucide-react'
import { authApi, extractErrorMessage } from '@/api'
import toast from 'react-hot-toast'

type Etat = 'verification' | 'succes' | 'echec'

/**
 * Page d'atterrissage du lien de vérification envoyé par email
 * (EmailService côté backend construit `${app.frontend.url}/verify-email?token=…`).
 *
 * Le token est consommé automatiquement au montage : l'utilisateur a déjà cliqué,
 * lui redemander de cliquer serait une étape de trop.
 */
export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [etat, setEtat] = useState<Etat>(token ? 'verification' : 'echec')
  const [message, setMessage] = useState(token ? '' : 'Ce lien est incomplet : le token est absent.')

  // Le token est à usage unique. Sans ce garde-fou, le double montage de
  // <StrictMode> en développement consommerait le token au 1er appel puis
  // afficherait l'échec du 2e ("Token déjà utilisé") — un succès transformé en erreur.
  const dejaEnvoye = useRef(false)

  useEffect(() => {
    if (!token || dejaEnvoye.current) return
    dejaEnvoye.current = true

    authApi.verifyEmail(token)
      .then(() => {
        setEtat('succes')
        setMessage('Votre adresse email est vérifiée. Vous pouvez maintenant vous connecter.')
      })
      .catch(err => {
        const raison = extractErrorMessage(err, 'Ce lien est invalide ou a expiré.')
        // Les trois refus du backend sont des 400 ; seul le message les distingue.
        // Un token déjà consommé signifie que l'adresse EST vérifiée (rechargement
        // de la page, ou lien déjà ouvert depuis l'application) : ce n'est pas un échec.
        if (/utilis/i.test(raison)) {
          setEtat('succes')
          setMessage('Cette adresse email est déjà vérifiée. Vous pouvez vous connecter.')
          return
        }
        setEtat('echec')
        setMessage(raison)
      })
  }, [token])

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="MySuku" className="h-10 w-10" />
          <span className="font-display font-extrabold text-xl text-warm-900">My<span className="text-brand-500">Suku</span></span>
        </Link>

        {etat === 'verification' && (
          <div className="text-center py-10">
            <span className="inline-block w-10 h-10 border-[3px] border-warm-200 border-t-brand-500 rounded-full animate-spin" />
            <h1 className="font-display font-extrabold text-2xl text-warm-900 mt-6">Vérification en cours…</h1>
            <p className="text-warm-400 mt-2">Un instant, nous validons votre lien.</p>
          </div>
        )}

        {etat === 'succes' && (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="font-display font-extrabold text-3xl text-warm-900 mb-3">Adresse vérifiée</h1>
            <p className="text-warm-500 mb-8">{message}</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Se connecter <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {etat === 'echec' && <BlocEchec message={message} />}
      </div>
    </div>
  )
}

/** Échec : on explique, puis on propose immédiatement un nouveau lien. */
function BlocEchec({ message }: { message: string }) {
  const [email, setEmail] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const renvoyer = async (e: FormEvent) => {
    e.preventDefault()
    setEnvoi(true)
    try {
      await authApi.resendVerification(email)
      // Le backend répond volontairement la même chose que l'adresse existe ou non
      // (protection contre l'énumération d'emails) : le message reste donc neutre.
      toast.success('Si cette adresse nécessite une vérification, un nouveau lien vient d\'être envoyé.')
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Envoi impossible pour le moment.'))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <XCircle size={40} className="text-red-500" />
      </div>
      <h1 className="font-display font-extrabold text-3xl text-warm-900 mb-3">Lien non valide</h1>
      <p className="text-warm-500 mb-8">{message}</p>

      <form onSubmit={renvoyer} className="space-y-4 text-left">
        <div>
          <label className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-1.5 block">
            Recevoir un nouveau lien
          </label>
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
        <button type="submit" disabled={envoi} className="btn-primary w-full flex items-center justify-center gap-2">
          {envoi
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <>Renvoyer le lien <ArrowRight size={18} /></>
          }
        </button>
      </form>

      <Link to="/login" className="inline-block text-sm text-warm-500 hover:text-warm-700 mt-6">
        Retour à la connexion
      </Link>
    </div>
  )
}
