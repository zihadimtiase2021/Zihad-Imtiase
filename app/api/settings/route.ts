import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import type { SiteSettings } from '@/lib/data'

const DEFAULT_SETTINGS: SiteSettings = {
  hero: { coverMedia: '', profileMedia: '' },
  about: { media: [] as string[] },
}

async function readSettings(): Promise<SiteSettings> {
  try {
    const db = await getDb()
    const collection = db.collection('settings')
    const doc = await collection.findOne({ _id: 'site_settings' as unknown as undefined })

    if (!doc) {
      return { ...DEFAULT_SETTINGS }
    }

    const { _id, ...rest } = doc
    return {
      ...DEFAULT_SETTINGS,
      ...(rest as unknown as SiteSettings),
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export async function GET() {
  try {
    const settings = await readSettings()
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const updates = await req.json()
    const current = await readSettings()
    
    const next: SiteSettings = {
      hero: { ...current.hero, ...(updates.hero ?? {}) },
      about: { ...current.about, ...(updates.about ?? {}) },
    }

    const db = await getDb()
    const collection = db.collection('settings')

    // _id: 'site_settings' দিয়ে upsert করা হচ্ছে যেন ডকুমেন্ট না থাকলে নতুন তৈরি হয়
    await collection.updateOne(
      { _id: 'site_settings' as unknown as undefined },
      { $set: next },
      { upsert: true }
    )

    return NextResponse.json({ success: true, settings: next })
  } catch (err) {
    console.error('[settings PUT]', err)
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 })
  }
}