import {
  Flame, Tag, Zap, MapPin, Star, Clock, Apple, Carrot, Wheat, Milk, Sparkles, Filter,
  Droplet, Heart, Flower2, Sparkle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Flame, Tag, Zap, MapPin, Star, Clock, Apple, Carrot, Wheat, Milk, Sparkles, Filter,
  Droplet, Heart, Flower2, Sparkle,
}

/** Retourne le composant d'icône Lucide pour une clé donnée, ou une icône par défaut. */
export function iconForKey(key?: string): LucideIcon {
  return (key && ICONS[key]) || Filter
}
