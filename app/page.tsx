import { Suspense } from 'react'
import { PageShell } from '@/components/page-shell'
import { readFeedData, readSettingsData } from '@/lib/data'
import { HomeClient } from '@/components/home-client'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [feedData, settingsData] = await Promise.all([
    readFeedData(),
    readSettingsData(),
  ])

  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="p-4 space-y-4">
            <div className="animate-pulse rounded-2xl bg-muted h-64 w-full" />
            <div className="animate-pulse rounded-2xl bg-muted h-32 w-full" />
          </div>
        </PageShell>
      }
    >
      {/* ডাটাগুলো props হিসেবে Client Component এ পাঠানো হচ্ছে */}
      <HomeClient
        initialItems={feedData.items}
        heroData={settingsData?.hero ?? {}}
        contactData={settingsData?.contact ?? {}}
      />
    </Suspense>
  )
}
