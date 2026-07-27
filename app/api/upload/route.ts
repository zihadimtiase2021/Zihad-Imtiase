import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { isAuthenticated } from '@/lib/auth'

// App Router route handlers stream the body, so no bodyParser config is needed.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg',
      'audio/wav',
      'audio/aac',
      'audio/flac',
      'audio/x-m4a',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: "${file.type}". Allowed: images (JPEG, PNG, GIF, WebP), videos (MP4, WebM), and audio (MP3, OGG, WAV, AAC, FLAC).`,
        },
        { status: 400 },
      )
    }

    // Validate file size (max 50 MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds the 50 MB limit.' },
        { status: 400 },
      )
    }

    // Build a safe, unique filename
    const ext = path.extname(file.name) || ''
    const safeName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 60)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${random}-${safeName}${ext}`

    // Ensure the uploads directory exists (sync — runs once per cold start)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Write the file
    const filePath = path.join(uploadsDir, filename)
    const arrayBuffer = await file.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

    const publicUrl = `/uploads/${filename}`
    return NextResponse.json({ success: true, url: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('[upload] error:', error)
    return NextResponse.json(
      { error: 'File upload failed. Please try again.' },
      { status: 500 },
    )
  }
}
