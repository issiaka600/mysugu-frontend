/**
 * E2E — Commandes flow (requires auth + existing restaurant/plat)
 * Flow: register → login → get restaurants → get plats → create order → get order
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { api, setAuthToken, clearAuthToken, testEmail, describeError } from './setup'

const credentials = {
  email:     testEmail('order'),
  password:  'Test@1234!',
  nom:       'Koné',
  prenom:    'TestOrder',
  telephone: '+22376000002',
}

let authToken      = ''
let userId         = 0
let restaurantId   = 0
let platId         = 0
let commandeId     = 0
let numeroCommande = ''
// Delivery location — populated from active deployment zone
let deliveryCoords = { latitude: 31.6295, longitude: -7.9811, adresse: 'Marrakech', ville: 'Marrakech', pays: 'Maroc' }

describe('🛒 Commandes — flow complet', () => {

  // ── Prerequisite: auth ─────────────────────────────────────────────────────
  beforeAll(async () => {
    // Register
    try {
      await api.post('/auth/register', { ...credentials, role: 'CLIENT' })
    } catch {
      // User may already exist from a previous run
    }

    // Login
    const { data } = await api.post('/auth/login', {
      email:    credentials.email,
      password: credentials.password,
    })
    authToken = data.token
    userId    = data.user.id
    setAuthToken(authToken)

    // Fetch restaurants and find one that has plats
    const { data: page } = await api.get('/api/restaurants', { params: { size: 20 } })
    for (const rest of page.content) {
      try {
        const { data: plats } = await api.get(`/api/plats/restaurant/${rest.id}`)
        if (Array.isArray(plats) && plats.length > 0) {
          restaurantId = rest.id
          const available = plats.find((p: { isAvailable: boolean }) => p.isAvailable) ?? plats[0]
          if (available) platId = available.id
          break
        }
      } catch { /* try next */ }
    }

    // Fallback: try the paginated plats endpoint directly
    if (!platId) {
      const { data: platPage } = await api.get('/api/plats', { params: { size: 5, available: true } })
      if (platPage.content?.length > 0) {
        const p = platPage.content[0]
        platId       = p.id
        restaurantId = p.restaurantId
      }
    }

    // Fetch active deployment zone to get valid delivery coordinates
    try {
      const { data: zones } = await api.get('/api/zones-deploiement/actives')
      if (Array.isArray(zones) && zones.length > 0) {
        const zone = zones[0]
        // Use the zone's center coordinates
        deliveryCoords = {
          latitude:  zone.centreLatitude ?? zone.latitude ?? deliveryCoords.latitude,
          longitude: zone.centreLongitude ?? zone.longitude ?? deliveryCoords.longitude,
          adresse:   zone.nom ?? zone.ville ?? deliveryCoords.adresse,
          ville:     zone.ville ?? deliveryCoords.ville,
          pays:      zone.pays ?? deliveryCoords.pays,
        }
      }
    } catch {
      // Keep default Marrakech coords
    }
  })

  afterAll(() => clearAuthToken())

  // ── Tests ──────────────────────────────────────────────────────────────────

  it('Setup — restaurant et plat disponibles', () => {
    expect(restaurantId).toBeGreaterThan(0)
    expect(platId).toBeGreaterThan(0)
  })

  it('POST /api/commandes — crée une commande', async () => {
    if (!restaurantId || !platId) return

    const body = {
      clientId:     userId,
      restaurantId: restaurantId,
      lignes: [{ platId: platId, quantite: 2 }],
      adresseLivraison: {
        latitude:  deliveryCoords.latitude,
        longitude: deliveryCoords.longitude,
        adresse:   deliveryCoords.adresse,
        ville:     deliveryCoords.ville,
        pays:      deliveryCoords.pays,
      },
      commentaire:    'Test e2e — livraison rapide svp',
      methodePaiement: 'ESPECES',
      modeReception:  'LIVRAISON',
    }

    let res
    try {
      res = await api.post('/api/commandes', body)
    } catch (err) {
      throw new Error(`Create commande failed: ${describeError(err)}`)
    }

    expect(res.status).toBe(201)
    const cmd = res.data
    expect(cmd).toHaveProperty('id')
    expect(cmd).toHaveProperty('numeroCommande')
    expect(cmd.statut).toBe('EN_ATTENTE')
    expect(cmd.restaurant.id).toBe(restaurantId)
    expect(cmd.lignesCommande.length).toBe(1)
    expect(cmd.lignesCommande[0].quantite).toBe(2)
    expect(cmd.lignesCommande[0].plat.id).toBe(platId)
    expect(typeof cmd.montantFinal).toBe('number')
    expect(cmd.montantFinal).toBeGreaterThan(0)
    expect(cmd.methodePaiement).toBe('ESPECES')

    commandeId     = cmd.id
    numeroCommande = cmd.numeroCommande
  })

  it('GET /api/commandes/:id — récupère la commande par ID', async () => {
    if (!commandeId) return
    let res
    try {
      res = await api.get(`/api/commandes/${commandeId}`)
    } catch (err) {
      throw new Error(`Get commande by id failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data.id).toBe(commandeId)
    expect(res.data.numeroCommande).toBe(numeroCommande)
  })

  it('GET /api/commandes/numero/:num — récupère par numéro de commande', async () => {
    if (!numeroCommande) return
    let res
    try {
      res = await api.get(`/api/commandes/numero/${numeroCommande}`)
    } catch (err) {
      throw new Error(`Get by numero failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data.id).toBe(commandeId)
  })

  it('GET /api/commandes/client/:clientId — liste les commandes du client', async () => {
    if (!commandeId) {
      console.warn('Skipping: no order was created (setup prerequisites failed)')
      return
    }
    let res
    try {
      res = await api.get(`/api/commandes/client/${userId}`)
    } catch (err) {
      throw new Error(`Get client orders failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
    // The cancelled order should appear in history
    const found = res.data.find((c: { id: number }) => c.id === commandeId)
    expect(found).toBeTruthy()
  })

  it('DELETE /api/commandes/:id — annule la commande', async () => {
    if (!commandeId) return
    let res
    try {
      res = await api.delete(`/api/commandes/${commandeId}`)
    } catch (err) {
      throw new Error(`Cancel commande failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data.statut).toBe('ANNULEE')
  })
})

describe('🎟️ Codes promo — /api/codes-promo', () => {

  beforeAll(() => { if (authToken) setAuthToken(authToken) })

  it('POST /api/codes-promo/valider — rejette ou refuse un code inexistant', async () => {
    // Backend may require CLIENT role, return 403, 400, 404, or 200 with valid:false
    try {
      const res = await api.post('/api/codes-promo/valider', {
        code: 'CODE_INEXISTANT_12345',
        montantCommande: 5000,
      })
      // Some backends return 200 with valid: false
      if (res.status === 200) {
        expect(res.data.valid).toBe(false)
      }
    } catch (err) {
      // 400, 403, 404, 422 are all acceptable — any indicates code is rejected
      const status = (err as { response?: { status: number } }).response?.status
      expect([400, 403, 404, 422]).toContain(status)
    }
  })
})

describe('❤️ Favoris — /api/favoris', () => {

  beforeAll(() => { if (authToken) setAuthToken(authToken) })

  it('GET /api/favoris — retourne la liste vide initiale', async () => {
    let res
    try {
      res = await api.get('/api/favoris')
    } catch (err) {
      throw new Error(`Get favoris failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
  })

  it('POST /api/favoris/:id/toggle — ajoute un restaurant aux favoris', async () => {
    if (!restaurantId) return
    let res
    try {
      res = await api.post(`/api/favoris/${restaurantId}/toggle`)
    } catch (err) {
      throw new Error(`Toggle favori failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('isFavori')
    expect(res.data).toHaveProperty('action')
  })

  it('GET /api/favoris/:id/status — confirme le statut favori', async () => {
    if (!restaurantId) return
    const res = await api.get(`/api/favoris/${restaurantId}/status`)
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('isFavori')
  })

  it('POST /api/favoris/:id/toggle — retire le restaurant des favoris', async () => {
    if (!restaurantId) return
    const res = await api.post(`/api/favoris/${restaurantId}/toggle`)
    expect(res.status).toBe(200)
    expect(res.data.isFavori).toBe(false)
  })
})
