import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

/**
 * GET /api/technologies
 * Returns a deduplicated, sorted list of all technology tags
 * aggregated from every existing portfolio project.
 */
export async function GET() {
  try {
    const db = await getDb()
    const projects = await db
      .collection('portfolio')
      .find({}, { projection: { tech: 1, _id: 0 } })
      .toArray()

    const set = new Set<string>()
    for (const p of projects) {
      if (Array.isArray(p.tech)) {
        for (const t of p.tech) {
          if (t && typeof t === 'string') set.add(t.trim())
        }
      }
    }

    const technologies = Array.from(set).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    )

    return NextResponse.json({ technologies })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch technologies' }, { status: 500 })
  }
}
