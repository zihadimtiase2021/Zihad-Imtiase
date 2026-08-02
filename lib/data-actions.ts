'use server'

import { getDb } from '@/lib/db'
import { readFeedData, readPortfolioData, readSettingsData, DEFAULT_SETTINGS } from '@/lib/data'
import type { FeedItem, Project, SiteSettings } from '@/lib/types'

// Re-export read helpers so server actions and route handlers share one source.
export { readFeedData as getFeedData, readPortfolioData as getPortfolioData }

// ── Utility ───────────────────────────────────────────────────────────────────

function stripId<T extends { _id?: unknown }>(doc: T): Omit<T, '_id'> {
  const { _id, ...rest } = doc
  return rest as Omit<T, '_id'>
}

// ── Feed mutations ────────────────────────────────────────────────────────────

export async function addFeedItem(
  item: Omit<FeedItem, 'id' | 'date' | 'likes' | 'replies'>,
): Promise<{ success: boolean; item?: FeedItem; error?: string }> {
  try {
    const db = await getDb()
    const newItem: FeedItem = {
      ...item,
      id: `feed-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      replies: 0,
    }
    await db.collection('feed').insertOne(newItem)
    return { success: true, item: newItem }
  } catch (error) {
    console.error('[addFeedItem]', error)
    return { success: false, error: 'Failed to add feed item' }
  }
}

export async function updateFeedItem(
  itemId: string,
  updates: Partial<FeedItem>,
): Promise<{ success: boolean; item?: FeedItem; error?: string }> {
  if (!itemId) return { success: false, error: 'Missing item ID' }
  try {
    const db = await getDb()
    const result = await db
      .collection('feed')
      .findOneAndUpdate({ id: itemId }, { $set: updates }, { returnDocument: 'after' })

    if (!result) return { success: false, error: 'Item not found' }
    return { success: true, item: stripId(result) as unknown as FeedItem }
  } catch (error) {
    console.error('[updateFeedItem]', error)
    return { success: false, error: 'Failed to update feed item' }
  }
}

export async function deleteFeedItem(
  itemId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!itemId) return { success: false, error: 'Missing item ID' }
  try {
    const db = await getDb()
    const result = await db.collection('feed').deleteOne({ id: itemId })
    if (result.deletedCount === 0) return { success: false, error: 'Item not found' }
    return { success: true }
  } catch (error) {
    console.error('[deleteFeedItem]', error)
    return { success: false, error: 'Failed to delete feed item' }
  }
}

export async function incrementFeedItemLikes(
  itemId: string,
): Promise<{ success: boolean; likes?: number; error?: string }> {
  if (!itemId) return { success: false, error: 'Missing item ID' }
  try {
    const db = await getDb()
    const result = await db
      .collection('feed')
      .findOneAndUpdate({ id: itemId }, { $inc: { likes: 1 } }, { returnDocument: 'after' })
    if (!result) return { success: false, error: 'Item not found' }
    return { success: true, likes: (result as unknown as FeedItem).likes }
  } catch (error) {
    console.error('[incrementFeedItemLikes]', error)
    return { success: false, error: 'Failed to update likes' }
  }
}

// ── Portfolio mutations ───────────────────────────────────────────────────────

export async function addPortfolioProject(
  project: Omit<Project, 'id'>,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const db = await getDb()
    const newProject: Project = { ...project, id: `proj-${Date.now()}` }
    await db.collection('portfolio').insertOne(newProject)
    return { success: true, project: newProject }
  } catch (error) {
    console.error('[addPortfolioProject]', error)
    return { success: false, error: 'Failed to add project' }
  }
}

export async function updatePortfolioProject(
  projectId: string,
  updates: Partial<Project>,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  if (!projectId) return { success: false, error: 'Missing project ID' }
  try {
    const db = await getDb()
    const result = await db
      .collection('portfolio')
      .findOneAndUpdate({ id: projectId }, { $set: updates }, { returnDocument: 'after' })
    if (!result) return { success: false, error: 'Project not found' }
    return { success: true, project: stripId(result) as unknown as Project }
  } catch (error) {
    console.error('[updatePortfolioProject]', error)
    return { success: false, error: 'Failed to update project' }
  }
}

export async function deletePortfolioProject(
  projectId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!projectId) return { success: false, error: 'Missing project ID' }
  try {
    const db = await getDb()
    const result = await db.collection('portfolio').deleteOne({ id: projectId })
    if (result.deletedCount === 0) return { success: false, error: 'Project not found' }
    return { success: true }
  } catch (error) {
    console.error('[deletePortfolioProject]', error)
    return { success: false, error: 'Failed to delete project' }
  }
}

// ── Settings mutation ─────────────────────────────────────────────────────────

const SETTINGS_ID = 'site_settings'

export async function updateSettings(
  updates: Partial<SiteSettings>,
): Promise<{ success: boolean; settings?: SiteSettings; error?: string }> {
  try {
    const current = await readSettingsData()
    const next: SiteSettings = {
      hero: { ...current.hero, ...(updates.hero ?? {}) },
      about: { ...current.about, ...(updates.about ?? {}) },
      contact: { ...current.contact, ...(updates.contact ?? {}) },
      meta: { ...current.meta, ...(updates.meta ?? {}) },
    }

    const db = await getDb()
    await db
      .collection('settings')
      .updateOne(
        { _id: SETTINGS_ID as unknown as undefined },
        { $set: next },
        { upsert: true },
      )

    return { success: true, settings: next }
  } catch (error) {
    console.error('[updateSettings]', error)
    return { success: false, error: 'Failed to save settings' }
  }
}
