import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getDb } from '@/lib/db'

interface ContactSubmission {
  id: string
  name: string
  email: string
  service: string
  budget: string
  message: string
  submittedAt: string
}

// ---------------------------------------------------------------------------
// Resend client — instantiated lazily so missing key only throws at request
// time (not at cold-start) and can be caught gracefully.
// ---------------------------------------------------------------------------
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

// The address that receives new-lead notifications.
// Priority: DB settings.contact.email → RESEND_TO_EMAIL env var → ADMIN_USERNAME
async function resolveToAddress(db: Awaited<ReturnType<typeof getDb>>): Promise<string> {
  try {
    const settings = await db.collection('settings').findOne({})
    const dbEmail: unknown = (settings as Record<string, unknown> | null)?.contact
    if (dbEmail && typeof dbEmail === 'object' && 'email' in dbEmail) {
      const e = (dbEmail as { email?: string }).email?.trim()
      if (e) return e
    }
  } catch {
    // fall through
  }
  return process.env.RESEND_TO_EMAIL ?? process.env.ADMIN_USERNAME ?? ''
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------
function ownerHtml(s: ContactSubmission): string {
  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:6px 0;color:#888;font-size:13px;width:110px;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:13px;color:#111">${value}</td></tr>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Contact Submission</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#f4a295;padding:24px 32px">
          <h1 style="margin:0;font-size:20px;color:#1a1a1a">New contact submission</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a99">${s.submittedAt}</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', s.name)}
            ${row('Email', `<a href="mailto:${s.email}" style="color:#f4a295">${s.email}</a>`)}
            ${row('Service', s.service)}
            ${row('Budget', s.budget)}
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="margin:0 0 8px;font-size:13px;color:#888">Message</p>
          <p style="margin:0;font-size:14px;color:#111;line-height:1.6;white-space:pre-wrap">${s.message.replace(/</g, '&lt;')}</p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#aaa">Reply directly to this email to respond to ${s.name}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function senderHtml(s: ContactSubmission, ownerName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Message received</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#f4a295;padding:24px 32px">
          <h1 style="margin:0;font-size:20px;color:#1a1a1a">Thanks for reaching out, ${s.name}!</h1>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.6">
            ${ownerName} has received your message and will get back to you as soon as possible — typically within 1–2 business days.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="margin:0 0 8px;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:.05em">Your message</p>
          <p style="margin:0;font-size:13px;color:#666;line-height:1.6;white-space:pre-wrap">${s.message.replace(/</g, '&lt;')}</p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#aaa">This is an automated confirmation. Please do not reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, service, budget, message } = body as {
      name?: string
      email?: string
      service?: string
      budget?: string
      message?: string
    }

    // Validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const submission: ContactSubmission = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      service: service?.trim() ?? '',
      budget: budget?.trim() ?? '',
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    }

    // 1. Persist to MongoDB (non-blocking on email failure)
    const db = await getDb()
    await db.collection('contacts').insertOne(submission)

    // 2. Send emails via Resend
    const toAddress = await resolveToAddress(db)
    if (toAddress) {
      try {
        const resend = getResend()
        const fromDomain = process.env.RESEND_FROM_DOMAIN?.trim()
        // Use a verified custom domain if configured, otherwise fall back to
        // the Resend shared testing address (works without domain verification).
        const fromAddress = fromDomain
          ? `Contact Form <noreply@${fromDomain}>`
          : 'Contact Form <onboarding@resend.dev>'

        // Derive owner's display name from the to-address for the auto-reply
        const ownerName = toAddress.split('@')[0] ?? 'Zihad'

        // Fire both emails in parallel — we don't want one failure to block the other
        await Promise.allSettled([
          // Notification to site owner
          resend.emails.send({
            from: fromAddress,
            to: [toAddress],
            reply_to: submission.email,
            subject: `New message from ${submission.name}${submission.service ? ` — ${submission.service}` : ''}`,
            html: ownerHtml(submission),
          }),
          // Auto-reply confirmation to sender
          resend.emails.send({
            from: fromAddress,
            to: [submission.email],
            subject: `Got your message — I'll be in touch soon`,
            html: senderHtml(submission, ownerName),
          }),
        ])
      } catch (emailErr) {
        // Email delivery failure must not fail the request — the submission is
        // already saved to the database.
        console.error('[contact POST] Resend error:', emailErr)
      }
    } else {
      console.warn('[contact POST] No recipient address configured — email skipped.')
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[contact POST]', err)
    return NextResponse.json({ error: 'Failed to save submission. Please try again.' }, { status: 500 })
  }
}
