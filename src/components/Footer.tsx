import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-warm-900 text-warm-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="MySugu" className="h-10 w-10 brightness-0 invert" />
              <span className="font-display font-extrabold text-xl text-white">
                My<span className="text-brand-400">Sugu</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-warm-400 mb-6">
              Livraison rapide de vos plats preferes. Commandez en quelques clics et recevez votre repas en minutes.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-warm-800 hover:bg-brand-500 flex items-center justify-center text-warm-400 hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              {[['/', 'Accueil'], ['/restaurants', 'Restaurants'], ['/promotions', 'Promotions'], ['/mes-commandes', 'Mes commandes']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-warm-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Informations</h4>
            <ul className="space-y-2.5 text-sm">
              {['A propos', 'CGV', 'Confidentialite', 'Devenir partenaire'].map(label => (
                <li key={label}><a href="#" className="text-warm-400 hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin size={16} className="shrink-0 mt-0.5 text-brand-400" /><span>Bamako, Mali</span></li>
              <li className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-brand-400" /><span>+223 70 00 00 00</span></li>
              <li className="flex items-center gap-2"><Mail size={16} className="shrink-0 text-brand-400" /><span>contact@mysugu.com</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-warm-500">
          <p>&copy; {new Date().getFullYear()} MySugu. Tous droits reserves.</p>
          <p>Fait avec <span className="text-brand-400">&#9829;</span> au Mali</p>
        </div>
      </div>
    </footer>
  )
}
