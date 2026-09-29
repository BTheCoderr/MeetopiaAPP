import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Safety & Reporting — Meetopia',
  description: 'How Meetopia handles reports, blocking, and moderation.',
}

export default function SafetyPage() {
  return (
    <LegalPage
      title="Safety & Reporting"
      lastUpdated="June 2026"
      intro={
        <p>
          Meetopia is for adults 18+. We provide tools to report, block, and leave any Chemistry
          Check. Reports are logged and reviewed by our team.
        </p>
      }
      sections={[
        {
          title: 'In-app safety controls',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Report</strong> — choose a category and submit during a live Chemistry Check.
              </li>
              <li>
                <strong>Block</strong> — immediately end the relationship, remove the saved Connection
                and private messages, and prevent future Chemistry Check matching.
              </li>
              <li>
                <strong>Leave</strong> — exit any call at any time.
              </li>
            </ul>
          ),
        },
        {
          title: 'Report categories',
          body: (
            <ol className="list-decimal pl-5 space-y-1">
              <li>Nudity or sexual content</li>
              <li>Harassment</li>
              <li>Hate or threats</li>
              <li>Spam or scam</li>
              <li>Underage user</li>
              <li>Other</li>
            </ol>
          ),
        },
        {
          title: 'What happens after you report',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Your report is stored in our database (Supabase) with category, timestamp, and session info.</li>
              <li>Our team is notified by email for review.</li>
              <li>Underage reports are prioritized when triaged.</li>
              <li>Leave the chat if you feel unsafe — you are not required to stay.</li>
            </ul>
          ),
        },
        {
          title: 'Blocking',
          body: (
            <p>
              Blocks are tied to your authenticated Meetopia account. Blocking removes the saved
              Connection and conversation between the two accounts and keeps that person out of your
              future Chemistry Check matching. You can review and unblock people later from Profile
              → Blocked users.
            </p>
          ),
        },
        {
          title: 'What we do not provide (MVP)',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>AI video moderation or automatic nudity detection</li>
              <li>Automatic video blur</li>
              <li>24/7 human monitoring of every live call</li>
              <li>Background checks or verified-user badges</li>
            </ul>
          ),
        },
        {
          title: 'Age requirement',
          body: (
            <p>
              Meetopia requires 18+ confirmation before use. Report suspected underage users
              immediately via Report → Underage user.
            </p>
          ),
        },
        {
          title: 'Community standards',
          body: (
            <p>
              See our{' '}
              <Link href="/community-guidelines" className="text-blue-600 hover:underline">
                Community Guidelines
              </Link>{' '}
              for full rules.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: (
            <p>
              Safety concerns: <ContactEmail />
            </p>
          ),
        },
      ]}
    />
  )
}
