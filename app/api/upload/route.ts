import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { isAuthenticated } from '@/lib/auth'

// App Router route handlers stream the body
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    // File অবজেক্টটিকে Buffer এবং Base64 Data URI-তে রূপান্তর করা হচ্ছে
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileUri = `data:${file.type};base64,${buffer.toString('base64')}`

    // Cloudinary-তে আপলোড করা হচ্ছে (resource_type: 'auto' দিলে ছবি, ভিডিও বা অডিও নিজ থেকেই ডিটেক্ট করে)
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        fileUri,
        {
          resource_type: 'auto',
          folder: 'zihad_portfolio_media', // ক্লাউডিনারিতে এই নামে ফোল্ডার তৈরি হয়ে সেভ হবে
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
    }) as { secure_url: string }

    // সফলভাবে আপলোড হলে ক্লাউডের লাইভ URL রিটার্ন করা হবে
    return NextResponse.json({ success: true, url: result.secure_url }, { status: 201 })
  } catch (error) {
    console.error('[upload] error:', error)
    return NextResponse.json(
      { error: 'File upload failed. Please check Cloudinary credentials and try again.' },
      { status: 500 },
    )
  }
}
