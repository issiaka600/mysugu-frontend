import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-warm-900 text-warm-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo onDark />
            </Link>
            <p className="text-sm leading-relaxed text-warm-400 mb-6 max-w-sm">
              MySuku, c'est plus qu'une application de livraison, c'est toute une vie simplifiée.
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
              {[
                ['/', 'Accueil'],
                ['/restaurants', 'Restaurants'],
                ['/alimentaires', 'Alimentaires'],
                ['/cosmetiques', 'Cosmétiques'],
                ['/promotions', 'Promotions'],
              ].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-warm-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Compte</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/mes-commandes" className="text-warm-400 hover:text-white transition-colors">Mes commandes</Link></li>
              <li><Link to="/favoris" className="text-warm-400 hover:text-white transition-colors">Favoris</Link></li>
              <li><Link to="/profil" className="text-warm-400 hover:text-white transition-colors">Mon profil</Link></li>
              <li><Link to="/wallet" className="text-warm-400 hover:text-white transition-colors">Portefeuille</Link></li>
              <li><a href="#" className="text-warm-400 hover:text-white transition-colors">Devenir partenaire</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin size={16} className="shrink-0 mt-0.5 text-brand-400" /><span>Marrakech, Maroc</span></li>
              <li className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-brand-400" /><a href="tel:+212693856364" className="hover:text-white transition-colors">+212 6 93 85 63 64</a></li>
              <li className="flex items-center gap-2"><Mail size={16} className="shrink-0 text-brand-400" /><a href="mailto:mysukucontact@gmail.com" className="hover:text-white transition-colors break-all">mysukucontact@gmail.com</a></li>
            </ul>
            <div className="mt-5 pt-5 border-t border-warm-800">
              <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider mb-3">Informations</h5>
              <ul className="space-y-2 text-sm">
                {['À propos', 'CGV', 'Confidentialité'].map(label => (
                  <li key={label}><a href="#" className="text-warm-400 hover:text-white transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-warm-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-warm-500">
          <p>&copy; {new Date().getFullYear()} MySuku. Tous droits réservés.</p>
          <p>Fait avec <span className="text-brand-400">&#9829;</span> au Maroc</p>
        </div>
      </div>
    </footer>
  )
}
