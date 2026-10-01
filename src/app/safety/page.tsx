import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Safety & Reporting — Meetopia',
  description: 'How reporting, blocking, and safety review work in the Meetopia closed beta.',
}

export default function SafetyPage() {
  return (
    <LegalPage
      title="Safety & Reporting"
      lastUpdated="September 30, 2026"
      intro={
        <p>
          Meetopia is for adults 18+. The closed beta includes leave, report, and block controls.
          Reports are saved for manual review; Meetopia does not claim to automatically detect
          inappropriate live video.
        </p>
      }
      sections={[
        {
          title: 'In-call safety controls',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Leave / Next</strong> — end the current interaction immediately.</li>
              <li><strong>Report</strong> — choose a reason and add details. The app shows an error if the report cannot be saved.</li>
              <li><strong>Block</strong> — prevents future Chemistry Check matching with that account and removes the saved Connection.</li>
            </ul>
          ),
        },
        {
          title: 'Report categories',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Inappropriate behavior</li>
              <li>Harassment</li>
              <li>Nudity or sexual content</li>
              <li>Hate or threats</li>
              <li>Spam or scam</li>
              <li>Appears underage</li>
              <li>Other</li>
            </ul>
          ),
        },
        {
          title: 'What happens after a report',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>The report is stored in Meetopia&apos;s application database with the reporter, reported account, reason, details, status, and timestamp.</li>
              <li>Meetopia attempts to send a moderator notification email for each newly saved report.</li>
              <li>Reports are reviewed manually during the beta.</li>
              <li>If there is immediate danger, contact local emergency services. Meetopia is not an emergency service.</li>
            </ul>
          ),
        },
        {
          title: 'Blocking and evidence',
          body: (
            <p>
              Blocking is tied to your Meetopia account and keeps the blocked account out of future
              Chemistry Check matching. The current beta may remove the saved Connection and its
              visible conversation when you block. A separately submitted safety report remains a
              distinct database record for review.
            </p>
          ),
        },
        {
          title: 'No automatic detection',
          body: (
            <p>
              Meetopia does not currently provide automatic nudity detection, AI video moderation,
              24/7 human monitoring of every live call, identity verification, or background checks.
              A report button means you are choosing to flag an interaction; it does not mean the
              system detected a violation.
            </p>
          ),
        },
        {
          title: 'Adults only',
          body: (
            <p>
              You must be 18 or older. If someone appears to be underage, leave the interaction and
              report the account using <strong>Appears underage</strong>.
            </p>
          ),
        },
        {
          title: 'Community standards',
          body: (
            <p>
              See the{' '}
              <Link href="/community-guidelines" className="text-blue-600 hover:underline">
                Community Guidelines
              </Link>{' '}
              for behavioral rules.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: <p>Safety concerns outside the in-app flow: <ContactEmail /></p>,
        },
      ]}
    />
  )
}
