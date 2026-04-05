import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, CreditCard } from 'lucide-react'
import { walletApi, extractErrorMessage } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiWallet, ApiTransactionWallet, TypeTransaction } from '@/types/api'
import { formatPrice } from '@/utils/format'
import toast from 'react-hot-toast'

const TX_CONFIG: Record<TypeTransaction, { icon: React.ReactNode; color: string; label: string }> = {
  CREDIT:        { icon: <ArrowDownLeft size={16} />, color: 'text-emerald-500 bg-emerald-50', label: 'Credit' },
  DEBIT:         { icon: <ArrowUpRight size={16} />, color: 'text-red-500 bg-red-50', label: 'Debit' },
  REMBOURSEMENT: { icon: <RefreshCw size={14} />,   color: 'text-blue-500 bg-blue-50', label: 'Remboursement' },
  RECHARGE:      { icon: <CreditCard size={14} />,  color: 'text-amber-500 bg-amber-50', label: 'Recharge' },
}

export default function WalletPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [wallet, setWallet] = useState<ApiWallet | null>(null)
  const [transactions, setTransactions] = useState<ApiTransactionWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [recharging, setRecharging] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?redirect=/wallet'); return }
    loadData()
  }, [isAuthenticated, navigate])

  const loadData = async () => {
    try {
      const [wRes, tRes] = await Promise.allSettled([
        walletApi.get(),
        walletApi.getTransactions(0, 30),
      ])
      if (wRes.status === 'fulfilled') setWallet(wRes.value.data)
      if (tRes.status === 'fulfilled') setTransactions(tRes.value.data.content)
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount)
    if (!amount || amount <= 0) { toast.error('Montant invalide'); return }
    setRecharging(true)
    try {
      const res = await walletApi.recharge(amount, 'CARTE_BANCAIRE')
      setWallet(res.data)
      toast.success(`${formatPrice(amount)} ajoute au portefeuille`)
      setRechargeAmount('')
      loadData()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
    setRecharging(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="section-title mb-8">Mon portefeuille</h1>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-warm-900 to-warm-800 rounded-3xl p-6 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <Wallet size={18} />
              <span className="text-sm">Solde disponible</span>
            </div>
            <p className="font-display font-extrabold text-4xl mb-6">
              {wallet ? formatPrice(wallet.solde) : '0 DH'}
            </p>

            {/* Quick recharge */}
            <div className="flex gap-2">
              <input
                type="number"
                value={rechargeAmount}
                onChange={e => setRechargeAmount(e.target.value)}
                placeholder="Montant"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-white/40 text-sm"
              />
              <button
                onClick={handleRecharge}
                disabled={recharging}
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {recharging ? '...' : 'Recharger'}
              </button>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-3">
              {[50, 100, 200, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => setRechargeAmount(String(amt))}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/80 transition-colors"
                >
                  {amt} DH
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Historique</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-warm-400 text-sm">Aucune transaction pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => {
              const config = TX_CONFIG[tx.type] || TX_CONFIG.CREDIT
              const isPositive = tx.type === 'CREDIT' || tx.type === 'RECHARGE' || tx.type === 'REMBOURSEMENT'
              return (
                <div key={tx.id} className="bg-white rounded-2xl p-4 border border-warm-100 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900">{tx.description || config.label}</p>
                    <p className="text-xs text-warm-400">{new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : '-'}{formatPrice(Math.abs(tx.montant))}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
