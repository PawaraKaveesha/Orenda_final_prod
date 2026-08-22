import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config()

import mongoose from 'mongoose'

// ---------------------------------------------------------------------------
// Shared MongoDB (Mongoose) connection.
//
// The connection string comes from MONGODB_URI (set in server/.env locally, or
// provided by Render environment variables in production). No credentials are
// ever hardcoded here.
// ---------------------------------------------------------------------------

export function getMongoUri() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is required. Set it in server/.env or the environment.')
  }
  return uri
}

export async function connectDatabase() {
  const uri = getMongoUri()
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  return mongoose.connection
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}

export async function verifyConnection() {
  const conn = mongoose.connection
  if (conn.readyState !== 1) {
    throw new Error('MongoDB is not connected')
  }
  await conn.db.admin().ping()
  return { connected: true }
}

export default mongoose
