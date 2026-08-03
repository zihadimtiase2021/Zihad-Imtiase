/**
 * Read-only data helpers using the MongoDB driver.
 * Safe to call from Server Components and API Route Handlers.
 * Re-exports shared types so consumers import from one place.
 */
import { getDb } from '@/lib/db'
import type { FeedItem, Project, SiteSettings } from '@/lib/types'

export type { FeedItem, Project, SiteSettings }

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripId<T extends { _id?: unknown }>(doc: T): Omit<T, '_id'> {
  const { _id, ...rest } = doc
  return rest as Omit<T, '_id'>
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export async function readFeedData(): Promise<{ items: FeedItem[] }> {
  try {
    const db = await getDb()
    const docs = await db
      .collection('feed')
      .find({})
      .sort({ pinned: -1, date: -1, _id: -1 })
      .toArray()
    return { items: docs.map((d) => stripId(d) as unknown as FeedItem) }
  } catch (error) {
    console.error('[readFeedData]', error)
    return { items: [] }
  }
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export async function readPortfolioData(): Promise<{ projects: Project[] }> {
  try {
    const db = await getDb()
    const docs = await db.collection('portfolio').find({}).sort({ _id: -1 }).toArray()
    return { projects: docs.map((d) => stripId(d) as unknown as Project) }
  } catch (error) {
    console.error('[readPortfolioData]', error)
    return { projects: [] }
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────

const SETTINGS_ID = 'site_settings'

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    coverMedia: '',
    profileMedia: '',
    firstName: 'Zihad',
    lastName: 'Imtiase',
    nickname: '',
    name: 'Zihad Imtiase',
    title: 'Frontend Developer & Webflow Specialist',
    bio: 'Crafting websites that drive engagement, conversions & success.',
    tags: ['#frontend', '#webflow', '#react', '#landingpage', '#CRO'],
    country: 'Bangladesh',
    city: 'Dhaka Cantonment',
    location: 'Dhaka Cantonment, Bangladesh',
    joinDate: 'Joined March 2022',
    stats: [
      { value: '50+', label: 'Projects' },
      { value: '40+', label: 'Clients' },
      { value: '4+', label: 'Years' },
    ],
    hireMeLink: '/contact',
    profileButtonText: 'Hire Me',
    profileButtonLink: '/contact',
  },
  about: { media: [], introText: '', timeline: [], stack: [], values: [] },
  contact: { email: '', phone: '', whatsapp: '', address: '', shortText: '', contactHeading: '', contactSubHeading: '', socials: [] },
  meta: { title: '', description: '', favicon: '' },
}

export async function readSettingsData(): Promise<SiteSettings> {
  try {
    const db = await getDb()
    const doc = await db
      .collection('settings')
      .findOne({ _id: SETTINGS_ID as unknown as undefined })

    if (!doc) return structuredClone(DEFAULT_SETTINGS)

    const { _id, ...rest } = doc

    const merged: SiteSettings = {
      hero: { ...DEFAULT_SETTINGS.hero, ...(rest.hero ?? {}) },
      about: { ...DEFAULT_SETTINGS.about, ...(rest.about ?? {}) },
      contact: { ...DEFAULT_SETTINGS.contact, ...(rest.contact ?? {}) },
      meta: { ...DEFAULT_SETTINGS.meta, ...(rest.meta ?? {}) },
    }
    // Derive composite location if not already stored
    if (!merged.hero.location && (merged.hero.city || merged.hero.country)) {
      merged.hero.location = [merged.hero.city, merged.hero.country].filter(Boolean).join(', ')
    }
    return merged
  } catch (error) {
    console.error('[readSettingsData]', error)
    return structuredClone(DEFAULT_SETTINGS)
  }
}
