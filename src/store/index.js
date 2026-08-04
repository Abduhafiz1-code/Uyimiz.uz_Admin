import { reactive } from 'vue'
import api from '../api'

const TOKEN_KEY = 'uyimiz_admin_token'
const ADMIN_KEY = 'uyimiz_admin_user'

function readStoredAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const state = reactive({
  toast: null,
  sidebarOpen: false,
  loading: true,
  error: null,
  theme: 'light',

  token: localStorage.getItem(TOKEN_KEY) || null,
  currentAdmin: readStoredAdmin(),
  authLoading: false,
  authError: null,

  users: [],
  admins: [],
  agents: [],
  posts: [],
  moderation: [],
  tariffs: [],
  settings: {
    aiThreshold: 0, commission: 0, contractPrice: 0, vipPrice: 0,
    agentCommission: 0, platformShare: 0, agentSubscription: 0, premiumPostPrice: 0, stage: 1,
  },
  audit: [],
  dashboard: { usersTotal: 0, activeAgents: 0, postsToday: 0, moderationCount: 0, postsTotal: 0, dealsTotal: 0, stage: 1 },
})

/* ---------- Theme (tungi rejim) ---------- */
export function initTheme() {
  const saved = localStorage.getItem('theme')
  const preferred = saved || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  applyTheme(preferred)
}
export function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark')
}
function applyTheme(theme) {
  state.theme = theme
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

let toastTimer = null
export function showToast(msg) {
  state.toast = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { state.toast = null }, 2400)
}

function fail(e, fallback) {
  const msg = e?.message || fallback
  state.error = msg
  showToast(msg)
}

/* ---------- Auth ---------- */
export async function login(username, password) {
  state.authLoading = true
  state.authError = null
  try {
    const res = await api.post('/auth/login', { username, password })
    state.token = res.token
    state.currentAdmin = res.admin
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin))
    return true
  } catch (e) {
    state.authError = e?.message || "Login yoki parol noto'g'ri"
    return false
  } finally {
    state.authLoading = false
  }
}

export async function logout() {
  try {
    if (state.token) await api.post('/auth/logout')
  } catch {
    // tarmoq xatosi bo'lsa ham lokal sessiyani tozalaymiz
  }
  state.token = null
  state.currentAdmin = null
  state.users = []
  state.admins = []
  state.agents = []
  state.posts = []
  state.moderation = []
  state.tariffs = []
  state.audit = []
  state.loading = true
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}

export async function refreshAudit() {
  state.audit = await api.get('/audit')
}

export async function loadAll() {
  if (!state.token) return
  state.loading = true
  state.error = null
  try {
    const [users, admins, agents, posts, moderation, tariffs, settings, audit, dashboard] = await Promise.all([
      api.get('/users'),
      api.get('/admins'),
      api.get('/agents'),
      api.get('/posts'),
      api.get('/moderation'),
      api.get('/tariffs'),
      api.get('/settings'),
      api.get('/audit'),
      api.get('/dashboard'),
    ])
    state.users = users
    state.admins = admins
    state.agents = agents
    state.posts = posts
    state.moderation = moderation
    state.tariffs = tariffs
    state.settings = settings
    state.audit = audit
    state.dashboard = dashboard
  } catch (e) {
    fail(e, "Backendga ulanib bo'lmadi. Server ishga tushirilganini tekshiring (npm run dev — backend papkasida).")
  } finally {
    state.loading = false
  }
}

/* ---------- Users ---------- */
export async function toggleUserBlock(user) {
  try {
    const updated = await api.patch(`/users/${user.id}/toggle-block`)
    Object.assign(user, updated)
    showToast(user.name + (user.status === 'Bloklangan' ? ' bloklandi' : ' faollashtirildi'))
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}

export async function updateUser(user, patch) {
  try {
    const updated = await api.put(`/users/${user.id}`, patch)
    Object.assign(user, updated)
    showToast(user.name + ' ma\'lumotlari yangilandi')
    await refreshAudit()
    return true
  } catch (e) { fail(e, 'Saqlab bo\'lmadi'); return false }
}

/* ---------- Agents ---------- */
export async function updateAgent(agent, patch) {
  try {
    const updated = await api.put(`/agents/${agent.id}`, patch)
    Object.assign(agent, updated)
    showToast(agent.name + ' ma\'lumotlari yangilandi')
    await refreshAudit()
    return true
  } catch (e) { fail(e, 'Saqlab bo\'lmadi'); return false }
}
async function agentAction(agent, action, msgSuffix) {
  try {
    const updated = await api.patch(`/agents/${agent.id}/${action}`)
    Object.assign(agent, updated)
    showToast(agent.name + msgSuffix)
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}
export const approveAgent = (a) => agentAction(a, 'approve', ' sertifikatlandi')
export const rejectAgent = (a) => agentAction(a, 'reject', ' rad etildi')
export const revokeAgent = (a) => agentAction(a, 'revoke', ' sertifikati bekor qilindi')

/* ---------- Posts ---------- */
export async function approvePost(post) {
  try {
    const updated = await api.patch(`/posts/${post.id}/approve`)
    Object.assign(post, updated)
    showToast("E'lon tasdiqlandi")
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}
export async function removePost(post) {
  try {
    await api.delete(`/posts/${post.id}`)
    state.posts = state.posts.filter(p => p !== post)
    showToast("E'lon o'chirildi")
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}

/* ---------- Moderation ---------- */
export async function approveModeration(item) {
  try {
    await api.patch(`/moderation/${item.id}/approve`)
    state.moderation = state.moderation.filter(m => m !== item)
    const post = state.posts.find(p => p.id === item.id)
    if (post) post.status = 'Faol'
    showToast('Tasdiqlandi')
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}
export async function rejectModeration(item) {
  try {
    await api.patch(`/moderation/${item.id}/reject`)
    state.moderation = state.moderation.filter(m => m !== item)
    const post = state.posts.find(p => p.id === item.id)
    if (post) post.status = 'Rad etilgan'
    showToast('Rad etildi')
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}

/* ---------- Admins ---------- */
export async function addAdmin(payload) {
  try {
    const created = await api.post('/admins', payload)
    state.admins.push(created)
    showToast(created.name + " admin sifatida qo'shildi")
    await refreshAudit()
    return true
  } catch (e) { fail(e, "Admin qo'shib bo'lmadi"); return false }
}
export async function updateAdmin(admin, patch) {
  try {
    const updated = await api.put(`/admins/${admin.id}`, patch)
    Object.assign(admin, updated)
    showToast(admin.name + ' ma\'lumotlari yangilandi')
    await refreshAudit()
    return true
  } catch (e) { fail(e, 'Saqlab bo\'lmadi'); return false }
}
export async function removeAdmin(admin) {
  try {
    await api.delete(`/admins/${admin.id}`)
    state.admins = state.admins.filter(a => a !== admin)
    showToast(admin.name + " o'chirildi")
    await refreshAudit()
  } catch (e) { fail(e, "O'chirib bo'lmadi") }
}

/* ---------- Settings ---------- */
export async function saveSetting(field, label) {
  try {
    const updated = await api.put('/settings', { [field]: state.settings[field] })
    Object.assign(state.settings, updated)
    showToast(label + ' saqlandi')
    await refreshAudit()
  } catch (e) { fail(e, 'Saqlab bo\'lmadi') }
}

/* ---------- Tariffs ---------- */
export async function saveTariff(tariff) {
  try {
    const updated = await api.put(`/tariffs/${tariff.id}`, tariff)
    Object.assign(tariff, updated)
    showToast(tariff.name + ' yangilandi')
    await refreshAudit()
  } catch (e) { fail(e, 'Saqlab bo\'lmadi') }
}

// Kept for backward-compatible local-only usage (e.g. quick UI feedback outside API actions)
export function pushAudit(action, object) {
  state.audit.unshift({ time: 'Hozir', admin: 'Superadmin', action, object })
}
