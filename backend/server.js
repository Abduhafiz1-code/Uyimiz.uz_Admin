import express from 'express'
import cors from 'cors'
import db from './db.js'
import { requireAuth } from './requireAuth.js'

import usersRouter from './routes/users.js'
import agentsRouter from './routes/agents.js'
import postsRouter from './routes/posts.js'
import moderationRouter from './routes/moderation.js'
import tariffsRouter from './routes/tariffs.js'
import settingsRouter from './routes/settings.js'
import auditRouter from './routes/audit.js'
import adminsRouter from './routes/admins.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Login/logout — avtorizatsiyasiz ochiq
app.use('/api/auth', authRouter)

// Shu joydan pastdagi barcha /api yo'nalishlari faqat tizimga kirgan adminlar uchun ochiq
app.use('/api', requireAuth)

app.get('/api/dashboard', (req, res) => {
  const usersTotal = db.prepare('SELECT COUNT(*) c FROM users').get().c
  const activeAgents = db.prepare("SELECT COUNT(*) c FROM agents WHERE cert = 'Tasdiqlangan'").get().c
  const postsToday = db.prepare("SELECT COUNT(*) c FROM posts WHERE date = 'Bugun'").get().c
  const moderationCount = db.prepare('SELECT COUNT(*) c FROM moderation').get().c
  const postsTotal = db.prepare('SELECT COUNT(*) c FROM posts').get().c
  const dealsTotal = db.prepare('SELECT COALESCE(SUM(deals),0) c FROM agents').get().c
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get()
  res.json({
    usersTotal,
    activeAgents,
    postsToday,
    moderationCount,
    postsTotal,
    dealsTotal,
    stage: settings?.stage ?? 1,
  })
})

app.use('/api/users', usersRouter)
app.use('/api/agents', agentsRouter)
app.use('/api/posts', postsRouter)
app.use('/api/moderation', moderationRouter)
app.use('/api/tariffs', tariffsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/audit', auditRouter)
app.use('/api/admins', adminsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Manzil topilmadi' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Server xatosi' })
})

app.listen(PORT, () => {
  console.log(`Backend ishga tushdi: http://localhost:${PORT}`)
})
