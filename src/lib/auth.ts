import crypto from 'crypto'

export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  const hmac = crypto.createHmac('sha256', secretKey)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export function hashPassword(password: string): string {
  const bcrypt = require('bcryptjs')
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  const bcrypt = require('bcryptjs')
  return bcrypt.compareSync(password, hash)
}

export function generateToken(userId: string): string {
  const jwt = require('jsonwebtoken')
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  const jwt = require('jsonwebtoken')
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret')
  } catch {
    return null
  }
}