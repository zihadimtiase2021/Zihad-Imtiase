import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await cloudinary.search
      .expression('folder:zihad_portfolio_media')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute()

    return NextResponse.json({ success: true, resources: result.resources })
  } catch (error) {
    console.error('[media GET error]', error)
    return NextResponse.json({ error: 'Failed to fetch media from Cloudinary' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { public_id, resource_type } = await request.json()

    if (!public_id) {
      return NextResponse.json({ success: false, error: 'Public ID is required' }, { status: 400 })
    }

    // Cloudinary থেকে ফাইল ডিলিট করা
    await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type || 'image',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[media DELETE error]', error)
    return NextResponse.json({ success: false, error: 'Failed to delete media from Cloudinary' }, { status: 500 })
  }
}
