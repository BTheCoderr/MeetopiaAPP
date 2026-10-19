import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'

export const metadata: Metadata = {
  title: 'Privacy Policy — Meetopia',
  description: 'How Meetopia collects, uses, stores, and shares data for its closed web beta.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="September 30, 2026"
      intro={
        <p>
          Meetopia is an 18+ conversation-first video dating service. This policy describes the
          current server-backed web beta: what information we use, how live video works, which
          service providers help operate Meetopia, and how to request deletion.
        </p>
      }
      sections={[
        {
          title: 'Information you provide',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account:</strong> email address, username, password credential, and optional display name.</li>
              <li><strong>Profile:</strong> optional bio and interests.</li>
              <li><strong>Age confirmation:</strong> the time you confirm that you are 18 or older.</li>
              <li><strong>Connections and communication:</strong> mutual Vibes, saved Connections, messages, read state, and related notifications.</li>
              <li><strong>Safety and support:</strong> blocks, reports, report details, and feedback you choose to submit.</li>
            </ul>
          ),
        },
        {
          title: 'Account and security data',
          body: (
            <p>
              Meetopia stores a bcrypt password hash rather than your plain-text password. Session
              records are stored server-side and the browser receives an HTTP-only session cookie.
              Password-reset tokens are stored only as hashes and expire after a limited period.
            </p>
          ),
        },
        {
          title: 'Camera, microphone, and live video',
          body: (
            <p>
              Camera and microphone access is used for live Chemistry Checks and calls with saved
              Connections. WebRTC sends live audio and video directly between participants where
              network conditions allow. Meetopia&apos;s signaling service coordinates the call. We do
              not intentionally record or store the live audio or video stream on Meetopia servers.
            </p>
          ),
        },
        {
          title: 'Operational data',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Session and socket identifiers used for authenticated matching and signaling.</li>
              <li>Last-seen and presence information used to support Connections and calls.</li>
              <li>Basic server logs and error information needed to operate, secure, and troubleshoot the service.</li>
              <li>Network information necessarily visible to hosting, signaling, STUN, and peer-to-peer networking services.</li>
            </ul>
          ),
        },
        {
          title: 'Service providers',
          body: (
            <p>
              Meetopia currently uses Netlify to host the web app, Render for realtime signaling,
              Supabase-hosted PostgreSQL for application data, Resend for transactional and safety
              notification email, and Google STUN infrastructure to help WebRTC establish network
              connections. These providers process data only as needed to provide their respective
              services and are subject to their own terms and privacy practices.
            </p>
          ),
        },
        {
          title: 'Safety reports',
          body: (
            <p>
              In-app reports are stored in Meetopia&apos;s database with the reporting account, reported
              account, reason, details, status, and timestamp. Meetopia also attempts to send a
              moderator notification email when a report is submitted. A failed notification email
              does not delete the saved report.
            </p>
          ),
        },
        {
          title: 'What we do not do',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not sell personal information.</li>
              <li>We do not use automatic AI video moderation or automatic nudity detection in the current beta.</li>
              <li>We do not promise identity verification or background checks.</li>
              <li>We do not intentionally record live Chemistry Checks or Connection calls.</li>
            </ul>
          ),
        },
        {
          title: 'Retention and deletion',
          body: (
            <p>
              Account and product data is kept while it is needed to provide and secure the service.
              Safety records may need to be kept longer for abuse review, legal, or security reasons.
              You can delete your account from Profile Settings. Deletion removes active profile,
              session, message, Connection, Vibe, block, notification, and feedback data and
              anonymizes the underlying account record. Safety reports may be retained against that
              anonymized record when needed for abuse review, legal, or security purposes.
            </p>
          ),
        },
        {
          title: 'Your choices',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>You can deny camera or microphone permission, though live video features will not work.</li>
              <li>You can leave a Chemistry Check or Connection call at any time.</li>
              <li>You can report and block other accounts.</li>
              <li>You can sign out from the Meetopia navigation.</li>
              <li>You can delete your account from Profile Settings or contact <ContactEmail /> with a privacy question.</li>
            </ul>
          ),
        },
        {
          title: 'Adults only',
          body: (
            <p>
              Meetopia is only for people age 18 or older. If you believe an account belongs to
              someone under 18, use the in-app report flow and leave the interaction.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: <p>Privacy and data requests: <ContactEmail /></p>,
        },
      ]}
    />
  )
}
