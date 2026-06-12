import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Community Guidelines — Meetopia',
  description: 'Rules for respectful video dating and meeting on Meetopia.',
}

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage
      title="Community Guidelines"
      lastUpdated="June 2026"
      intro={
        <p>
          Meetopia is for adults 18+ who want real chemistry through live video — dating, new
          friends, and local meetups. Help keep it respectful and safe.
        </p>
      }
      sections={[
        {
          title: 'Be yourself (safely)',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Use accurate age and profile information.</li>
              <li>Do not impersonate others or use stolen photos.</li>
              <li>Keep prompts friendly and appropriate for a dating/meeting context.</li>
            </ul>
          ),
        },
        {
          title: 'Respect boundaries',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>No harassment, hate speech, threats, or bullying.</li>
              <li>Stop if someone asks to end the call or chat.</li>
              <li>Mutual Vibe is required before text chat — respect that flow.</li>
            </ul>
          ),
        },
        {
          title: 'No illegal or harmful content',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>No nudity or sexual content that violates our policies or law.</li>
              <li>No spam, scams, or solicitation for money.</li>
              <li>No sharing others&apos; private information (doxxing).</li>
            </ul>
          ),
        },
        {
          title: 'Adults only',
          body: (
            <p>
              You must be 18 or older. If you believe someone is underage, use{' '}
              <strong>Report → Underage user</strong> and leave the chat immediately.
            </p>
          ),
        },
        {
          title: 'Safety tools',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Report</strong> — flag behavior for review. See{' '}
                <Link href="/safety" className="text-blue-600 hover:underline">
                  Safety &amp; Reporting
                </Link>
                .
              </li>
              <li>
                <strong>Block</strong> — stop matching with that person on your device.
              </li>
              <li>
                <strong>Leave</strong> — exit any Chemistry Check at any time.
              </li>
            </ul>
          ),
        },
        {
          title: 'Enforcement',
          body: (
            <p>
              Reports are logged and reviewed by the Meetopia team. Repeat or severe violations may
              result in warnings, suspension, or bans when account systems are live. We do{' '}
              <strong>not</strong> use AI moderation or automatic video blur in the current MVP.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: (
            <p>
              Questions or appeals:{' '}
              <a href="mailto:support@meetopia.app" className="text-blue-600 hover:underline">
                support@meetopia.app
              </a>
            </p>
          ),
        },
      ]}
    />
  )
}
