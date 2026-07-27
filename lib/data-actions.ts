'use server'

import { getDb } from '@/lib/db'
import type { FeedItem, Project } from '@/lib/data'

// ── Feed ─────────────────────────────────────────────────────────────────────

export async function getFeedData(): Promise<{ items: FeedItem[] }> {
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
    console.error('[getFeedData error]', error)
    return { items: [] }
  }
}

export async function addFeedItem(
  item: Omit<FeedItem, 'id' | 'date' | 'likes' | 'replies'>,
): Promise<{ success: boolean; item?: FeedItem; error?: string }> {
  try {
    const db = await getDb()
    const collection = db.collection('feed')

    const newItem: FeedItem = {
      ...item,
      id: `feed-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      replies: 0,
    }

    await collection.insertOne(newItem)
    return { success: true, item: newItem }
  } catch (error) {
    console.error('[addFeedItem error]', error)
    return { success: false, error: 'Failed to add feed item' }
  }
}

export async function updateFeedItem(
  itemId: string,
  updates: Partial<FeedItem>,
): Promise<{ success: boolean; item?: FeedItem; error?: string }> {
  try {
    const db = await getDb()
    const collection = db.collection('feed')

    const result = await collection.findOneAndUpdate(
      { id: itemId },
      { $set: updates },
      { returnDocument: 'after' }
    )

    if (!result) {
      return { success: false, error: 'Item not found' }
    }

    const { _id, ...cleanItem } = result
    return { success: true, item: cleanItem as unknown as FeedItem }
  } catch (error) {
    console.error('[updateFeedItem error]', error)
    return { success: false, error: 'Failed to update feed item' }
  }
}

export async function deleteFeedItem(
  itemId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb()
    const collection = db.collection('feed')

    const result = await collection.deleteOne({ id: itemId })

    if (result.deletedCount === 0) {
      return { success: false, error: 'Item not found or already deleted' }
    }

    return { success: true }
  } catch (error) {
    console.error('[deleteFeedItem error]', error)
    return { success: false, error: 'Failed to delete feed item' }
  }
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export async function getPortfolioData(): Promise<{ projects: Project[] }> {
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
    console.error('[getPortfolioData error]', error)
    return { projects: [] }
  }
}

export async function addPortfolioProject(
  project: Omit<Project, 'id'>,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const db = await getDb()
    const collection = db.collection('portfolio')

    const newProject: Project = { ...project, id: `proj-${Date.now()}` }
    await collection.insertOne(newProject)

    return { success: true, project: newProject }
  } catch (error) {
    console.error('[addPortfolioProject error]', error)
    return { success: false, error: 'Failed to add project' }
  }
}

export async function updatePortfolioProject(
  projectId: string,
  updates: Partial<Project>,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const db = await getDb()
    const collection = db.collection('portfolio')

    const result = await collection.findOneAndUpdate(
      { id: projectId },
      { $set: updates },
      { returnDocument: 'after' }
    )

    if (!result) {
      return { success: false, error: 'Project not found' }
    }

    const { _id, ...cleanProject } = result
    return { success: true, project: cleanProject as unknown as Project }
  } catch (error) {
    console.error('[updatePortfolioProject error]', error)
    return { success: false, error: 'Failed to update project' }
  }
}

export async function deletePortfolioProject(
  projectId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb()
    const collection = db.collection('portfolio')

    const result = await collection.deleteOne({ id: projectId })

    if (result.deletedCount === 0) {
      return { success: false, error: 'Project not found or already deleted' }
    }

    return { success: true }
  } catch (error) {
    console.error('[deletePortfolioProject error]', error)
    return { success: false, error: 'Failed to delete project' }
  }
}