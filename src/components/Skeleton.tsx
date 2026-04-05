function Pulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-warm-100 ${className}`} />
}

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card">
      <Pulse className="aspect-[16/10] !rounded-none" />
      <div className="p-4 space-y-2">
        <Pulse className="h-5 w-3/4" />
        <Pulse className="h-4 w-1/2" />
        <div className="flex gap-3 pt-1">
          <Pulse className="h-4 w-20" />
          <Pulse className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export function DishCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <Pulse className="aspect-square !rounded-none" />
      <div className="p-3.5 space-y-2">
        <Pulse className="h-4 w-2/3" />
        <Pulse className="h-3 w-full" />
        <div className="flex justify-between">
          <Pulse className="h-5 w-16" />
          <Pulse className="h-8 w-8 !rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function DishHorizontalSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white border border-warm-100">
      <div className="flex-1 space-y-2">
        <Pulse className="h-5 w-2/3" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-1/3" />
      </div>
      <Pulse className="w-28 h-28 !rounded-2xl shrink-0" />
    </div>
  )
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <Pulse className="w-16 h-16 !rounded-2xl" />
      <Pulse className="h-3 w-14" />
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex justify-between">
        <Pulse className="h-5 w-32" />
        <Pulse className="h-6 w-24 !rounded-full" />
      </div>
      <Pulse className="h-4 w-48" />
      <div className="flex justify-between pt-2">
        <Pulse className="h-5 w-20" />
        <Pulse className="h-9 w-28 !rounded-xl" />
      </div>
    </div>
  )
}

export function PromotionSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card">
      <Pulse className="h-40 !rounded-none" />
      <div className="p-5 space-y-2">
        <Pulse className="h-5 w-2/3" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-1/3" />
      </div>
    </div>
  )
}
