import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[50vh] py-16">
      <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mb-5">
        <Icon size={32} className="text-warm-500" />
      </div>
      <h3 className="font-display font-bold text-xl text-warm-900 mb-2">{title}</h3>
      {description && <p className="text-warm-500 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
