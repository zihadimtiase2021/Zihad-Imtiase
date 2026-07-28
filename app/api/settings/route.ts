import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

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
    title: string
    subtitle: string
    introPara1: string
    introPara2: string
    location: string
    joinDate: string
    education: string
    values: { title: string; desc: string }[]
    stack: { name: string; level: number }[]
    timeline: { year: string; title: string; place: string; desc: string }[]
  }
}

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
  about: {
    media: [],
    title: 'Zihad Imtiase',
    subtitle: 'Frontend Developer & Webflow Specialist',
    introPara1: 'I help startups, agencies, and growing businesses turn their ideas into high-performing websites. My focus is always the same: websites that look great and drive measurable results — more leads, more sign-ups, more revenue.',
    introPara2: 'Based in Dhaka Cantonment, Bangladesh. Working with clients worldwide since March 2022. When I am not building, I am writing about frontend development and conversion optimisation.',
    location: 'Dhaka Cantonment, Bangladesh',
    joinDate: 'Joined March 2022',
    education: 'Self-taught + Webflow Expert',
    values: [
      { title: 'Results over aesthetics', desc: 'Beautiful design that does not convert is decoration. Every choice I make has a purpose tied to the business goal.' },
      { title: 'Communication first', desc: 'I send updates before clients ask. No surprises, no missed deadlines, no guessing.' },
      { title: 'Craft in the details', desc: 'Pixel-perfect typography, 60 fps animations, sub-2s load times — the details are where trust is built.' },
      { title: 'Long-term thinking', desc: 'I build codebases and design systems my clients can maintain and grow without coming back to me for every small change.' },
    ],
    stack: [
      { name: 'React / Next.js', level: 95 },
      { name: 'Webflow', level: 98 },
      { name: 'TypeScript', level: 88 },
      { name: 'TailwindCSS', level: 96 },
      { name: 'Node.js', level: 75 },
      { name: 'Figma', level: 82 },
    ],
    timeline: [
      { year: '2024', title: 'Senior Frontend Developer', place: 'Freelance — Global clients', desc: 'Scaling conversion-focused websites for SaaS products, e-commerce brands, and service businesses across the US, UK, and Bangladesh.' },
      { year: '2023', title: 'Webflow Expert Certification', place: 'Webflow University', desc: 'Achieved Webflow Expert status. Delivered 15+ Webflow projects ranging from marketing sites to complex CMS-driven platforms.' },
      { year: '2022', title: 'Started Freelancing Full-Time', place: 'Remote', desc: 'Transitioned from agency work to full-time freelancing. Built first Webflow client project — a SaaS landing page that 3x-ed their trial signups.' },
      { year: '2021', title: 'Frontend Developer', place: 'Web Agency, Dhaka', desc: 'Joined a Dhaka-based digital agency. Worked on React apps, responsive UIs, and performance optimisation for 10+ client projects.' },
      { year: '2020', title: 'Self-taught Web Development', place: 'Home', desc: 'Started learning HTML, CSS, and JavaScript. Built first projects, fell in love with the craft, and never looked back.' },
    ],
  },
}

async function readSettings(): Promise<DynamicSiteSettings> {
  try {
    const db = await getDb()
    const collection = db.collection('settings')
    const doc = await collection.findOne({ _id: 'site_settings' as unknown as undefined })

    if (!doc) return { ...DEFAULT_SETTINGS }

    const { _id, ...rest } = doc
    return {
      ...DEFAULT_SETTINGS,
      hero: { ...DEFAULT_SETTINGS.hero, ...(rest.hero ?? {}) },
      about: { ...DEFAULT_SETTINGS.about, ...(rest.about ?? {}) },
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
