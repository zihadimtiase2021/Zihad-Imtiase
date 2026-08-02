import { Suspense } from 'react'
import { PageShell } from '@/components/page-shell'
import { readSettingsData } from '@/lib/data'
import { ContactClient } from '@/components/contact-client'

export default async function ContactPage() {
  // Vercel Build Error Fix: Typecasting as any
  const siteSettings = (await readSettingsData()) as any
  
  // সেটিংসে ডাটা না থাকলে সেফ ফলব্যাক দেওয়া হলো
  const contactData = siteSettings?.contact || {
    email: '',
    phone: '',
    address: '',
    shortText: '',
    socials: []
  }

  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="p-4 space-y-4">
            <div className="animate-pulse rounded-2xl bg-muted h-32 w-full" />
            <div className="animate-pulse rounded-2xl bg-muted h-64 w-full" />
          </div>
        </PageShell>
      }
    >
      <ContactClient contactData={contactData} />
    </Suspense>
  )
}
