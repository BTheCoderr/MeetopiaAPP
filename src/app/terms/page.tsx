import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Meetopia',
  description: 'Terms governing the current Meetopia closed web beta.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="September 30, 2026"
      intro={
        <p>
          These Terms apply to the current Meetopia closed web beta. By using Meetopia, you agree to
          these Terms and our{' '}
          <Link href="/community-guidelines" className="text-blue-600 hover:underline">
            Community Guidelines
          </Link>.
        </p>
      }
      sections={[
        {
          title: 'Eligibility',
          body: (
            <p>
              You must be <strong>18 years or older</strong> to use Meetopia. Meetopia requires an
              18+ confirmation before starting a Chemistry Check.
            </p>
          ),
        },
        {
          title: 'The service',
          body: (
            <p>
              Meetopia provides live video Chemistry Checks, mutual Vibes, saved Connections,
              messaging, and direct calls between Connections. The service is in beta, so features
              may change, be unavailable, or be limited while we test reliability and safety.
            </p>
          ),
        },
        {
          title: 'Your account',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate account information and keep your password private.</li>
              <li>Do not share or transfer your account to another person.</li>
              <li>You are responsible for activity performed through your account until you sign out or the session is ended.</li>
            </ul>
          ),
        },
        {
          title: 'Respect and prohibited conduct',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>No harassment, threats, hate speech, stalking, or bullying.</li>
              <li>No sexual content involving minors or any other illegal content.</li>
              <li>No scams, spam, fraud, impersonation, or solicitation for money.</li>
              <li>No attempts to bypass blocks, access other accounts, interfere with signaling, or abuse Meetopia systems.</li>
            </ul>
          ),
        },
        {
          title: 'Content and communications',
          body: (
            <p>
              You keep ownership of content you submit. You allow Meetopia to process profile
              information, messages, and safety reports as necessary to provide, secure, and moderate
              the service. Live video and audio are not intentionally recorded by Meetopia.
            </p>
          ),
        },
        {
          title: 'Safety',
          body: (
            <p>
              You can leave, report, or block during the product flow. Reports are reviewed manually
              during the beta. Meetopia does not guarantee that every user is who they claim to be,
              does not run background checks, and does not continuously monitor live calls. See{' '}
              <Link href="/safety" className="text-blue-600 hover:underline">
                Safety &amp; Reporting
              </Link>.
            </p>
          ),
        },
        {
          title: 'Account access and beta removal',
          body: (
            <p>
              Meetopia may restrict or remove beta access for violations of these Terms, safety
              concerns, abuse, security risks, or legal requirements. You may stop using Meetopia at
              any time and sign out. In-app account deletion is not yet available; deletion requests
              can be sent to <ContactEmail />.
            </p>
          ),
        },
        {
          title: 'Availability and disclaimers',
          body: (
            <p>
              Meetopia is provided on a beta, &quot;as is&quot; basis. We do not guarantee matches,
              compatibility, uninterrupted service, successful WebRTC connectivity, or that another
              participant will behave safely. Use your judgment and leave or report an interaction
              when appropriate.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: <p>Questions about these Terms: <ContactEmail /></p>,
        },
      ]}
    />
  )
}
