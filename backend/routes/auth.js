import { Router } from 'express'
import db from '../db.js'
import { verifyPassword, generateToken } from '../auth.js'
import { requireAuth } from '../requireAuth.js'
import { addAudit } from './audit.js'

const router = Router()

function sanitize(admin) {
  if (!admin) return admin
  const { password, ...rest } = admin
  return rest
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: 'Login va parolni kiriting' })
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(String(username).trim().toLowerCase())
  if (!admin || !admin.password || !verifyPassword(password, admin.password)) {
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" })
  }
  if (admin.status === 'Bloklangan') {
    return res.status(403).json({ error: 'Bu admin hisobi bloklangan' })
  }

  const token = generateToken()
  db.prepare('INSERT INTO sessions (token, adminId) VALUES (?,?)').run(token, admin.id)
  addAudit('Tizimga kirdi', admin.name, admin.name)
  res.json({ token, admin: sanitize(admin) })
})

router.post('/logout', (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (token) {
    const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token)
    if (session) {
      const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(session.adminId)
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
      if (admin) addAudit('Tizimdan chiqdi', admin.name, admin.name)
    }
  }
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  res.json(sanitize(req.admin))
})

export default router
