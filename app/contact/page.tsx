import { Suspense } from 'react'
import { PageShell } from '@/components/page-shell'
import { readSettingsData } from '@/lib/data'
import { ContactClient } from '@/components/contact-client'

// এই লাইনটি Next.js কে ক্যাশ করতে নিষেধ করবে (Real-time updates)
export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const siteSettings = (await readSettingsData()) as any
  
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