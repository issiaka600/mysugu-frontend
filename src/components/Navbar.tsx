import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, User, Bell, Heart, Search, Menu, X, LogOut,
  ClipboardList, ChevronDown, Wallet, Mail,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import ContactModal from '@/components/ContactModal'
import Logo from './Logo'

const NAV_ITEMS: { to: string; label: string; match: (p: string) => boolean }[] = [
  { to: '/',             label: 'Accueil',      match: p => p === '/' },
  { to: '/restaurants',  label: 'Restaurants',  match: p => p.startsWith('/restaurants') },
  { to: '/alimentaires', label: 'Alimentaires', match: p => p.startsWith('/alimentaires') },
  { to: '/cosmetiques',  label: 'Cosmétiques',  match: p => p.startsWith('/cosmetiques') },
  { to: '/promotions',   label: 'Promos',       match: p => p.startsWith('/promotions') },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { totalItems, openCart } = useCartStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const count = totalItems()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const openContact = () => {
    setMenuOpen(false)
    setContactOpen(true)
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-white shadow-card py-2'
          : isHome ? 'py-3 bg-transparent' : 'py-3 bg-warm-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} active={item.match(pathname)}>
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={openContact}
              className="px-4 py-2 rounded-xl text-sm font-medium text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Mail size={14} /> Contact
            </button>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('/restaurants')}
              aria-label="Rechercher"
              className="lg:hidden p-2.5 rounded-xl hover:bg-warm-100 text-warm-600 transition-colors"
            >
              <Search size={20} />
            </button>

            {isAuthenticated && (
              <>
                <Link to="/favoris" aria-label="Favoris" className="hidden sm:flex p-2.5 rounded-xl hover:bg-warm-100 text-warm-600 transition-colors">
                  <Heart size={20} />
                </Link>
                <Link to="/notifications" aria-label="Notifications" className="relative p-2.5 rounded-xl hover:bg-warm-100 text-warm-600 transition-colors">
                  <Bell size={20} />
                </Link>
              </>
            )}

            <button
              onClick={openCart}
              aria-label="Panier"
              className="relative p-2.5 rounded-xl hover:bg-brand-50 text-warm-700 transition-colors"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-warm-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-warm-800 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-warm-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-float border border-warm-100 py-2 animate-fade-down z-50">
                    <div className="px-4 py-2 border-b border-warm-100">
                      <p className="font-semibold text-sm text-warm-900 truncate">{user?.name}</p>
                      <p className="text-xs text-warm-400 truncate">{user?.email}</p>
                    </div>
                    <DropdownLink to="/profil" icon={<User size={16} />} label="Mon profil" />
                    <DropdownLink to="/mes-commandes" icon={<ClipboardList size={16} />} label="Mes commandes" />
                    <DropdownLink to="/favoris" icon={<Heart size={16} />} label="Favoris" />
                    <DropdownLink to="/wallet" icon={<Wallet size={16} />} label="Portefeuille" />
                    <div className="border-t border-warm-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden lg:flex btn-primary !py-2.5 !px-5 text-sm">
                Connexion
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="lg:hidden p-2.5 rounded-xl hover:bg-warm-100 text-warm-700 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-[300px] h-full bg-white z-50 lg:hidden animate-slide-in-right shadow-float overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2">
                  <Logo />
                </Link>
                <button onClick={() => setMenuOpen(false)} aria-label="Fermer" className="p-2 rounded-xl hover:bg-warm-100 min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                  <X size={20} className="text-warm-600" />
                </button>
              </div>
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-warm-100">
                  <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-warm-900 truncate">{user.name}</p>
                    <p className="text-xs text-warm-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <nav className="space-y-1">
                {NAV_ITEMS.map(item => (
                  <MobileLink key={item.to} to={item.to} label={item.label} />
                ))}
                <button
                  onClick={openContact}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
                >
                  <Mail size={16} /> Contact
                </button>
                {isAuthenticated && (
                  <>
                    <MobileLink to="/mes-commandes" label="Mes commandes" />
                    <MobileLink to="/favoris" label="Favoris" />
                    <MobileLink to="/wallet" label="Portefeuille" />
                    <MobileLink to="/profil" label="Mon profil" />
                    <MobileLink to="/notifications" label="Notifications" />
                  </>
                )}
              </nav>
              <div className="mt-8 pt-6 border-t border-warm-100">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl">
                    <LogOut size={18} /> Déconnexion
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="btn-primary block text-center text-sm">Se connecter</Link>
                    <Link to="/register" className="btn-outline block text-center text-sm">Créer un compte</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="h-16" />

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} aria-current={active ? 'page' : undefined} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${active ? 'text-brand-500 bg-brand-50' : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'}`}>
      {children}
    </Link>
  )
}

function DropdownLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors">
      {icon} {label}
    </Link>
  )
}

function MobileLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation()
  const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
  return (
    <Link to={to} aria-current={active ? 'page' : undefined} className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'text-brand-500 bg-brand-50' : 'text-warm-700 hover:bg-warm-50'}`}>
      {label}
    </Link>
  )
}
