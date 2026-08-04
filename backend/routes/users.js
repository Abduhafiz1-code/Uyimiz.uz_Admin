import { Router } from 'express'
import db from '../db.js'
import { addAudit } from './audit.js'

const router = Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM users ORDER BY id DESC').all()
  res.json(rows)
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
  res.json(row)
})

router.post('/', (req, res) => {
  const { name, phone, type, typeKey, status, since } = req.body
  if (!name) return res.status(400).json({ error: 'Ism majburiy' })
  const info = db.prepare(
    `INSERT INTO users (name, phone, type, typeKey, status, since) VALUES (?,?,?,?,?,?)`
  ).run(name, phone || '', type || '', typeKey || '', status || 'Faol', since || 'Hozir')
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  addAudit("Foydalanuvchi qo'shildi", name)
  res.status(201).json(row)
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
  const merged = { ...existing, ...req.body }
  db.prepare(
    `UPDATE users SET name=?, phone=?, type=?, typeKey=?, status=?, since=? WHERE id=?`
  ).run(merged.name, merged.phone, merged.type, merged.typeKey, merged.status, merged.since, req.params.id)
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  res.json(row)
})

router.patch('/:id/toggle-block', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
  const newStatus = user.status === 'Faol' ? 'Bloklangan' : 'Faol'
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, req.params.id)
  addAudit(newStatus === 'Bloklangan' ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi faollashtirildi', user.name)
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  res.json(row)
})

router.delete('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  addAudit("Foydalanuvchi o'chirildi", user.name)
  res.json({ ok: true })
})

export default router
