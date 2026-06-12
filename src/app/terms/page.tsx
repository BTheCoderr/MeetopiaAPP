import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Meetopia',
  description: 'Terms governing use of Meetopia video dating and meeting features.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="June 2026"
      intro={
        <p>
          By using Meetopia, you agree to these Terms and our{' '}
          <Link href="/community-guidelines" className="text-blue-600 hover:underline">
            Community Guidelines
          </Link>
          .
        </p>
      }
      sections={[
        {
          title: 'Eligibility',
          body: (
            <p>
              You must be <strong>18 years or older</strong> to use Meetopia. By using the service,
              you represent that you meet this requirement.
            </p>
          ),
        },
        {
          title: 'The service',
          body: (
            <p>
              Meetopia provides video-first dating and meeting features, including live Chemistry
              Checks, intent-based matching, and optional text chat after mutual Vibe. Features may
              change during beta releases.
            </p>
          ),
        },
        {
          title: 'Your responsibilities',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate profile information.</li>
              <li>Do not impersonate others or misrepresent your identity.</li>
              <li>Follow our Community Guidelines and applicable laws.</li>
            </ul>
          ),
        },
        {
          title: 'Prohibited conduct',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Harassment, threats, hate speech, or harm toward other users.</li>
              <li>Illegal content, including sexual content involving minors.</li>
              <li>Spam, scams, or unsolicited solicitation for money.</li>
              <li>Disrupting the service or unauthorized access to systems.</li>
            </ul>
          ),
        },
        {
          title: 'User-generated content',
          body: (
            <p>
              You retain ownership of content you submit. You grant Meetopia a limited license to
              display profile and message content as needed to operate the service (for example,
              showing your profile card to a match).
            </p>
          ),
        },
        {
          title: 'Safety',
          body: (
            <p>
              Meetopia includes reporting, blocking, and leave controls. See our{' '}
              <Link href="/safety" className="text-blue-600 hover:underline">
                Safety &amp; Reporting
              </Link>{' '}
              page for how reports are handled. We do not guarantee continuous monitoring of live
              video.
            </p>
          ),
        },
        {
          title: 'Termination',
          body: (
            <p>
              We may suspend or terminate access for violations. You may stop using Meetopia at any
              time and delete local profile data from Settings in the mobile app.
            </p>
          ),
        },
        {
          title: 'Disclaimers',
          body: (
            <p>
              Meetopia is provided &quot;as is&quot; without warranties. We do not guarantee matches,
              compatibility, or uninterrupted service. Live video involves other users — use caution
              and report concerns.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: (
            <p>
              Questions:{' '}
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
