import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB, ensureMeta } from './db.js'
import medicalRoutes from './routes/medical.js'

const PORT = process.env.PORT || 3001
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

const app = express()

app.use(cors({ origin: FRONTEND_ORIGIN }))
app.use(express.json())

app.use('/api/medical', medicalRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

async function start() {
  await connectDB()
  await ensureMeta()

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start:', err)
  process.exit(1)
})
