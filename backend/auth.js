import crypto from 'node:crypto'

// Parolni tuz (salt) bilan xeshlaydi: "salt:hash" formatida saqlanadi.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// Kiritilgan parolni saqlangan xesh bilan xavfsiz solishtiradi.
export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  try {
    const hashBuffer = Buffer.from(hash, 'hex')
    const testHash = crypto.scryptSync(String(password), salt, 64)
    if (testHash.length !== hashBuffer.length) return false
    return crypto.timingSafeEqual(testHash, hashBuffer)
  } catch {
    return false
  }
}

// Sessiya uchun tasodifiy token yaratadi.
export function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}
