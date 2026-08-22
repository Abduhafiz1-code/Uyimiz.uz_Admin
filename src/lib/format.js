/**
 * Formatlash yordamchilari — Uyimiz Agent panelidagi `lib/format.ts` bilan
 * bir xil xatti-harakat (bu yerda oddiy JS, u yerda TypeScript).
 */

/** Raqamni ajratadi: 18400000 -> "18 400 000". */
export function nf(value, digits = 0) {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('ru-RU', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** Katta summani qisqartiradi: 18400000 -> {value: "18,4", unit: "mln"}. */
export function compactSum(value) {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return { value: '0', unit: '' }
  if (n >= 1_000_000_000) return { value: (n / 1_000_000_000).toFixed(1).replace('.', ','), unit: 'mlrd' }
  if (n >= 1_000_000) return { value: (n / 1_000_000).toFixed(1).replace('.', ','), unit: 'mln' }
  if (n >= 1_000) return { value: (n / 1_000).toFixed(0), unit: 'ming' }
  return { value: String(Math.round(n)), unit: '' }
}

const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
]

export function monthLabel(d = new Date()) {
  const m = MONTHS[d.getMonth()]
  return m.charAt(0).toUpperCase() + m.slice(1) + ' ' + d.getFullYear()
}

export function dateLabel(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return `${d.getDate()}-${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "2 soat oldin", "kecha", "3 kun oldin" — audit jurnali uchun. */
export function timeAgo(iso) {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return String(iso)
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'hozir'
  if (mins < 60) return `${mins} daqiqa oldin`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.round(hours / 24)
  if (days === 1) return 'kecha'
  if (days < 30) return `${days} kun oldin`
  return `${Math.round(days / 30)} oy oldin`
}

/**
 * Holat nomini pill sinfiga bog'laydi.
 *
 * Uyimiz Agent panelidagi ro'yxatga admin paneldagi holatlar
 * (moderatsiya, sertifikat, e'lon bosqichi) qo'shilgan.
 */
export function statusPill(status) {
  switch (status) {
    case 'Faol':
    case 'Tasdiqlangan':
    case 'Yopilgan':
    case 'Bitim tuzilgan':
      return 'pill pill-ok'

    case 'VIP':
    case 'Premium':
    case 'Kutilmoqda':
      return 'pill pill-vip'

    case 'Bloklangan':
    case 'Rad etilgan':
    case 'Bekor qilindi':
    case 'Bekor qilingan':
      return 'pill pill-hot'

    default:
      return 'pill'
  }
}

/** Ism bosh harflari — avatar uchun. */
export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}
