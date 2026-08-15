/**
 * Garde-fou de contrat inter-dépôts : chaque lien que le backend envoie par email
 * DOIT correspondre à une route déclarée dans App.tsx.
 *
 * Origine : le lien de vérification `/verify-email?token=…` (EmailService.java)
 * n'avait aucune route. nginx sert bien index.html (fallback SPA), mais le routeur
 * tombait sur le catch-all `*` — les utilisateurs voyaient « Page introuvable » et
 * leur compte restait non vérifié, donc la connexion mobile renvoyait 403.
 *
 * Ce test ne demande pas de backend : il lit la table de routes à la source.
 * Toute nouvelle URL ajoutée à EmailService côté backend doit être ajoutée ici.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

/** Chemins construits par EmailService.java (`${app.frontend.url}` + ce chemin). */
const CHEMINS_ENVOYES_PAR_EMAIL = [
  '/verify-email',          // envoyerVerificationEmail
  '/reset-password',        // envoyerReinitialisationMotDePasse
  '/definir-mot-de-passe',  // envoyerInvitationRestaurateur
]

const source = readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf-8')

/** Chemins déclarés par <Route path="…" />, catch-all exclu. */
function routesDeclarees(): string[] {
  return [...source.matchAll(/<Route\s+path=["']([^"']+)["']/g)]
    .map(m => m[1])
    .filter(p => p !== '*')
}

describe('📧 Liens email → routes SPA', () => {
  it('chaque lien envoyé par email a une route (sinon : « Page introuvable »)', () => {
    const routes = routesDeclarees()
    const manquants = CHEMINS_ENVOYES_PAR_EMAIL.filter(c => !routes.includes(c))

    expect(
      manquants,
      `Ces chemins arrivent dans la boîte mail des utilisateurs mais ne sont routés nulle part : ${manquants.join(', ')}`,
    ).toEqual([])
  })

  it('la table de routes est bien lue (test non vacillant)', () => {
    // Sans ce garde-fou, une regex cassée renverrait [] et le test ci-dessus
    // passerait en ne vérifiant rien du tout.
    const routes = routesDeclarees()
    expect(routes.length).toBeGreaterThan(10)
    expect(routes).toContain('/login')
  })
})
