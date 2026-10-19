import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Community Guidelines — Meetopia',
  description: 'Rules for respectful conversation-first dating on Meetopia.',
}

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage
      title="Community Guidelines"
      lastUpdated="September 30, 2026"
      intro={
        <p>
          Meetopia is an 18+ conversation-first dating service. Treat every Chemistry Check and
          Connection as a real interaction with another person.
        </p>
      }
      sections={[
        {
          title: 'Be truthful',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Use your own account and do not impersonate another person.</li>
              <li>Do not misrepresent your age or identity.</li>
              <li>Do not use Meetopia if you are under 18.</li>
            </ul>
          ),
        },
        {
          title: 'Respect boundaries',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>No harassment, threats, hate speech, stalking, or bullying.</li>
              <li>Stop when someone ends a call, declines, blocks, or asks you to stop contacting them.</li>
              <li>Do not attempt to bypass a block or re-enter another person&apos;s session.</li>
            </ul>
          ),
        },
        {
          title: 'No illegal, exploitative, or abusive content',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>No sexual content involving minors.</li>
              <li>No scams, fraud, spam, or solicitation for money.</li>
              <li>No sharing another person&apos;s private information without permission.</li>
              <li>No content or conduct that violates applicable law.</li>
            </ul>
          ),
        },
        {
          title: 'Use the safety controls',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Leave / Next</strong> when you do not want to continue an interaction.</li>
              <li><strong>Report</strong> behavior that should be reviewed by the Meetopia team.</li>
              <li><strong>Block</strong> an account you do not want to encounter again.</li>
            </ul>
          ),
        },
        {
          title: 'How enforcement works in the beta',
          body: (
            <p>
              Reports are reviewed manually. Meetopia may remove a participant from the closed beta
              or restrict access when conduct violates these Guidelines, creates a safety risk, or
              threatens the service. Meetopia does not claim to automatically detect violations in
              live video.
            </p>
          ),
        },
        {
          title: 'More safety information',
          body: (
            <p>
              Read{' '}
              <Link href="/safety" className="text-blue-600 hover:underline">
                Safety &amp; Reporting
              </Link>{' '}
              for details about reports and blocking.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: <p>Questions or safety follow-up: <ContactEmail /></p>,
        },
      ]}
    />
  )
}
