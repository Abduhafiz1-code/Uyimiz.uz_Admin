import { Router } from 'express'
import db from '../db.js'
import { addAudit } from './audit.js'
import { hashPassword } from '../auth.js'

const router = Router()

function sanitize(admin) {
  if (!admin) return admin
  const { password, ...rest } = admin
  return rest
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM admins ORDER BY id ASC').all()
  res.json(rows.map(sanitize))
})

router.post('/', (req, res) => {
  const { name, phone, role, status, username, password } = req.body
  if (!name) return res.status(400).json({ error: 'Ism majburiy' })
  if (!username || !String(username).trim()) return res.status(400).json({ error: 'Login (username) majburiy' })
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Parol kamida 6 belgidan iborat bo\'lishi kerak' })
  }

  const cleanUsername = String(username).trim().toLowerCase()
  const exists = db.prepare('SELECT id FROM admins WHERE username = ?').get(cleanUsername)
  if (exists) return res.status(400).json({ error: 'Bu login band, boshqasini tanlang' })

  const info = db.prepare(
    `INSERT INTO admins (name, phone, role, status, since, username, password) VALUES (?,?,?,?,?,?,?)`
  ).run(name, phone || '', role || 'Admin', status || 'Faol', 'Hozir', cleanUsername, hashPassword(password))
  addAudit('Admin qo\'shildi', name, req.admin?.name)
  res.status(201).json(sanitize(db.prepare('SELECT * FROM admins WHERE id = ?').get(info.lastInsertRowid)))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Admin topilmadi' })
  const merged = { ...existing, ...req.body }

  let username = existing.username
  if (req.body.username !== undefined) {
    const cleanUsername = String(req.body.username || '').trim().toLowerCase()
    if (!cleanUsername) return res.status(400).json({ error: "Login bo'sh bo'lishi mumkin emas" })
    const clash = db.prepare('SELECT id FROM admins WHERE username = ? AND id != ?').get(cleanUsername, req.params.id)
    if (clash) return res.status(400).json({ error: 'Bu login band, boshqasini tanlang' })
    username = cleanUsername
  }

  let passwordHash = existing.password
  if (req.body.password) {
    if (String(req.body.password).length < 6) {
      return res.status(400).json({ error: 'Parol kamida 6 belgidan iborat bo\'lishi kerak' })
    }
    passwordHash = hashPassword(req.body.password)
  }

  db.prepare(
    `UPDATE admins SET name=?, phone=?, role=?, status=?, username=?, password=? WHERE id=?`
  ).run(merged.name, merged.phone, merged.role, merged.status, username, passwordHash, req.params.id)
  addAudit('Admin ma\'lumotlari yangilandi', merged.name, req.admin?.name)
  res.json(sanitize(db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id)))
})

router.delete('/:id', (req, res) => {
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id)
  if (!admin) return res.status(404).json({ error: 'Admin topilmadi' })
  if (admin.role === 'Superadmin') return res.status(400).json({ error: "Superadminni o'chirib bo'lmaydi" })
  db.prepare('DELETE FROM admins WHERE id = ?').run(req.params.id)
  db.prepare('DELETE FROM sessions WHERE adminId = ?').run(req.params.id)
  addAudit("Admin o'chirildi", admin.name, req.admin?.name)
  res.json({ ok: true })
})

export default router
