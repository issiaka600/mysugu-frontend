import { useEffect, useRef, useState } from 'react'
import { X, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { contactApi } from '@/api/contact.api'
import { extractErrorMessage } from '@/api/apiClient'

type Props = {
  open: boolean
  onClose: () => void
}

const SUBJECTS = [
  'Question générale',
  'Devenir partenaire',
  'Problème avec une commande',
  'Suggestion / Feedback',
  'Autre',
]

export default function ContactModal({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // Remember the element that had focus, then move focus into the dialog.
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 0)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      window.clearTimeout(focusTimer)
      // Return focus to the previously focused element on close.
      lastFocusedRef.current?.focus?.()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setSent(false)
      setSending(false)
      setName(''); setEmail(''); setPhone(''); setMessage(''); setSubject(SUBJECTS[0])
    }
  }, [open])

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Merci de remplir les champs obligatoires.')
      return
    }
    setSending(true)
    try {
      await contactApi.send({
        nom: name.trim(),
        email: email.trim(),
        telephone: phone.trim() || undefined,
        sujet: subject,
        message: message.trim(),
      })
      setSent(true)
      toast.success('Votre message a bien été envoyé, nous vous répondrons rapidement.')
      setTimeout(onClose, 1600)
    } catch (err) {
      toast.error(extractErrorMessage(err, "Impossible d'envoyer le message. Réessayez."))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-warm-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-float overflow-hidden animate-scale-in max-h-[90vh] flex flex-col"
      >
        <div className="relative bg-brand-gradient text-white px-6 sm:px-8 py-7">
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 min-h-[44px] min-w-[44px] rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <div className="relative">
            <h2 id="contact-title" className="font-display font-extrabold text-2xl sm:text-3xl mb-1">Contactez-nous</h2>
            <p className="text-white/85 text-sm max-w-md">
              Une question, un partenariat, ou simplement envie d'échanger ? Notre équipe vous répond rapidement.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sent ? (
            <div className="px-6 sm:px-8 py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-warm-900 mb-2">Message envoyé</h3>
              <p className="text-warm-500 text-sm">Nous reviendrons vers vous d'ici peu.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="px-6 sm:px-8 py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-warm-100">
                <InfoChip icon={<Mail size={14} />} label="mysukucontact@gmail.com" />
                <InfoChip icon={<Phone size={14} />} label="+212 6 93 85 63 64" />
                <InfoChip icon={<MapPin size={14} />} label="Marrakech, Maroc" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nom complet" required>
                  <input
                    ref={firstFieldRef}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field"
                    placeholder="Votre nom"
                    required
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="vous@exemple.com"
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Téléphone (optionnel)">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="+212 6 00 00 00 00"
                  />
                </Field>
                <Field label="Sujet">
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="input-field !pr-10 appearance-none bg-no-repeat bg-[length:16px] bg-[position:right_14px_center]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23B8A482'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
                  >
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Message" required>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="input-field min-h-[120px] resize-y"
                  placeholder="Dites-nous comment nous pouvons vous aider..."
                  required
                />
              </Field>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary inline-flex items-center justify-center gap-2 text-sm"
                >
                  {sending ? 'Envoi...' : <>Envoyer <Send size={16} /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-brand-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-warm-600">
      <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  )
}
