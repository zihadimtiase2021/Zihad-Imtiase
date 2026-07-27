import { MongoClient, ServerApiVersion } from 'mongodb'

const rawUri = process.env.MONGODB_URI

if (!rawUri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// যেকোনো কোটেশন চিহ্ন (", '), স্পেস বা লাইন-ব্রেক অটোমেটিক রিমুভ করার জন্য
const uri = rawUri.replace(/["']/g, '').trim()

if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
  throw new Error(
    `Invalid MONGODB_URI format. Your URI starts with: "${uri.substring(0, 15)}...". It must start with "mongodb://" or "mongodb+srv://"`
  )
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDb() {
  const client = await clientPromise
  return client.db('zihad_portfolio')
}

export default clientPromise