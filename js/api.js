/* =============================================
   API.JS — Conexión con MiniNutri API
   Cambia API_URL según el entorno
   ============================================= */

// PRODUCCIÓN
const API_URL = 'https://mininutri-api.onrender.com'

// LOCAL (Live Server) — descomenta para desarrollo local
// const API_URL = 'http://localhost:4000'

async function handleApiResponse(res) {
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  return { ...(body || {}), ok: res.ok, status: res.status }
}

const API = {

  // ===== AUTH =====
  async login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return handleApiResponse(res)
  },

  async register(data) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleApiResponse(res)
  },

  // ===== MEASUREMENTS =====
  async getMeasurements(child_id) {
    const res = await fetch(`${API_URL}/api/measurements/${child_id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mn_token')}` }
    })
    return handleApiResponse(res)
  },

  async addMeasurement(child_id, weight, height) {
    const res = await fetch(`${API_URL}/api/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mn_token')}`
      },
      body: JSON.stringify({ child_id, weight, height })
    })
    return handleApiResponse(res)
  },

  // ===== DIETAS =====
  async getDieta(sexo, estado_nutricional, nivel_costo = 'bajo') {
    const res = await fetch(
      `${API_URL}/api/dietas?sexo=${sexo}&estado_nutricional=${estado_nutricional}&nivel_costo=${nivel_costo}`,
      { headers: { 'Authorization': `Bearer ${localStorage.getItem('mn_token')}` } }
    )
    return handleApiResponse(res)
  },

  // ===== ACTIVITIES =====
  async getActivities(child_id) {
    const res = await fetch(`${API_URL}/api/activities/${child_id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mn_token')}` }
    })
    return handleApiResponse(res)
  },

  async addActivity(child_id, activity_type, activity_id) {
    const res = await fetch(`${API_URL}/api/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mn_token')}`
      },
      body: JSON.stringify({ child_id, activity_type, activity_id: String(activity_id) })
    })
    return handleApiResponse(res)
  },

  // ===== SELECTIONS (alimentos elegidos por comida) =====
  async saveSelection(child_id, meal, item_type, item_selected, cantidad) {
    const res = await fetch(`${API_URL}/api/selections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mn_token')}`
      },
      body: JSON.stringify({ child_id, meal, item_type, item_selected, cantidad })
    })
    return handleApiResponse(res)
  },

  async getSelections(child_id) {
    const res = await fetch(`${API_URL}/api/selections/${child_id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mn_token')}` }
    })
    return handleApiResponse(res)
  },

  async getSelectionsHistory(child_id) {
    const res = await fetch(`${API_URL}/api/selections/${child_id}/history`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mn_token')}` }
    })
    return handleApiResponse(res)
  },

  async clearTodaySelections(child_id) {
    const res = await fetch(`${API_URL}/api/selections/${child_id}/today`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mn_token')}` }
    })
    return handleApiResponse(res)
  },

  // ===== CHILDREN =====
  async getChild() {
    const res = await fetch(`${API_URL}/api/children`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mn_token')}` }
    })
    return handleApiResponse(res)
  },

  async updateChild(id, data) {
    const res = await fetch(`${API_URL}/api/children/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mn_token')}`
      },
      body: JSON.stringify(data)
    })
    return handleApiResponse(res)
  }
}
