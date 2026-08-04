import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import { fileURLToPath } from 'url'
import { hashPassword } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const database = new DatabaseSync(path.join(__dirname, 'data.sqlite'))

database.exec('PRAGMA journal_mode = WAL')

// better-sqlite3 bilan bir xil ishlaydigan kichik moslashtiruvchi (wrapper):
// .prepare().get()/.all()/.run() bir xil, faqat .transaction() qo'shildi.
const db = {
  prepare: (sql) => database.prepare(sql),
  exec: (sql) => database.exec(sql),
  transaction: (fn) => {
    return (rows) => {
      database.exec('BEGIN')
      try {
        fn(rows)
        database.exec('COMMIT')
      } catch (err) {
        database.exec('ROLLBACK')
        throw err
      }
    }
  },
}

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  type TEXT,
  typeKey TEXT,
  status TEXT,
  since TEXT
);

CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rating REAL,
  deals INTEGER,
  commission REAL,
  cert TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  owner TEXT,
  price TEXT,
  status TEXT,
  date TEXT,
  dealType TEXT DEFAULT 'Sotish'
);

CREATE TABLE IF NOT EXISTS moderation (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  reason TEXT,
  score INTEGER
);

CREATE TABLE IF NOT EXISTS tariffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price TEXT,
  period TEXT,
  desc TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  aiThreshold INTEGER,
  commission REAL,
  contractPrice INTEGER,
  vipPrice INTEGER,
  agentCommission REAL,
  platformShare REAL,
  agentSubscription INTEGER,
  premiumPostPrice INTEGER,
  stage INTEGER
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  status TEXT,
  since TEXT
);

CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT,
  admin TEXT,
  action TEXT,
  object TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  adminId INTEGER NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);
`)

// Eski (avvalgi versiyadagi) data.sqlite fayllarida yangi ustunlar bo'lmasligi mumkin —
// xavfsiz tarzda qo'shib qo'yamiz (ustun allaqachon bo'lsa xatolik e'tiborga olinmaydi).
function ensureColumn(table, column, ddl) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`)
  } catch (e) {
    // ustun allaqachon mavjud — e'tiborsiz qoldiramiz
  }
}
ensureColumn('posts', 'dealType', "TEXT DEFAULT 'Sotish'")
ensureColumn('settings', 'agentCommission', 'REAL')
ensureColumn('settings', 'platformShare', 'REAL')
ensureColumn('settings', 'agentSubscription', 'INTEGER')
ensureColumn('settings', 'premiumPostPrice', 'INTEGER')
ensureColumn('settings', 'stage', 'INTEGER')
ensureColumn('admins', 'username', 'TEXT')
ensureColumn('admins', 'password', 'TEXT')

function seedIfEmpty() {
  const usersCount = db.prepare('SELECT COUNT(*) c FROM users').get().c
  if (usersCount === 0) {
    const insertUser = db.prepare(`INSERT INTO users (id, name, phone, type, typeKey, status, since) VALUES (@id,@name,@phone,@type,@typeKey,@status,@since)`)
    const users = [
      { id: 8841, name: 'Dilnoza Yusupova', phone: '+998 90 123 45 67', type: 'Uy egasi', typeKey: 'uy_egalari', status: 'Faol', since: '2 kun oldin' },
      { id: 5502, name: 'Nodira Aliyeva', phone: 'Uyimiz Agent · Sertifikatlangan', type: 'Agent', typeKey: 'agentlar', status: 'Faol', since: '3 oy oldin' },
      { id: 9120, name: 'Otabek Karimov', phone: '+998 93 555 12 09', type: 'Xaridor', typeKey: 'xaridorlar', status: 'Faol', since: 'Bugun' },
      { id: 4417, name: 'Sardor Nazarov', phone: 'Uyimiz Agent', type: 'Agent', typeKey: 'agentlar', status: 'Bloklangan', since: '1 hafta oldin' },
      { id: 2210, name: 'Malika Tosheva', phone: '+998 97 214 88 03', type: 'Xaridor', typeKey: 'xaridorlar', status: 'Faol', since: '5 kun oldin' },
      { id: 1183, name: 'Javlon Rustamov', phone: 'Uyimiz Agent', type: 'Agent', typeKey: 'agentlar', status: 'Faol', since: '1 oy oldin' },
      { id: 3364, name: "G'ulomjon Sattorov", phone: '+998 94 777 20 11', type: 'Ijarachi', typeKey: 'ijarachilar', status: 'Faol', since: '4 kun oldin' },
      { id: 6650, name: 'Zarina Ergasheva', phone: '+998 95 333 60 82', type: 'Ijarachi', typeKey: 'ijarachilar', status: 'Faol', since: 'Kecha' },
    ]
    const tx = db.transaction((rows) => rows.forEach(r => insertUser.run(r)))
    tx(users)
  }

  const agentsCount = db.prepare('SELECT COUNT(*) c FROM agents').get().c
  if (agentsCount === 0) {
    const insertAgent = db.prepare(`INSERT INTO agents (name, rating, deals, commission, cert) VALUES (@name,@rating,@deals,@commission,@cert)`)
    const agents = [
      // "Uyimiz Agent" modeli: makler endi mustaqil emas — 10-50% o'rniga 1-2% fiks komissiya oladi
      { name: 'Nodira Aliyeva', rating: 4.7, deals: 6, commission: 2, cert: 'Tasdiqlangan' },
      { name: 'Jasur Toshpulatov', rating: 4.2, deals: 4, commission: 1.5, cert: 'Tasdiqlangan' },
      { name: 'Javlon Rustamov', rating: 4.9, deals: 9, commission: 2, cert: 'Tasdiqlangan' },
      { name: 'Kamron Ismoilov', rating: 2.1, deals: 0, commission: 1.5, cert: 'Kutilmoqda' },
    ]
    const tx = db.transaction((rows) => rows.forEach(r => insertAgent.run(r)))
    tx(agents)
  }

  const postsCount = db.prepare('SELECT COUNT(*) c FROM posts').get().c
  if (postsCount === 0) {
    const insertPost = db.prepare(`INSERT INTO posts (id, title, owner, price, status, date, dealType) VALUES (@id,@title,@owner,@price,@status,@date,@dealType)`)
    const posts = [
      { id: 40311, title: "3-xonali kvartira, Chilonzor", owner: 'Dilnoza Yusupova', price: "820 000 000 so'm", status: 'Kutilmoqda', date: 'Bugun', dealType: 'Sotish' },
      { id: 40298, title: 'Ofis binosi, Yunusobod', owner: 'Nodira Aliyeva', price: "2 100 000 000 so'm", status: 'Faol', date: 'Kecha', dealType: 'Sotish' },
      { id: 40277, title: 'Hovli, Sergeli', owner: 'Otabek Karimov', price: "640 000 000 so'm", status: 'Faol', date: '2 kun oldin', dealType: 'Sotish' },
      { id: 40255, title: "Ijaraga 2-xonali, Mirzo Ulug'bek", owner: 'Sardor Nazarov', price: "6 500 000 so'm/oy", status: 'Rad etilgan', date: '3 kun oldin', dealType: 'Ijara' },
      { id: 40340, title: "Ijaraga studiya, Yakkasaroy", owner: "G'ulomjon Sattorov", price: "4 200 000 so'm/oy", status: 'Faol', date: '1 kun oldin', dealType: 'Ijara' },
      { id: 40352, title: "1-xonali kvartira, Olmazor", owner: 'Malika Tosheva', price: "410 000 000 so'm", status: 'Faol', date: 'Bugun', dealType: 'Sotish' },
    ]
    const tx = db.transaction((rows) => rows.forEach(r => insertPost.run(r)))
    tx(posts)
  }

  const modCount = db.prepare('SELECT COUNT(*) c FROM moderation').get().c
  if (modCount === 0) {
    const insertMod = db.prepare(`INSERT INTO moderation (id, title, reason, score) VALUES (@id,@title,@reason,@score)`)
    const moderation = [
      { id: 40311, title: '3-xonali kvartira, Chilonzor', reason: 'AI shubhali narx', score: 88 },
      { id: 40320, title: 'Yer uchastkasi, Qibray', reason: 'Rasm sifatsiz', score: 62 },
      { id: 40325, title: "Do'kon binosi, Mirobod", reason: "Takroriy e'lon", score: 91 },
    ]
    const tx = db.transaction((rows) => rows.forEach(r => insertMod.run(r)))
    tx(moderation)
  }

  const tariffsCount = db.prepare('SELECT COUNT(*) c FROM tariffs').get().c
  if (tariffsCount === 0) {
    const insertTariff = db.prepare(`INSERT INTO tariffs (name, price, period, desc) VALUES (@name,@price,@period,@desc)`)
    const tariffs = [
      { name: 'Standart joylashuv', price: 'Bepul', period: '—', desc: "Oddiy ro'yxatga olish (1-bosqich: auditoriya yig'ish uchun mutlaqo bepul)" },
      { name: "Premium e'lon", price: "70 000 so'm", period: 'oy', desc: "E'lonni qidiruv natijalarida yuqoriroq ko'rsatish" },
      { name: 'VIP joylashuv', price: "200 000 so'm", period: 'hafta', desc: "Bosh sahifada ko'rinish, qidiruvda eng yuqori o'rin" },
      { name: 'Onlayn shartnoma xizmati', price: "50 000 so'm", period: 'shartnoma', desc: "E-IMZO/PDF orqali avtomatik shartnoma tuzish" },
      { name: 'Agent sertifikati', price: "150 000 so'm", period: 'yil', desc: "'Uyimiz Agent' sifatida tasdiqlangan belgi" },
      { name: 'Agent oylik obunasi', price: "400 000 so'm", period: 'oy', desc: "Uyimiz Agent uchun oylik abonent to'lovi (300-500 ming so'm oralig'ida)" },
      { name: 'Reklama banneri', price: 'Kelishilgan narx', period: '—', desc: "Qurilish, mebel, dizayn kompaniyalari uchun bannerlar" },
    ]
    const tx = db.transaction((rows) => rows.forEach(r => insertTariff.run(r)))
    tx(tariffs)
  }

  const settingsCount = db.prepare('SELECT COUNT(*) c FROM settings').get().c
  if (settingsCount === 0) {
    db.prepare(
      `INSERT INTO settings (id, aiThreshold, commission, contractPrice, vipPrice, agentCommission, platformShare, agentSubscription, premiumPostPrice, stage)
       VALUES (1, 80, 1.5, 50000, 200000, 2, 12, 400000, 70000, 1)`
    ).run()
  } else {
    // Eski bazalarda yangi ustunlar NULL bo'lishi mumkin — birinchi marta standart qiymat bilan to'ldiramiz
    const s = db.prepare('SELECT * FROM settings WHERE id = 1').get()
    const patch = {}
    if (s.agentCommission == null) patch.agentCommission = 2
    if (s.platformShare == null) patch.platformShare = 12
    if (s.agentSubscription == null) patch.agentSubscription = 400000
    if (s.premiumPostPrice == null) patch.premiumPostPrice = 70000
    if (s.stage == null) patch.stage = 1
    if (Object.keys(patch).length) {
      const merged = { ...s, ...patch }
      db.prepare(
        `UPDATE settings SET agentCommission=@agentCommission, platformShare=@platformShare, agentSubscription=@agentSubscription, premiumPostPrice=@premiumPostPrice, stage=@stage WHERE id=1`
      ).run(merged)
    }
  }

  const adminsCount = db.prepare('SELECT COUNT(*) c FROM admins').get().c
  if (adminsCount === 0) {
    const insertAdmin = db.prepare(`INSERT INTO admins (name, phone, role, status, since) VALUES (@name,@phone,@role,@status,@since)`)
    const admins = [
      { name: 'Superadmin', phone: '+998 90 000 00 00', role: 'Superadmin', status: 'Faol', since: 'Boshidan' },
      { name: 'Nilufar (Admin)', phone: '+998 91 111 22 33', role: 'Admin', status: 'Faol', since: '3 oy oldin' },
      { name: 'Botir (Admin)', phone: '+998 93 222 33 44', role: 'Moderator', status: 'Faol', since: '1 oy oldin' },
    ]
    const tx = db.transaction((rows) => rows.forEach(r => insertAdmin.run(r)))
    tx(admins)
  }

  const auditCount = db.prepare('SELECT COUNT(*) c FROM audit').get().c
  if (auditCount === 0) {
    const insertAudit = db.prepare(`INSERT INTO audit (time, admin, action, object) VALUES (@time,@admin,@action,@object)`)
    const audit = [
      { time: 'Bugun 14:32', admin: 'Superadmin', action: "E'lon rad etildi", object: 'ID 40311' },
      { time: 'Bugun 11:05', admin: 'Nilufar (Admin)', action: 'Agent bloklandi', object: 'Sardor Nazarov' },
      { time: 'Kecha 19:40', admin: 'Superadmin', action: 'Komissiya 10% → 12%', object: 'Nodira Aliyeva' },
      { time: 'Kecha 09:12', admin: 'Botir (Admin)', action: 'Tarif narxi yangilandi', object: 'VIP joylashuv' },
    ]
    const tx = db.transaction((rows) => rows.forEach(r => insertAudit.run(r)))
    tx(audit)
  }
}

// Login tizimi uchun standart superadmin hisobini majburan (mavjud bo'lmasa yaratib,
// mavjud bo'lsa parol/rolini) sozlab qo'yamiz: login "usmon", parol "usmonaman2014".
function ensureDefaultAdmin() {
  const username = 'usmon'
  const passwordHash = hashPassword('usmonaman2014')
  const existing = db.prepare('SELECT * FROM admins WHERE username = ?').get(username)
  if (existing) {
    db.prepare('UPDATE admins SET password = ?, role = ?, status = ? WHERE id = ?')
      .run(passwordHash, 'Superadmin', 'Faol', existing.id)
  } else {
    db.prepare(
      `INSERT INTO admins (name, phone, role, status, since, username, password) VALUES (?,?,?,?,?,?,?)`
    ).run('Usmon', '', 'Superadmin', 'Faol', 'Boshidan', username, passwordHash)
  }
}

seedIfEmpty()
ensureDefaultAdmin()

export default db
