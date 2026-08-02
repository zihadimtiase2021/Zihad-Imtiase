import { Suspense } from 'react'
import { PageShell } from '@/components/page-shell'
import { readFeedData, readSettingsData } from '@/lib/data'
import { HomeClient } from '@/components/home-client'

// এই লাইনটি Next.js কে ক্যাশ করতে নিষেধ করবে (Real-time updates)
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // সার্ভারে সরাসরি ডাটাবেস ফাংশন কল হচ্ছে (API রিকোয়েস্ট বাইপাস করে)
  // টাইপস্ক্রিপ্ট বাইপাস করার জন্য as any ব্যবহার করা হলো
  const [feedData, settingsData] = await Promise.all([
    readFeedData(),
    readSettingsData() as any,
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
      />
    </Suspense>
  )
}