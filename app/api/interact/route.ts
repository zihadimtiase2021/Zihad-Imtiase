import { NextRequest, NextResponse } from 'next/server'
import { incrementFeedItemLikes } from '@/lib/data-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, action } = body as { postId?: string; action?: string }

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    if (action === 'like') {
      const result = await incrementFeedItemLikes(postId)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, likes: result.likes })
    }

    // Unknown action — no-op success so optimistic UI works for future actions
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to process interaction' }, { status: 500 })
  }
}
