// Yagona backend (uyimiz-backend, Django) bilan ishlash uchun API qatlami.
// Admin panel endpointlari /api/admin/... ostida, login esa umumiy /api/auth/... da joylashgan
// (bitta login barcha rollar — user/agent/admin — uchun, DRF standart "Token <key>" sxemasi).
// Backend manzili.
//   • dev            → bo'sh: vite proxy 127.0.0.1:8000 ga uzatadi
//   • production     → Render'dagi backend
// VITE_API_BASE berilsa, u ustun turadi.
const PROD_API_BASE = 'https://uyimiz-backend.onrender.com'

const ROOT = (() => {
  const fromEnv = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  return import.meta.env.PROD ? PROD_API_BASE : ''
})()

const ADMIN_BASE = import.meta.env.VITE_API_URL || `${ROOT}/api/admin`
const AUTH_BASE = import.meta.env.VITE_AUTH_API_URL || `${ROOT}/api/auth`

// Rasm va PDF havolalari backend'dan nisbiy kelsa (/media/...), ularni
// to'liq manzilga aylantirish uchun.
export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${ROOT}${path.startsWith('/') ? '' : '/'}${path}`
}
const TOKEN_KEY = 'uyimiz_admin_token'
const ADMIN_KEY = 'uyimiz_admin_user'

function withSlash(path) {
  // DRF router bilan ro'yxatga olingan yo'llar oxirida "/" talab qiladi,
  // aks holda APPEND_SLASH qayta yo'naltirishi POST/PATCH/DELETE so'rovlarni buzadi.
  const [clean, query] = path.split('?')
  const withEndSlash = clean.endsWith('/') ? clean : `${clean}/`
  return query ? `${withEndSlash}?${query}` : withEndSlash
}

function extractErrorMessage(data, fallback) {
  if (!data) return fallback
  if (typeof data.detail === 'string') return data.detail
  if (typeof data.error === 'string') return data.error
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const val = data[firstKey]
    const msg = Array.isArray(val) ? val[0] : val
    if (typeof msg === 'string') return msg
  }
  return fallback
}

async function request(base, path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Token ${token}`

  const url = `${base}${withSlash(path)}`
  const res = await fetch(url, { ...options, headers })

  if (res.status === 401 && !path.startsWith('/login')) {
    // Sessiya tugagan yoki noto'g'ri — lokal tokenni tozalab, login sahifasiga qaytaramiz
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
    if (!window.location.hash.startsWith('#/login')) {
      window.location.hash = '#/login'
    }
  }

  if (!res.ok) {
    let msg = `So'rov xatosi: ${res.status}`
    try {
      const data = await res.json()
      msg = extractErrorMessage(data, msg)
    } catch {}
    throw new Error(msg)
  }
  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  get: (path) => request(ADMIN_BASE, path),
  post: (path, body) => request(ADMIN_BASE, path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(ADMIN_BASE, path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(ADMIN_BASE, path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(ADMIN_BASE, path, { method: 'DELETE' }),
}

// Login/logout — umumiy /api/auth/... manzili, /api/admin/... emas.
export const authApi = {
  post: (path, body) => request(AUTH_BASE, path, { method: 'POST', body: JSON.stringify(body) }),
  get: (path) => request(AUTH_BASE, path),
}

export default api
