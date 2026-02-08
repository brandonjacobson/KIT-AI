import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'kit-ai'
const COLLECTION_NAME = 'medical'

let client = null
let db = null

export async function connectDB() {
  if (db) return db
  client = new MongoClient(MONGODB_URI)
  await client.connect()
  db = client.db(DB_NAME)
  return db
}

export function getCollection() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.')
  return db.collection(COLLECTION_NAME)
}

export async function ensureMeta() {
  const coll = getCollection()
  const meta = await coll.findOne({ _id: 'meta' })
  if (!meta) {
    await coll.insertOne({ _id: 'meta', version: 1 })
  }
}

export async function closeDB() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
