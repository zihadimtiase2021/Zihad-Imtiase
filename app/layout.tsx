import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zihadimtiase.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Zihad Imtiase — Frontend & Webflow Developer',
    template: '%s | Zihad Imtiase',
  },
  description:
    'Frontend Web Developer and Webflow specialist crafting high-converting websites. Based in Dhaka, Bangladesh.',
  keywords: [
    'frontend developer',
    'webflow developer',
    'react',
    'landing page',
    'web design',
    'Bangladesh',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Zihad Imtiase',
    title: 'Zihad Imtiase — Frontend & Webflow Developer',
    description:
      'Frontend Web Developer and Webflow specialist crafting high-converting websites.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zihad Imtiase — Frontend & Webflow Developer',
    description:
      'Frontend Web Developer and Webflow specialist crafting high-converting websites.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f9f9' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Synchronous theme script using Next.js Script component */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zd-theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){}})()`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}