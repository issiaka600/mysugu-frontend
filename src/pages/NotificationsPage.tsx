import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Bell, CheckCheck, Clock, ChefHat, Truck, Package,
  CheckCircle2, XCircle, Tag, Info, User as UserIcon,
} from 'lucide-react'
import { notificationsApi, mapNotification, extractErrorMessage } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { Notification } from '@/types'
import toast from 'react-hot-toast'

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  COMMANDE_CONFIRMEE:      { icon: <CheckCircle2 size={18} />, color: 'bg-blue-50 text-blue-500' },
  COMMANDE_EN_PREPARATION: { icon: <ChefHat size={18} />,      color: 'bg-orange-50 text-orange-500' },
  COMMANDE_PRETE:          { icon: <Package size={18} />,       color: 'bg-purple-50 text-purple-500' },
  COMMANDE_EN_COURS:       { icon: <Truck size={18} />,         color: 'bg-brand-50 text-brand-500' },
  COMMANDE_LIVREE:         { icon: <CheckCircle2 size={18} />, color: 'bg-emerald-50 text-emerald-500' },
  COMMANDE_ANNULEE:        { icon: <XCircle size={18} />,       color: 'bg-red-50 text-red-500' },
  LIVREUR_ASSIGNE:         { icon: <UserIcon size={18} />,      color: 'bg-indigo-50 text-indigo-500' },
  PROMOTION:               { icon: <Tag size={18} />,           color: 'bg-amber-50 text-amber-500' },
  SYSTEME:                 { icon: <Info size={18} />,          color: 'bg-warm-100 text-warm-500' },
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?redirect=/notifications'); return }
    loadNotifications()
  }, [isAuthenticated, navigate])

  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.getAll(0, 50)
      setNotifications(res.data.content.map(mapNotification))
    } catch { /* ignore */ }
    setLoading(false)
  }

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { /* ignore */ }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('Toutes les notifications marquees comme lues')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotifLink = (n: Notification): string | null => {
    if (n.entityId && n.type.startsWith('COMMANDE_')) return `/commandes/${n.entityId}`
    if (n.type === 'PROMOTION') return '/promotions'
    return null
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'A l\'instant'
    if (mins < 60) return `il y a ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `il y a ${hours}h`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Notifications</h1>
            <p className="section-subtitle">{unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1.5 text-sm text-brand-500 font-semibold hover:text-brand-600">
              <CheckCheck size={16} /> Tout marquer lu
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warm-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-warm-100 rounded w-3/4" />
                    <div className="h-3 bg-warm-100 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-warm-300" />
            </div>
            <h3 className="font-display font-bold text-xl text-warm-900 mb-2">Aucune notification</h3>
            <p className="text-sm text-warm-400">Vous serez notifie des mises a jour de vos commandes.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEME
              const link = getNotifLink(n)
              const content = (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${n.read ? 'text-warm-700' : 'text-warm-900 font-semibold'}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-warm-400 line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-xs text-warm-300 mt-1">{formatTime(n.createdAt)}</p>
                  </div>
                </>
              )
              const cls = `flex gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
                n.read ? 'bg-white border-warm-100' : 'bg-brand-50/30 border-brand-100'
              } hover:bg-warm-50`

              return link ? (
                <Link key={n.id} to={link} onClick={() => !n.read && markAsRead(n.id)} className={cls}>
                  {content}
                </Link>
              ) : (
                <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} className={cls}>
                  {content}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
