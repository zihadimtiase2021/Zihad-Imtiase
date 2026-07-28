import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// ডায়নামিক সেকশনের জন্য সম্পূর্ণ টাইপ ডিফাইন করা হচ্ছে (যাতে Vercel-এ কোনো TS Error না হয়)
export interface DynamicSiteSettings {
  hero: {
    coverMedia: string
    profileMedia: string
    name: string
    title: string
    bio: string
    tags: string[]
    location: string
    joinDate: string
    stats: { value: string; label: string }[]
  }
  about: {
    media: string[]
  }
}

// ডিফল্ট ভ্যালু (ডেটাবেস খালি থাকলে সাইটে এগুলো শো করবে)
const DEFAULT_SETTINGS: DynamicSiteSettings = {
  hero: {
    coverMedia: '',
    profileMedia: '',
    name: 'Zihad Imtiase',
    title: 'Frontend Developer & Webflow Specialist',
    bio: 'Crafting websites that drive engagement, conversions & success.',
    tags: ['#frontend', '#webflow', '#react', '#landingpage', '#CRO'],
    location: 'Dhaka Cantonment, Bangladesh',
    joinDate: 'Joined March 2022',
    stats: [
      { value: '50+', label: 'Projects' },
      { value: '40+', label: 'Clients' },
      { value: '4+', label: 'Years' },
    ],
  },
  about: { media: [] },
}

async function readSettings(): Promise<DynamicSiteSettings> {
  try {
    const db = await getDb()
    const collection = db.collection('settings')
    const doc = await collection.findOne({ _id: 'site_settings' as unknown as undefined })

    if (!doc) {
      return { ...DEFAULT_SETTINGS }
    }

    const { _id, ...rest } = doc
    
    // ডেটাবেসের ডেটার সাথে ডিফল্ট ডেটার ডিপ-মার্জিং (যেন কোনো ফিল্ড মিসিং থাকলে ডিফল্টটা লোড হয়)
    return {
      ...DEFAULT_SETTINGS,
      hero: {
        ...DEFAULT_SETTINGS.hero,
        ...(rest.hero ?? {}),
      },
      about: {
        ...DEFAULT_SETTINGS.about,
        ...(rest.about ?? {}),
      },
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
    
    const next: DynamicSiteSettings = {
      hero: { ...current.hero, ...(updates.hero ?? {}) },
      about: { ...current.about, ...(updates.about ?? {}) },
    }

    const db = await getDb()
    const collection = db.collection('settings')

    // _id: 'site_settings' দিয়ে upsert করা হচ্ছে যেন ডকুমেন্ট না থাকলে নতুন তৈরি হয়
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
