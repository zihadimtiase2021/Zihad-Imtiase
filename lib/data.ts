/**
 * Plain data-read helpers using Native MongoDB Driver.
 * Safe to import in API route handlers and Server Components.
 */
import { getDb } from '@/lib/db'

export interface FeedItem {
  id: string
  type: string
  title: string
  excerpt: string
  content: string
  category: string
  image?: string
  media?: string[]
  author: string
  clientName?: string
  clientRole?: string
  clientImage?: string
  date: string
  likes: number
  replies: number
  rating?: number
  tech?: string[]
  link?: string
  featured?: boolean
  linkedProjectId?: string
}

export interface Project {
  id: string
  title: string
  category: string
  description: string
  tech: string[]
  results: Record<string, string>
  link?: string
  github?: string
  image?: string
  images?: string[]
  content?: Array<{
    id: string
    type: 'paragraph' | 'heading' | 'image' | 'divider'
    text?: string
    url?: string
    caption?: string
  }>
  featured: boolean
}

export interface SiteSettings {
  hero: { coverMedia: string; profileMedia: string }
  about: { media: string[] }
}

export async function readFeedData(): Promise<{ items: FeedItem[] }> {
  try {
    const db = await getDb()
    const collection = db.collection('feed')
    const docs = await collection.find({}).sort({ date: -1, _id: -1 }).toArray()

    const items = docs.map((doc) => {
      const { _id, ...rest } = doc
      return rest as unknown as FeedItem
    })

    return { items }
  } catch (error) {
    console.error('[readFeedData error]', error)
    return { items: [] }
  }
}

export async function readPortfolioData(): Promise<{ projects: Project[] }> {
  try {
    const db = await getDb()
    const collection = db.collection('portfolio')
    const docs = await collection.find({}).sort({ _id: -1 }).toArray()

    const projects = docs.map((doc) => {
      const { _id, ...rest } = doc
      return rest as unknown as Project
    })

    return { projects }
  } catch (error) {
    console.error('[readPortfolioData error]', error)
    return { projects: [] }
  }
}

export async function readSettingsData(): Promise<SiteSettings> {
  const DEFAULT: SiteSettings = { hero: { coverMedia: '', profileMedia: '' }, about: { media: [] } }
  try {
    const db = await getDb()
    const collection = db.collection('settings')
    const doc = await collection.findOne({ _id: 'site_settings' as unknown as undefined })

    if (!doc) {
      return DEFAULT
    }

    const { _id, ...rest } = doc
    return { ...DEFAULT, ...(rest as unknown as SiteSettings) }
  } catch (error) {
    console.error('[readSettingsData error]', error)
    return DEFAULT
  }
}