import { Router } from 'express'
import { getCollection, ensureMeta } from '../db.js'

const router = Router()
const API_KEY = process.env.MEDICAL_API_KEY

function requireApiKey(req, res, next) {
  if (!API_KEY) return next()
  const key = req.headers['x-api-key']
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' })
  }
  next()
}

router.get('/', async (req, res) => {
  try {
    const coll = getCollection()
    const meta = await coll.findOne({ _id: 'meta' })
    const version = meta?.version ?? 1

    const entries = await coll
      .find({ _id: { $ne: 'meta' } })
      .toArray()

    const formatted = entries.map((doc) => ({
      id: doc._id,
      content: doc.content ?? '',
    }))

    res.json({ version, entries: formatted })
  } catch (err) {
    console.error('GET /api/medical:', err)
    res.status(500).json({ error: 'Failed to fetch medical content' })
  }
})

router.post('/', requireApiKey, async (req, res) => {
  try {
    const { version, entries } = req.body

    if (version == null || typeof version !== 'number') {
      return res.status(400).json({ error: 'version is required and must be a number' })
    }
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'entries must be an array' })
    }

    const coll = getCollection()
    await ensureMeta()

    await coll.updateOne(
      { _id: 'meta' },
      { $set: { version } },
      { upsert: true }
    )

    await coll.deleteMany({ _id: { $ne: 'meta' } })

    if (entries.length > 0) {
      const docs = entries
        .filter((e) => e.id != null)
        .map((e) => ({
          _id: e.id,
          content: e.content ?? '',
          updatedAt: new Date(),
        }))
      await coll.insertMany(docs)
    }

    res.json({ success: true })
  } catch (err) {
    console.error('POST /api/medical:', err)
    res.status(500).json({ error: 'Failed to update medical content' })
  }
})

export default router
