# MySuku — Design system (frontend client)

> Source de vérité des tokens et conventions UI. Les valeurs vivent dans `tailwind.config.js` (usage) et sont reflétées en variables CSS dans `src/index.css` (`:root`).

## Couleur

| Token | Hex | Rôle | Contraste sur `warm-50` (#FFFBF5) |
|------|-----|------|------------------------------------|
| `brand-500` | `#E0231A` | Action primaire, marque | texte blanc dessus = AA |
| `brand-400` | `#F2503D` | Accent hero (corail, documenté) | — |
| `brand-600` | `#C21E12` | Hover/pressed primaire | — |
| `saffron-500` | `#F2A900` | Accent secondaire (notes, promos, étoiles) | — |
| `warm-50` | `#FFFBF5` | Fond application | — |
| `warm-100` | `#FFF5E8` | Surface douce / pastilles | — |
| `warm-500` | `#8A7148` | Texte secondaire | ~4.6:1 (AA) |
| `warm-900` | `#3A2C14` | Texte principal | AAA |
| `espresso-900` | `#2B1E12` | Footer / surface sombre | — |
| `success` / `warning` / `error` / `info` | `#1E9E5A` / `#E08A00` / `#DC2626` / `#1F6FE0` | États sémantiques | texte blanc dessus = AA |

**Principes**
- **Un seul rouge primaire** (`brand-500`), décliné en échelle 50→900. Le corail du hero est `brand-400` (documenté, plus de « 2ᵉ rouge » sauvage).
- **`saffron`** apporte la variété (notes, promos) — **jamais** comme action primaire.
- **Sémantique** réservée aux retours d'état (succès/alerte/erreur/info).
- `warm` = rampe neutre « sable » ; `espresso` = surface sombre (footer).

## Typographie
- **Display : Syne** (700/800) — titres, wordmark du logo.
- **Body : Plus Jakarta Sans** — corps de texte, UI.

## Composants
- **Boutons** : `.btn-primary` (gradient brand), `.btn-outline`, `.btn-ghost`, `.btn-saffron`. Tous avec anneau `:focus-visible`.
- **`<Chip>`** : pilule de filtre unique — actif `brand-500`, inactif bordé ; cible tactile ≥ 44px.
- **`<EmptyState>`** : pastille ronde `warm-100` + icône `warm-500` + titre + description (+ action), centré verticalement (`min-h-[50vh]`).
- **`<Logo>`** : signe « Étincelle » (mark mono-path, recolorable via `currentColor`) ; variantes `mark` / `full` / `onDark`.
- **Badges** : `.badge-brand` / `-success` / `-warning` / `-error` / `-info` / `-saffron`.

## Accessibilité
- Focus visible tokenisé (`--brand-500`) sur tous les interactifs.
- Cibles tactiles ≥ 44×44 (mobile).
- ARIA sur boutons icône-only, nav (`aria-current`), modale (`aria-modal` + piège de focus + `Esc`).
- Skip link « Aller au contenu » (`#main`). `prefers-reduced-motion` respecté.

## Identité de marque
- **Signe** : étincelle 4 branches (`public/logo.svg`), tuile app rouge `#E0231A` à étincelle blanche.
- **Favicon / PWA** : `favicon.svg`, `manifest.webmanifest` (`theme_color #E0231A`, `background_color #FFFBF5`), `apple-touch-icon.png`, icônes 192/512 maskable.
