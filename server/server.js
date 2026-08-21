import 'dotenv/config'
import app from './app.js'
import { connectDatabase, disconnectDatabase, verifyConnection } from './config/database.js'
import logger from './utils/logger.js'

const port = Number(process.env.PORT || 5000)
const host = process.env.HOST || '0.0.0.0'

async function start() {
  try {
    await connectDatabase()
    await verifyConnection()
    logger.info('Database connected (MongoDB)')
  } catch (err) {
    logger.error(`Could not connect to the database. Check MONGODB_URI. ${err.message}`)
    process.exit(1)
  }

  // Bind to 0.0.0.0 so Render / Cloudflare / any proxy can reach the server.
  const server = app.listen(port, host, () => {
    logger.info(`Orenda Eco lodge and Spa API listening on port ${port}`)
  })

  // Graceful shutdown: stop accepting requests, close MongoDB, then exit.
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully ...`)
    server.close(() => {
      disconnectDatabase()
        .catch(() => {})
        .finally(() => process.exit(0))
    })
    // Safety net: force-exit if connections refuse to drain.
    setTimeout(() => process.exit(1), 10000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start()
