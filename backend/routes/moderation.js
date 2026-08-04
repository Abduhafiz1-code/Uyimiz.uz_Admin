import { Router } from 'express'
import db from '../db.js'
import { addAudit } from './audit.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM moderation ORDER BY id DESC').all())
})

router.post('/', (req, res) => {
  const { id, title, reason, score } = req.body
  if (!title) return res.status(400).json({ error: 'Sarlavha majburiy' })
  const newId = id || (Date.now() % 100000)
  db.prepare(
    `INSERT INTO moderation (id, title, reason, score) VALUES (?,?,?,?)`
  ).run(newId, title, reason || '', score ?? 50)
  res.status(201).json(db.prepare('SELECT * FROM moderation WHERE id = ?').get(newId))
})

router.patch('/:id/approve', (req, res) => {
  const item = db.prepare('SELECT * FROM moderation WHERE id = ?').get(req.params.id)
  if (!item) return res.status(404).json({ error: 'Topilmadi' })
  db.prepare('UPDATE posts SET status = ? WHERE id = ?').run('Faol', item.id)
  db.prepare('DELETE FROM moderation WHERE id = ?').run(req.params.id)
  addAudit("E'lon tasdiqlandi", 'ID ' + item.id)
  res.json({ ok: true })
})

router.patch('/:id/reject', (req, res) => {
  const item = db.prepare('SELECT * FROM moderation WHERE id = ?').get(req.params.id)
  if (!item) return res.status(404).json({ error: 'Topilmadi' })
  db.prepare('UPDATE posts SET status = ? WHERE id = ?').run('Rad etilgan', item.id)
  db.prepare('DELETE FROM moderation WHERE id = ?').run(req.params.id)
  addAudit("E'lon rad etildi", 'ID ' + item.id)
  res.json({ ok: true })
})

export default router
