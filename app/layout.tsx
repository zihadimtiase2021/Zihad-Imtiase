import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import { readSettingsData } from '@/lib/data'
import { QuickCompose } from '@/components/quick-compose'
import './globals.css'

// Settings fetch is cached by Next.js fetch caching — no force-dynamic needed here.
// Individual pages that need real-time data can opt into dynamic rendering themselves.

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zihadimtiase.com'

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = (await readSettingsData()) as any
  const meta = siteSettings?.meta || {}
  
  const title = meta.title || 'Zihad Imtiase — Frontend & Webflow Developer'
  const description = meta.description || 'Frontend Web Developer and Webflow specialist crafting high-converting websites. Based in Dhaka, Bangladesh.'
  const faviconUrl = meta.favicon || undefined

  return {
    metadataBase: new URL(BASE_URL),
    title: { default: title, template: `%s | ${title.split('—')[0].trim()}` },
    description: description,
    keywords: ['frontend developer', 'webflow developer', 'react', 'landing page', 'web design', 'Bangladesh'],
    icons: faviconUrl ? { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl } : undefined,
    openGraph: { type: 'website', locale: 'en_US', url: BASE_URL, siteName: title.split('—')[0].trim(), title: title, description: description },
    twitter: { card: 'summary_large_image', title: title, description: description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f9f9' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zd-theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){}})()`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        
        {/* ২. এখানে QuickCompose কম্পোনেন্টটি বসিয়ে দিন */}
        <QuickCompose />
        
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
