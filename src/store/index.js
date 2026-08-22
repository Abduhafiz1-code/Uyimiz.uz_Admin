import { reactive } from 'vue'
import api, { authApi } from '../api'

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
  // Bildirishnomalar navbati. Ilgari bu oddiy satr edi va ketma-ket
  // amallar bir-birining xabarini o'chirib yuborardi.
  toasts: [],
  sidebarOpen: false,
  loading: true,
  error: null,
  theme: 'dark',

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

/* ---------- Mavzu (qorong'i / yorug') ----------
   Kalit Uyimiz Agent paneli bilan bir xil (`uyimiz_theme`) — ikkala panel
   bitta brauzerda ochilganda mavzu ham bir xil bo'ladi. Sukut bo'yicha
   qorong'i, chunki dizayn taxtasining asosiy varianti shunday. */
const THEME_KEY = 'uyimiz_theme'

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  const preferred =
    saved === 'dark' || saved === 'light'
      ? saved
      : window.matchMedia?.('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
  applyTheme(preferred)
}
export function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark')
}
function applyTheme(theme) {
  state.theme = theme
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
}

/* ---------- Bildirishnomalar ---------- */
let toastSeq = 0

export function dismissToast(id) {
  state.toasts = state.toasts.filter((t) => t.id !== id)
}

/**
 * Xabar ko'rsatadi.
 * @param {string} text
 * @param {'ok'|'err'|'info'} kind
 */
export function showToast(text, kind = 'ok', ms = 3200) {
  const id = ++toastSeq
  state.toasts.push({ id, kind, text })
  setTimeout(() => dismissToast(id), ms)
}

export const toastOk = (text) => showToast(text, 'ok')
export const toastErr = (text) => showToast(text, 'err')
export const toastInfo = (text) => showToast(text, 'info')

function fail(e, fallback) {
  const msg = e?.message || fallback
  state.error = msg
  showToast(msg, 'err')
}

/** DRF ViewSet'lari sahifalangan javob qaytaradi ({count, next, previous, results}),
 *  @api_view funksiyalari esa oddiy massiv. Ikkalasini ham bir xil ko'rinishga keltiramiz. */
function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.results)) return res.results
  return []
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

/* ---------- uyimiz-backend (Django) <-> admin panel maydon nomlari moslashtiruvchisi ----------
   Backend snake_case va ba'zan boshqacha nom ishlatadi; panel UI eski (mock) nomlarni kutadi.
   Barcha "tarjima" shu yerda — view fayllarga tegilmaydi. */

const USER_KIND_TO_TYPE_KEY = { owner: 'uy_egalari', buyer: 'xaridorlar', tenant: 'ijarachilar' }
const TYPE_LABEL_TO_USER_KIND = { 'Uy egasi': 'owner', Xaridor: 'buyer', Ijarachi: 'tenant' }
const DEAL_TO_LABEL = { sale: 'Sotish', rent: 'Ijara', daily: 'Kunlik ijara' }
const LISTING_STATUS_TO_LABEL = {
  pending: 'Kutilmoqda',
  active: 'Faol',
  rejected: 'Rad etilgan',
  dealt: 'Bitim tuzilgan',
  archived: 'Arxiv',
}

function formatPrice(value, currency) {
  const num = Number(value)
  if (Number.isNaN(num)) return value
  const suffix = String(currency || '').toLowerCase() === 'usd' ? '$' : "so'm"
  return `${num.toLocaleString('ru-RU')} ${suffix}`
}

function normalizeUser(u) {
  return {
    ...u,
    typeKey: u.role === 'agent' ? 'agentlar' : (USER_KIND_TO_TYPE_KEY[u.user_kind] || ''),
    since: formatDate(u.since),
  }
}

function normalizeAgent(a) {
  return {
    ...a,
    cert: a.certification,
    deals: a.total_deals,
    // DRF DecimalField'ni matn ko'rinishida qaytaradi — UI'da .toFixed() ishlashi uchun songa o'giramiz
    rating: Number(a.rating),
    commission: Number(a.commission_rate),
  }
}

function normalizeListing(p) {
  return {
    ...p,
    title: p.district ? `${p.district} — ${p.address}` : p.address,
    dealType: DEAL_TO_LABEL[p.deal] || 'Sotish',
    owner: p.owner_name,
    status: LISTING_STATUS_TO_LABEL[p.status] || p.status,
    price: formatPrice(p.price, p.currency),
    date: formatDate(p.created_at),
  }
}

function normalizeModerationItem(m) {
  return { ...m, title: m.listing_title }
}

function normalizeTariff(t) {
  return { ...t, price: t.price_label, desc: t.description }
}

function normalizeSettings(s) {
  return {
    aiThreshold: s.ai_threshold,
    commission: s.deal_commission_percent,
    contractPrice: s.contract_price,
    vipPrice: s.vip_price,
    premiumPostPrice: s.premium_post_price,
    agentCommission: s.agent_commission_percent,
    platformShare: s.platform_share_percent,
    agentSubscription: s.agent_subscription_price,
    stage: s.stage,
  }
}
const SETTINGS_FIELD_TO_BACKEND = {
  aiThreshold: 'ai_threshold',
  commission: 'deal_commission_percent',
  contractPrice: 'contract_price',
  vipPrice: 'vip_price',
  premiumPostPrice: 'premium_post_price',
  agentCommission: 'agent_commission_percent',
  platformShare: 'platform_share_percent',
  agentSubscription: 'agent_subscription_price',
  stage: 'stage',
}

function normalizeAdminAccount(a) {
  return {
    ...a,
    username: a.phone, // login telefon raqami orqali amalga oshadi, alohida username yo'q
    role: a.admin_title,
    status: a.is_active ? 'Faol' : 'Bloklangan',
    since: formatDate(a.date_joined),
  }
}

function normalizeAuditItem(a) {
  return { time: formatDate(a.created_at), admin: a.admin_name, action: a.action, object: a.object_label }
}

/* ---------- Auth ---------- */
export async function login(phone, password) {
  state.authLoading = true
  state.authError = null
  try {
    const res = await authApi.post('/login', { phone, password })
    if (!['admin', 'superadmin'].includes(res.role)) {
      state.authError = 'Bu login admin panel uchun emas'
      return false
    }
    state.token = res.token
    state.currentAdmin = { ...res.user, status: res.user.is_active ? 'Faol' : 'Bloklangan' }
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(state.currentAdmin))
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
    if (state.token) await authApi.post('/logout')
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
  const audit = await api.get('/audit')
  state.audit = asList(audit).map(normalizeAuditItem)
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
    state.users = asList(users).map(normalizeUser)
    state.admins = asList(admins).map(normalizeAdminAccount)
    state.agents = asList(agents).map(normalizeAgent)
    state.posts = asList(posts).map(normalizeListing)
    state.moderation = asList(moderation).map(normalizeModerationItem)
    state.tariffs = asList(tariffs).map(normalizeTariff)
    state.settings = normalizeSettings(settings)
    state.audit = asList(audit).map(normalizeAuditItem)
    state.dashboard = dashboard
  } catch (e) {
    fail(e, "Backendga ulanib bo'lmadi. uyimiz-backend ishga tushirilganini tekshiring (python manage.py runserver).")
  } finally {
    state.loading = false
  }
}

/* ---------- Users ---------- */
export async function toggleUserBlock(user) {
  try {
    const updated = await api.patch(`/users/${user.id}/toggle-block`)
    Object.assign(user, normalizeUser(updated))
    showToast(user.name + (user.status === 'Bloklangan' ? ' bloklandi' : ' faollashtirildi'))
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}

export async function updateUser(user, patch) {
  try {
    const payload = { name: patch.name, phone: patch.phone, is_active: patch.status === 'Faol' }
    if (TYPE_LABEL_TO_USER_KIND[patch.type]) payload.user_kind = TYPE_LABEL_TO_USER_KIND[patch.type]
    // Qisman yangilash — PUT butun obyektni talab qiladi.
    const updated = await api.patch(`/users/${user.id}`, payload)
    Object.assign(user, normalizeUser(updated))
    showToast(user.name + ' ma\'lumotlari yangilandi')
    await refreshAudit()
    return true
  } catch (e) { fail(e, 'Saqlab bo\'lmadi'); return false }
}

/* ---------- Agents ---------- */
export async function updateAgent(agent, patch) {
  try {
    const payload = { name: patch.name, commission_rate: patch.commission }
    // PATCH, PUT emas: backend serializerida `phone` majburiy maydon va PUT
    // to'liq obyektni talab qiladi — faqat ism/komissiyani yuborganda so'rov
    // "phone: bu maydon majburiy" xatosi bilan rad etilardi.
    const updated = await api.patch(`/agents/${agent.id}`, payload)
    Object.assign(agent, normalizeAgent(updated))
    showToast(agent.name + ' ma\'lumotlari yangilandi')
    await refreshAudit()
    return true
  } catch (e) { fail(e, 'Saqlab bo\'lmadi'); return false }
}
async function agentAction(agent, action, msgSuffix) {
  try {
    const updated = await api.patch(`/agents/${agent.id}/${action}`)
    Object.assign(agent, normalizeAgent(updated))
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
    Object.assign(post, normalizeListing(updated))
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
    // item.id — moderatsiya navbati yozuvi, item.listing — e'lonning o'zi
    const post = state.posts.find(p => p.id === item.listing)
    if (post) post.status = 'Faol'
    showToast('Tasdiqlandi')
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}
export async function rejectModeration(item) {
  try {
    await api.patch(`/moderation/${item.id}/reject`)
    state.moderation = state.moderation.filter(m => m !== item)
    const post = state.posts.find(p => p.id === item.listing)
    if (post) post.status = 'Rad etilgan'
    showToast('Rad etildi')
    await refreshAudit()
  } catch (e) { fail(e, 'Amalni bajarib bo\'lmadi') }
}

/* ---------- Admins ---------- */
export async function addAdmin(payload) {
  try {
    const body = { name: payload.name, phone: payload.phone, admin_title: payload.role, is_active: payload.status === 'Faol', password: payload.password }
    const created = await api.post('/admins', body)
    state.admins.push(normalizeAdminAccount(created))
    showToast(created.name + " admin sifatida qo'shildi")
    await refreshAudit()
    return true
  } catch (e) { fail(e, "Admin qo'shib bo'lmadi"); return false }
}
export async function updateAdmin(admin, patch) {
  try {
    const body = { name: patch.name, phone: patch.phone, admin_title: patch.role, is_active: patch.status === 'Faol' }
    if (patch.password) body.password = patch.password
    // Parol o'zgartirilmasa uni yubormaymiz — PUT bo'lsa serializer uni
    // majburiy deb hisoblab so'rovni rad etardi.
    const updated = await api.patch(`/admins/${admin.id}`, body)
    Object.assign(admin, normalizeAdminAccount(updated))
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
    const backendField = SETTINGS_FIELD_TO_BACKEND[field] || field
    const updated = await api.put('/settings', { [backendField]: state.settings[field] })
    Object.assign(state.settings, normalizeSettings(updated))
    showToast(label + ' saqlandi')
    await refreshAudit()
  } catch (e) { fail(e, 'Saqlab bo\'lmadi') }
}

/* ---------- Tariffs ---------- */
export async function saveTariff(tariff) {
  try {
    const updated = await api.put(`/tariffs/${tariff.id}`, { name: tariff.name, price_label: tariff.price, period: tariff.period, description: tariff.desc })
    Object.assign(tariff, normalizeTariff(updated))
    showToast(tariff.name + ' yangilandi')
    await refreshAudit()
  } catch (e) { fail(e, 'Saqlab bo\'lmadi') }
}

// Kept for backward-compatible local-only usage (e.g. quick UI feedback outside API actions)
export function pushAudit(action, object) {
  state.audit.unshift({ time: 'Hozir', admin: 'Superadmin', action, object })
}
