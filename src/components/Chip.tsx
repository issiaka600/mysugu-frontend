import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ChipProps = {
  active?: boolean
  icon?: LucideIcon
  onClick?: () => void
  children: ReactNode
}

export default function Chip({ active = false, icon: Icon, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        ${active ? 'bg-brand-500 text-white shadow-brand-sm' : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-50'}`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  )
}
