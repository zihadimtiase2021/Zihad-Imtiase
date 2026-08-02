/**
 * Centralized TypeScript interfaces — single source of truth.
 * Import from here instead of redefining in individual components/routes.
 */

// ── Feed ─────────────────────────────────────────────────────────────────────

export interface FeedItem {
  id: string
  type: 'article' | 'testimonial' | 'project' | 'post'
  title: string
  excerpt: string
  content: string
  category: string
  image?: string
  media?: string[]
  author: string
  clientName?: string
  clientRole?: string
  clientImage?: string
  date: string
  likes: number
  replies: number
  rating?: number
  tech?: string[]
  link?: string
  featured?: boolean
  linkedProjectId?: string
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export interface ContentBlock {
  id: string
  type: 'paragraph' | 'heading' | 'image' | 'divider'
  text?: string
  url?: string
  caption?: string
}

export interface Project {
  id: string
  title: string
  category: string
  description: string
  tech: string[]
  results: Record<string, string>
  link?: string
  github?: string
  image?: string
  images?: string[]
  content?: ContentBlock[]
  featured: boolean
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface TimelineItem {
  year: string
  title: string
  place: string
  desc: string
}

export interface StackItem {
  name: string
  level: number
}

export interface ValueItem {
  title: string
  desc: string
}

export interface SocialItem {
  platform: string
  url: string
}

export interface HeroSettings {
  coverMedia: string
  profileMedia: string
  name: string
  title: string
  bio: string
  tags: string[]
  location: string
  joinDate: string
  stats: { value: string; label: string }[]
  hireMeLink: string
}

export interface AboutSettings {
  media: string[]
  introText: string
  timeline: TimelineItem[]
  stack: StackItem[]
  values: ValueItem[]
}

export interface ContactSettings {
  email: string
  phone: string
  address: string
  shortText: string
  socials: SocialItem[]
}

export interface MetaSettings {
  title: string
  description: string
  favicon: string
}

export interface SiteSettings {
  hero: HeroSettings
  about: AboutSettings
  contact: ContactSettings
  meta: MetaSettings
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthStatus {
  authenticated: boolean
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = undefined> {
  success: boolean
  error?: string
  data?: T
}

export interface FeedApiResponse {
  items: FeedItem[]
}

export interface PortfolioApiResponse {
  projects: Project[]
}
