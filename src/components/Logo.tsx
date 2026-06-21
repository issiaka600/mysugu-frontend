type LogoProps = {
  variant?: 'mark' | 'full'
  onDark?: boolean
  className?: string
  markClassName?: string
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path
        d="M50 6 C55 31 69 45 94 50 C69 55 55 69 50 94 C45 69 31 55 6 50 C31 45 45 31 50 6 Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Logo({ variant = 'full', onDark = false, className = '', markClassName = '' }: LogoProps) {
  if (variant === 'mark') {
    return <Mark className={`text-brand-500 ${markClassName || 'w-8 h-8'}`} />
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className={`text-brand-500 ${markClassName || 'w-7 h-7'}`} />
      <span className="font-display font-extrabold text-xl tracking-tight">
        <span className={onDark ? 'text-white' : 'text-warm-900'}>My</span>
        <span className="text-brand-500">Suku</span>
      </span>
    </span>
  )
}
