import { Router } from 'express'
import db from '../db.js'
import { addAudit } from './audit.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM agents ORDER BY id ASC').all())
})

router.post('/', (req, res) => {
  const { name, rating, deals, commission, cert } = req.body
  if (!name) return res.status(400).json({ error: 'Ism majburiy' })
  const info = db.prepare(
    `INSERT INTO agents (name, rating, deals, commission, cert) VALUES (?,?,?,?,?)`
  ).run(name, rating ?? 0, deals ?? 0, commission ?? 10, cert || 'Kutilmoqda')
  addAudit('Agent qo\'shildi', name)
  res.status(201).json(db.prepare('SELECT * FROM agents WHERE id = ?').get(info.lastInsertRowid))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Agent topilmadi' })
  const merged = { ...existing, ...req.body }
  db.prepare(
    `UPDATE agents SET name=?, rating=?, deals=?, commission=?, cert=? WHERE id=?`
  ).run(merged.name, merged.rating, merged.deals, merged.commission, merged.cert, req.params.id)
  res.json(db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id))
})

function setCert(id, cert, actionLabel) {
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id)
  if (!agent) return null
  db.prepare('UPDATE agents SET cert = ? WHERE id = ?').run(cert, id)
  addAudit(actionLabel, agent.name)
  return db.prepare('SELECT * FROM agents WHERE id = ?').get(id)
}

router.patch('/:id/approve', (req, res) => {
  const row = setCert(req.params.id, 'Tasdiqlangan', 'Agent sertifikatlandi')
  if (!row) return res.status(404).json({ error: 'Agent topilmadi' })
  res.json(row)
})

router.patch('/:id/reject', (req, res) => {
  const row = setCert(req.params.id, 'Rad etilgan', 'Agent sertifikati rad etildi')
  if (!row) return res.status(404).json({ error: 'Agent topilmadi' })
  res.json(row)
})

router.patch('/:id/revoke', (req, res) => {
  const row = setCert(req.params.id, 'Bekor qilindi', 'Sertifikat bekor qilindi')
  if (!row) return res.status(404).json({ error: 'Agent topilmadi' })
  res.json(row)
})

router.delete('/:id', (req, res) => {
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id)
  if (!agent) return res.status(404).json({ error: 'Agent topilmadi' })
  db.prepare('DELETE FROM agents WHERE id = ?').run(req.params.id)
  addAudit("Agent o'chirildi", agent.name)
  res.json({ ok: true })
})

export default router
