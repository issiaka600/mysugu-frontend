import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string ?? ''

import Navbar      from '@/components/Navbar'
import Footer      from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import Logo        from '@/components/Logo'

import HomePage             from '@/pages/HomePage'
import RestaurantsPage      from '@/pages/RestaurantsPage'
import RestaurantDetailPage from '@/pages/RestaurantDetailPage'
import AlimentairesPage     from '@/pages/AlimentairesPage'
import CosmetiquesPage      from '@/pages/CosmetiquesPage'
import CheckoutPage         from '@/pages/CheckoutPage'
import LoginPage            from '@/pages/LoginPage'
import RegisterPage         from '@/pages/RegisterPage'
import OrdersPage           from '@/pages/OrdersPage'
import OrderTrackingPage    from '@/pages/OrderTrackingPage'
import ProfilePage          from '@/pages/ProfilePage'
import FavoritesPage        from '@/pages/FavoritesPage'
import PromotionsPage       from '@/pages/PromotionsPage'
import NotificationsPage    from '@/pages/NotificationsPage'
import WalletPage           from '@/pages/WalletPage'
import ForgotPasswordPage       from '@/pages/ForgotPasswordPage'
import DefinirMotDePassePage    from '@/pages/DefinirMotDePassePage'
import VerifyEmailPage          from '@/pages/VerifyEmailPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const AUTH_PATHS = ['/login', '/register', '/mot-de-passe-oublie', '/definir-mot-de-passe', '/verify-email']

function Layout() {
  const { pathname } = useLocation()
  const isAuth = AUTH_PATHS.some(p => pathname.startsWith(p))

  return (
    <>
      <a href="#main" className="skip-link">Aller au contenu</a>
      <ScrollToTop />
      {!isAuth && <Navbar />}
      <CartSidebar />

      <main id="main">
      <Routes>
        <Route path="/"                    element={<HomePage />} />
        <Route path="/restaurants"         element={<RestaurantsPage />} />
        <Route path="/restaurants/:id"     element={<RestaurantDetailPage />} />
        <Route path="/alimentaires"        element={<AlimentairesPage />} />
        <Route path="/cosmetiques"         element={<CosmetiquesPage />} />
        <Route path="/checkout"            element={<CheckoutPage />} />
        <Route path="/mes-commandes"       element={<OrdersPage />} />
        <Route path="/commandes/:id"       element={<OrderTrackingPage />} />
        <Route path="/profil"              element={<ProfilePage />} />
        <Route path="/favoris"             element={<FavoritesPage />} />
        <Route path="/promotions"          element={<PromotionsPage />} />
        <Route path="/notifications"       element={<NotificationsPage />} />
        <Route path="/wallet"              element={<WalletPage />} />
        <Route path="/login"               element={<LoginPage />} />
        <Route path="/register"            element={<RegisterPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="/definir-mot-de-passe" element={<DefinirMotDePassePage />} />
        <Route path="/verify-email"        element={<VerifyEmailPage />} />
        <Route path="*" element={
          <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
            <div className="text-center px-6">
              <div className="w-24 h-24 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-5">
                <Logo variant="mark" markClassName="w-12 h-12 text-warm-300" />
              </div>
              <h1 className="font-display font-extrabold text-4xl text-warm-900 mb-3">Page introuvable</h1>
              <p className="text-warm-500 mb-8 max-w-sm mx-auto">Cette page n'existe pas ou a été déplacée.</p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        } />
      </Routes>
      </main>

      {!isAuth && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Layout />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1C1208',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '16px',
            border: '1px solid #EAE0C8',
            boxShadow: '0 4px 24px rgba(60,30,10,0.12)',
            padding: '12px 16px',
          },
        }}
      />
    </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
