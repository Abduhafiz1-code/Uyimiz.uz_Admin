import { Router } from 'express'
import db from '../db.js'
import { addAudit } from './audit.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM posts ORDER BY id DESC').all())
})

router.post('/', (req, res) => {
  const { title, owner, price, status, date, dealType } = req.body
  if (!title) return res.status(400).json({ error: 'Sarlavha majburiy' })
  const id = Date.now() % 100000
  db.prepare(
    `INSERT INTO posts (id, title, owner, price, status, date, dealType) VALUES (?,?,?,?,?,?,?)`
  ).run(id, title, owner || '', price || '', status || 'Kutilmoqda', date || 'Bugun', dealType || 'Sotish')
  addAudit("E'lon qo'shildi", 'ID ' + id)
  res.status(201).json(db.prepare('SELECT * FROM posts WHERE id = ?').get(id))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: "E'lon topilmadi" })
  const merged = { ...existing, ...req.body }
  db.prepare(
    `UPDATE posts SET title=?, owner=?, price=?, status=?, date=?, dealType=? WHERE id=?`
  ).run(merged.title, merged.owner, merged.price, merged.status, merged.date, merged.dealType || 'Sotish', req.params.id)
  res.json(db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id))
})

router.patch('/:id/approve', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: "E'lon topilmadi" })
  db.prepare('UPDATE posts SET status = ? WHERE id = ?').run('Faol', req.params.id)
  addAudit("E'lon tasdiqlandi", 'ID ' + post.id)
  res.json(db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id))
})

router.delete('/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: "E'lon topilmadi" })
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id)
  addAudit("E'lon o'chirildi", 'ID ' + post.id)
  res.json({ ok: true })
})

export default router
