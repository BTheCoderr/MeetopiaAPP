import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support — Meetopia',
  description: 'Support for Meetopia accounts, live video, safety, and data requests.',
}

export default function SupportPage() {
  return (
    <LegalPage
      title="Support & Contact"
      lastUpdated="September 30, 2026"
      intro={
        <p>
          Get help with your Meetopia account, Chemistry Checks, Connections, safety reports, or
          data requests during the closed web beta.
        </p>
      }
      sections={[
        {
          title: 'Contact',
          body: (
            <p>
              Email <ContactEmail /> with enough detail for us to understand the issue. Do not send
              passwords or other people&apos;s private information.
            </p>
          ),
        },
        {
          title: 'Safety and reporting',
          body: (
            <p>
              Use the in-app <strong>Report</strong> control when reporting another account. If the
              report form fails, it will show an error rather than claiming success. For follow-up,
              contact <ContactEmail /> and include the approximate date and time of the interaction.
              See{' '}
              <Link href="/safety" className="text-blue-600 hover:underline">
                Safety &amp; Reporting
              </Link>.
            </p>
          ),
        },
        {
          title: 'Account and password help',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Use <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">Forgot password</Link> to request a reset link.</li>
              <li>You can sign out from the Meetopia navigation on signed-in pages.</li>
              <li>If a reset link is expired or invalid, request a new one from the forgot-password page.</li>
            </ul>
          ),
        },
        {
          title: 'Delete your account',
          body: (
            <p>
              In-app deletion is not yet available in the closed beta. To request deletion, email
              <ContactEmail /> from the email address on your Meetopia account and ask us to delete
              the account. Safety, security, or legal records may need to be retained where required.
            </p>
          ),
        },
        {
          title: 'Video connection help',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Allow camera and microphone access in your browser.</li>
              <li>Try a stable Wi-Fi or cellular connection and reload after a network interruption.</li>
              <li>Some strict networks may not connect reliably until Meetopia adds a managed TURN service.</li>
            </ul>
          ),
        },
        {
          title: 'Policies',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li><Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link></li>
              <li><Link href="/community-guidelines" className="text-blue-600 hover:underline">Community Guidelines</Link></li>
              <li><Link href="/safety" className="text-blue-600 hover:underline">Safety &amp; Reporting</Link></li>
            </ul>
          ),
        },
      ]}
    />
  )
}
