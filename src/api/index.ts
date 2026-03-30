/* eslint-disable @typescript-eslint/no-misused-promises */

import { Database } from '@api/features/data/index.js'
import { handleBankingItems } from '@api/middleware/banking.js'
import { handleRoot } from '@api/middleware/index.js'
import express from 'express'

const app = express()
const port = process.env.PORT_API ?? '3001'

app.get('/api/', handleRoot)
app.get('/api/banking', handleBankingItems)

try {
  await Database.connect()
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
} catch (error) {
  console.error('Error starting server:', error)
} finally {
  process.on('SIGINT', async () => {
    await Database.disconnect()
    process.exit(0)
  })
}
