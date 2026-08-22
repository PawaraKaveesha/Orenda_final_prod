import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config()

import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET
const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

if (!secret) {
  throw new Error('JWT_SECRET is required. Set it in server/.env')
}

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn })
}

export function verifyToken(token) {
  return jwt.verify(token, secret)
}
