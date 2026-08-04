import { Router } from 'express'
import db from '../db.js'
import { addAudit } from './audit.js'

const router = Router()

const labels = {
  aiThreshold: 'AI filtr chegara balli',
  commission: 'Platforma komissiyasi (bitimdan)',
  contractPrice: 'Shartnoma narxi',
  vipPrice: 'VIP joylashuv narxi',
  agentCommission: 'Uyimiz Agent fiks komissiyasi',
  platformShare: "Platformaning agentdan ulushi",
  agentSubscription: 'Agent oylik obunasi',
  premiumPostPrice: "Premium e'lon narxi",
  stage: 'Rivojlanish bosqichi',
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get())
})

router.put('/', (req, res) => {
  const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get()
  const merged = { ...existing, ...req.body }
  db.prepare(
    `UPDATE settings SET aiThreshold=?, commission=?, contractPrice=?, vipPrice=?, agentCommission=?, platformShare=?, agentSubscription=?, premiumPostPrice=?, stage=? WHERE id=1`
  ).run(
    merged.aiThreshold, merged.commission, merged.contractPrice, merged.vipPrice,
    merged.agentCommission, merged.platformShare, merged.agentSubscription, merged.premiumPostPrice, merged.stage
  )

  for (const field of Object.keys(labels)) {
    if (field in req.body && req.body[field] !== existing[field]) {
      addAudit(labels[field] + ' yangilandi', String(req.body[field]))
    }
  }
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get())
})

export default router
