import { Router } from 'express'
import db from '../db.js'
import { addAudit } from './audit.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM tariffs ORDER BY id ASC').all())
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tariffs WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Tarif topilmadi' })
  const merged = { ...existing, ...req.body }
  db.prepare(
    `UPDATE tariffs SET name=?, price=?, period=?, desc=? WHERE id=?`
  ).run(merged.name, merged.price, merged.period, merged.desc, req.params.id)
  addAudit('Tarif narxi yangilandi', merged.name)
  res.json(db.prepare('SELECT * FROM tariffs WHERE id = ?').get(req.params.id))
})

export default router
