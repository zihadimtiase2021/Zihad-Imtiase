import { PageShell } from '@/components/page-shell'
import { MapPin, Calendar, GraduationCap, Zap, Code2, Globe, Camera } from 'lucide-react'
import { readSettingsData } from '@/lib/data'

const TIMELINE = [
  {
    year: '2024',
    title: 'Senior Frontend Developer',
    place: 'Freelance — Global clients',
    desc: 'Scaling conversion-focused websites for SaaS products, e-commerce brands, and service businesses across the US, UK, and Bangladesh.',
  },
  {
    year: '2023',
    title: 'Webflow Expert Certification',
    place: 'Webflow University',
    desc: 'Achieved Webflow Expert status. Delivered 15+ Webflow projects ranging from marketing sites to complex CMS-driven platforms.',
  },
  {
    year: '2022',
    title: 'Started Freelancing Full-Time',
    place: 'Remote',
    desc: 'Transitioned from agency work to full-time freelancing. Built first Webflow client project — a SaaS landing page that 3x-ed their trial signups.',
  },
  {
    year: '2021',
    title: 'Frontend Developer',
    place: 'Web Agency, Dhaka',
    desc: 'Joined a Dhaka-based digital agency. Worked on React apps, responsive UIs, and performance optimisation for 10+ client projects.',
  },
  {
    year: '2020',
    title: 'Self-taught Web Development',
    place: 'Home',
    desc: 'Started learning HTML, CSS, and JavaScript. Built first projects, fell in love with the craft, and never looked back.',
  },
]

const STACK = [
  { name: 'React / Next.js', icon: Code2, level: 95 },
  { name: 'Webflow', icon: Globe, level: 98 },
  { name: 'TypeScript', icon: Code2, level: 88 },
  { name: 'TailwindCSS', icon: Zap, level: 96 },
  { name: 'Node.js', icon: Code2, level: 75 },
  { name: 'Figma', icon: Zap, level: 82 },
]

const VALUES = [
  {
    title: 'Results over aesthetics',
    desc: 'Beautiful design that does not convert is decoration. Every choice I make has a purpose tied to the business goal.',
  },
  {
    title: 'Communication first',
    desc: 'I send updates before clients ask. No surprises, no missed deadlines, no guessing.',
  },
  {
    title: 'Craft in the details',
    desc: 'Pixel-perfect typography, 60 fps animations, sub-2s load times — the details are where trust is built.',
  },
  {
    title: 'Long-term thinking',
    desc: 'I build codebases and design systems my clients can maintain and grow without coming back to me for every small change.',
  },
]

export default async function AboutPage() {
  const siteSettings = await readSettingsData()
  const aboutMedia: string[] = Array.isArray(siteSettings?.about?.media)
    ? siteSettings.about.media
    : []
  const primaryMedia = aboutMedia[0] ?? ''
  const extraMedia = aboutMedia.slice(1)
  const isVideo = (u: string) => /\.(mp4|webm|mov)$/i.test(u)

  return (
    <PageShell>
      {/* Page header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="font-bold text-lg text-foreground">About</h1>
        <p className="text-xs text-muted-foreground">Zihad Imtiase</p>
      </div>

      {/* --- Media / Banner section --- */}
      <div className="border-b border-border">
        {/* Primary media — full-width hero */}
        {primaryMedia ? (
          <div className="w-full overflow-hidden bg-black" style={{ aspectRatio: '16/9', maxHeight: 280 }}>
            {isVideo(primaryMedia) ? (
              <video
                src={primaryMedia}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={primaryMedia}
                alt="About section media"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          /* Placeholder when no media is uploaded */
          <div
            className="h-32 w-full relative overflow-hidden flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #f4a29518 0%, #e8806f12 60%, #f4a29506 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'radial-gradient(circle, #f4a295 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }}
            />
            <Camera size={22} className="relative z-10" style={{ color: '#f4a29560' }} />
            <p className="relative z-10 text-[11px] text-muted-foreground/50">
              Upload about media in Data Management → Site Settings
            </p>
          </div>
        )}

        {/* Extra media — horizontal scroll strip */}
        {extraMedia.length > 0 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
            {extraMedia.map((url, i) => (
              <div
                key={url + i}
                className="shrink-0 rounded-xl overflow-hidden border border-border bg-muted"
                style={{ width: 80, height: 60 }}
              >
                {isVideo(url) ? (
                  <video src={url} muted autoPlay loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Name + title */}
        <div className="px-5 pt-4 pb-5">
          <h2 className="font-bold text-xl text-foreground">Zihad Imtiase</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Frontend Developer &amp; Webflow Specialist
          </p>
        </div>
      </div>

      {/* Intro section */}
      <div className="px-5 py-6 border-b border-border">
        <p className="text-sm text-foreground leading-relaxed mb-4">
          I help startups, agencies, and growing businesses turn their ideas into
          high-performing websites. My focus is always the same: websites that look
          great <em>and</em> drive measurable results — more leads, more sign-ups,
          more revenue.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Based in Dhaka Cantonment, Bangladesh. Working with clients worldwide since
          March 2022. When I am not building, I am writing about frontend development
          and conversion optimisation.
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} style={{ color: '#f4a295' }} />
            Dhaka Cantonment, Bangladesh
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} style={{ color: '#f4a295' }} />
            Joined March 2022
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap size={12} style={{ color: '#f4a295' }} />
            Self-taught + Webflow Certified
          </span>
        </div>
      </div>

      {/* Values */}
      <div className="px-5 py-6 border-b border-border">
        <h2 className="font-bold text-base text-foreground mb-4">How I work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="p-4 rounded-2xl border border-border bg-card hover:border-[#f4a295]/40 transition-colors"
            >
              <p className="font-semibold text-sm text-foreground mb-1">{v.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="px-5 py-6 border-b border-border">
        <h2 className="font-bold text-base text-foreground mb-4">Tech stack</h2>
        <div className="flex flex-col gap-3">
          {STACK.map(({ name, level }) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{level}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${level}%`, backgroundColor: '#f4a295' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-6">
        <h2 className="font-bold text-base text-foreground mb-5">Journey</h2>
        <div className="relative flex flex-col gap-0">
          {TIMELINE.map((item, i) => (
            <div key={item.year} className="flex gap-4">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10"
                  style={{ backgroundColor: '#f4a29520', color: '#f4a295', border: '2px solid #f4a295' }}
                >
                  {item.year.slice(2)}
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className="w-px flex-1 my-1" style={{ backgroundColor: '#f4a29530' }} />
                )}
              </div>

              {/* Content */}
              <div className="pb-6 flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">{item.year}</p>
                <p className="font-semibold text-sm text-foreground">{item.title}</p>
                <p className="text-xs font-medium mb-1.5" style={{ color: '#f4a295' }}>
                  {item.place}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
