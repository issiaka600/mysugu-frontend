/**
 * E2E — Restaurants & Categories & Plats (public endpoints)
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { api, describeError } from './setup'

let firstRestaurantId: number | null = null
let firstCategoryId:   number | null = null

describe('🍽️ Categories — /api/categories', () => {

  it('GET /api/categories — retourne un tableau de catégories', async () => {
    let res
    try {
      res = await api.get('/api/categories')
    } catch (err) {
      throw new Error(`Get categories failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)

    if (res.data.length > 0) {
      const cat = res.data[0]
      expect(cat).toHaveProperty('id')
      expect(cat).toHaveProperty('nom')
      firstCategoryId = cat.id
    }
  })

  it('GET /api/categories/:id — retourne une catégorie par ID', async () => {
    if (!firstCategoryId) return // skip if no categories
    let res
    try {
      res = await api.get(`/api/categories/${firstCategoryId}`)
    } catch (err) {
      throw new Error(`Get category by id failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data.id).toBe(firstCategoryId)
    expect(res.data).toHaveProperty('nom')
  })
})

describe('🏠 Restaurants — /api/restaurants', () => {

  it('GET /api/restaurants — retourne une page de restaurants', async () => {
    let res
    try {
      res = await api.get('/api/restaurants', { params: { page: 0, size: 10 } })
    } catch (err) {
      throw new Error(`Get restaurants failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)

    // Paginated response
    expect(res.data).toHaveProperty('content')
    expect(Array.isArray(res.data.content)).toBe(true)

    if (res.data.content.length > 0) {
      const rest = res.data.content[0]
      expect(rest).toHaveProperty('id')
      expect(rest).toHaveProperty('nom')
      expect(rest).toHaveProperty('appreciation')
      expect(rest).toHaveProperty('isActive')
      expect(typeof rest.tempsLivraisonMoyen).toBe('number')
      firstRestaurantId = rest.id
    }
  })

  it('GET /api/restaurants/:id — retourne un restaurant par ID', async () => {
    if (!firstRestaurantId) return
    let res
    try {
      res = await api.get(`/api/restaurants/${firstRestaurantId}`)
    } catch (err) {
      throw new Error(`Get restaurant by id failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data.id).toBe(firstRestaurantId)
    expect(res.data).toHaveProperty('nom')
    expect(res.data).toHaveProperty('localisation')
  })

  it('GET /api/restaurants/search?keyword=a — retourne des résultats de recherche', async () => {
    let res
    try {
      res = await api.get('/api/restaurants/search', { params: { keyword: 'a' } })
    } catch (err) {
      throw new Error(`Search restaurants failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
  })

  it('GET /api/restaurants/top-rated — retourne les restaurants les mieux notés', async () => {
    let res
    try {
      res = await api.get('/api/restaurants/top-rated', { params: { limit: 5 } })
    } catch (err) {
      throw new Error(`Top-rated restaurants failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
  })

  it('GET /api/restaurants?categorieId=N — filtre par catégorie', async () => {
    if (!firstCategoryId) return
    let res
    try {
      res = await api.get('/api/restaurants', { params: { categorieId: firstCategoryId, size: 5 } })
    } catch (err) {
      throw new Error(`Filter by category failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('content')
  })
})

describe('🥘 Plats — /api/plats', () => {

  it('GET /api/plats — retourne une page de plats', async () => {
    let res
    try {
      res = await api.get('/api/plats', { params: { page: 0, size: 10 } })
    } catch (err) {
      throw new Error(`Get plats failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('content')
    expect(Array.isArray(res.data.content)).toBe(true)

    if (res.data.content.length > 0) {
      const plat = res.data.content[0]
      expect(plat).toHaveProperty('id')
      expect(plat).toHaveProperty('nom')
      expect(plat).toHaveProperty('prix')
      expect(typeof plat.prix).toBe('number')
      expect(plat).toHaveProperty('categoriePlat')
      expect(plat).toHaveProperty('isAvailable')
    }
  })

  it('GET /api/plats/restaurant/:id — retourne les plats d\'un restaurant', async () => {
    if (!firstRestaurantId) return
    let res
    try {
      res = await api.get(`/api/plats/restaurant/${firstRestaurantId}`)
    } catch (err) {
      throw new Error(`Get plats by restaurant failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)

    if (res.data.length > 0) {
      res.data.forEach((p: { restaurantId: number }) => {
        expect(p.restaurantId).toBe(firstRestaurantId)
      })
    }
  })

  it('GET /api/plats/search?keyword=riz — retourne des résultats', async () => {
    let res
    try {
      res = await api.get('/api/plats/search', { params: { keyword: 'riz' } })
    } catch (err) {
      throw new Error(`Search plats failed: ${describeError(err)}`)
    }
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
  })
})
