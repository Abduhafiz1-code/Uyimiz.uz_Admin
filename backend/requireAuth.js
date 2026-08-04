import db from './db.js'

// Har bir himoyalangan so'rovda Authorization: Bearer <token> sarlavhasini tekshiradi.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (!token) return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring." })

  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token)
  if (!session) return res.status(401).json({ error: 'Sessiya muddati tugagan. Qayta kiring.' })

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(session.adminId)
  if (!admin) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    return res.status(401).json({ error: 'Admin topilmadi. Qayta kiring.' })
  }
  if (admin.status === 'Bloklangan') return res.status(403).json({ error: 'Bu admin hisobi bloklangan.' })

  req.admin = admin
  req.token = token
  next()
}
