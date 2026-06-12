import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — Meetopia',
  description: 'How Meetopia collects and uses data for video dating and Chemistry Checks.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="June 2026"
      intro={
        <p>
          Meetopia is a video-first dating and meeting app. This policy describes what we collect,
          why we need camera and microphone access, and how you can control your data.
        </p>
      }
      sections={[
        {
          title: 'Information you provide',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Profile:</strong> First name, age, city, gender, who you are interested in,
                intent, and a short prompt — used for matching and profile cards during Chemistry
                Checks.
              </li>
              <li>
                <strong>Age confirmation:</strong> You must confirm you are 18 or older.
              </li>
              <li>
                <strong>Safety actions:</strong> Report categories and blocked users.
              </li>
              <li>
                <strong>Messages:</strong> Text sent after mutual Vibe in a Chemistry Check.
              </li>
            </ul>
          ),
        },
        {
          title: 'Automatically collected',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Session identifiers for WebRTC signaling and matching.</li>
              <li>Connection diagnostics if we enable crash or reliability logging.</li>
            </ul>
          ),
        },
        {
          title: 'Camera and microphone',
          body: (
            <p>
              Meetopia requires camera and microphone access for live video Chemistry Checks. Video
              and audio streams are peer-to-peer via WebRTC where possible; signaling runs through
              our backend. We do not record or store your live video or audio on our servers in the
              current MVP.
            </p>
          ),
        },
        {
          title: 'What we do not do (MVP)',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not sell your personal data.</li>
              <li>We do not use AI to analyze video content in the current MVP.</li>
              <li>We do not record live calls on our servers.</li>
            </ul>
          ),
        },
        {
          title: 'Where data is stored',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Profile, intent, blocks, and vibe matches: on your device (mobile app).</li>
              <li>Signaling sessions: our hosting provider (ephemeral).</li>
              <li>Reports: stored on our server for review (category, timestamps, session info).</li>
            </ul>
          ),
        },
        {
          title: 'Your choices',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Deny camera or microphone (limits video features).</li>
              <li>Report or block other users.</li>
              <li>Delete local profile and data from Settings in the mobile app.</li>
              <li>Leave any Chemistry Check at any time.</li>
            </ul>
          ),
        },
        {
          title: 'Children',
          body: (
            <p>
              Meetopia is 18+ only. We do not knowingly collect data from anyone under 18. Report
              underage users via the in-app Report flow.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: (
            <p>
              Support:{' '}
              <a href="mailto:support@meetopia.app" className="text-blue-600 hover:underline">
                support@meetopia.app
              </a>
              <br />
              Privacy:{' '}
              <a href="mailto:privacy@meetopia.app" className="text-blue-600 hover:underline">
                privacy@meetopia.app
              </a>
            </p>
          ),
        },
      ]}
    />
  )
}
