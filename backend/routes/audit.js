import { Router } from 'express'
import db from '../db.js'

const router = Router()

export function addAudit(action, object, admin = 'Superadmin') {
  db.prepare(`INSERT INTO audit (time, admin, action, object) VALUES (?,?,?,?)`)
    .run('Hozir', admin, action, object)
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM audit ORDER BY id DESC').all()
  res.json(rows)
})

router.post('/', (req, res) => {
  const { action, object, admin } = req.body
  if (!action) return res.status(400).json({ error: 'action majburiy' })
  addAudit(action, object || '', admin || 'Superadmin')
  const row = db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 1').get()
  res.status(201).json(row)
})

export default router
