import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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
    const file = formData.get('file') as File
    const targetFormat = formData.get('format') as string // 'webp' | 'avif' | 'original'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Check if the uploaded file is an image
    const isImage = file.type.startsWith('image/')

    const uploadOptions: UploadApiOptions = {
      folder: 'zihad_portfolio_media',
      resource_type: 'auto',
    }

    // Apply format conversion and quality compression ONLY if it's an image
    // and user didn't select 'original'
    if (isImage && targetFormat && targetFormat !== 'original') {
      uploadOptions.format = targetFormat
      uploadOptions.quality = 'auto' // Cloudinary intelligent compression
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
      stream.end(buffer)
    })

    return NextResponse.json({ success: true, url: (result as any).secure_url })
  } catch (error) {
    console.error('[Upload API Error]', error)
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
  }
}
