'use client'

import { useRef, useState } from 'react'
import { PageShell } from '@/components/page-shell'
import { Mail, MapPin, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'

const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    label: 'WhatsApp',
    value: '+880 1XXX-XXXXXX',
    href: 'https://wa.me/880',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'zihadimtiase@gmail.com',
    href: 'mailto:zihadimtiase@gmail.com',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Dhaka Cantonment, Bangladesh',
    href: null,
  },
]

const SERVICES = [
  'Landing Page Design & Development',
  'Webflow Development',
  'React / Next.js App',
  'CRO Audit & Redesign',
  'Design System',
  'Other',
]

type FormState = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [service, setService] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('sending')
    setErrorMsg('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      service,
      budget: (form.elements.namedItem('budget') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
        setFormState('error')
      } else {
        setFormState('sent')
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setFormState('error')
    }
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="font-bold text-lg text-foreground">Contact</h1>
        <p className="text-xs text-muted-foreground">Let&apos;s build something great</p>
      </div>

      {/* Intro */}
      <div className="px-5 py-6 border-b border-border">
        <h2 className="font-bold text-xl text-foreground mb-2 text-pretty">
          Got a project in mind?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          I am currently available for freelance work. Whether you need a landing page,
          a Webflow site, or a full React app — drop me a message and I will get back to
          you within 24 hours.
        </p>
      </div>

      {/* Contact options */}
      <div className="px-5 py-5 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Reach me directly
        </h3>
        <div className="flex flex-col gap-2">
          {CONTACT_OPTIONS.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#f4a29520' }}
              >
                <Icon size={16} style={{ color: '#f4a295' }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:underline transition-colors truncate block"
                    style={{ textDecorationColor: '#f4a295' }}
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-foreground truncate">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="px-5 py-6">
        {formState === 'sent' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <CheckCircle size={40} style={{ color: '#f4a295' }} />
            <h3 className="font-bold text-lg text-foreground">Message sent!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Thanks for reaching out. I will reply within 24 hours.
            </p>
            <button
              onClick={() => { setFormState('idle'); setErrorMsg('') }}
              className="mt-2 text-sm font-semibold transition-colors"
              style={{ color: '#f4a295' }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Send a message
            </h3>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': '#f4a295' } as React.CSSProperties}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': '#f4a295' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Service */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-foreground">
                What do you need?
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setService(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                    style={
                      service === s
                        ? { backgroundColor: '#f4a295', color: '#1a1a1a', borderColor: '#f4a295' }
                        : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="budget" className="text-xs font-medium text-foreground">
                Budget (USD)
              </label>
              <select
                id="budget"
                className="px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': '#f4a295' } as React.CSSProperties}
              >
                <option value="">Select a range</option>
                <option>Under $500</option>
                <option>$500 – $1,500</option>
                <option>$1,500 – $5,000</option>
                <option>$5,000+</option>
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-xs font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                placeholder="Tell me about your project..."
                className="px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 transition-all leading-relaxed"
                style={{ '--tw-ring-color': '#f4a295' } as React.CSSProperties}
              />
            </div>

            {formState === 'error' && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={formState === 'sending'}
              onClick={() => formState === 'error' && setFormState('idle')}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
              style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
            >
              {formState === 'sending' ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black/80 animate-spin" />
                  Sending…
                </span>
              ) : (
                <>
                  <Send size={15} />
                  Send message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  )
}
