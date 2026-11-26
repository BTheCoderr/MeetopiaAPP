import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'

// OWNER REVIEW REQUIRED before production release. This text was revised to
// match the consent-first release (Chemistry Passport, Encore / Spark Cards,
// mutually approved Co-Create). See docs/PRIVACY_DISCLOSURES.md for the
// field-by-field source of each statement. Not legal advice.

export const metadata: Metadata = {
  title: 'Privacy Policy — Meetopia',
  description:
    'How Meetopia handles your account, Chemistry Passport, introductions, Vibe Rooms, Spark Cards and shared creations.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="November 2026"
      intro={
        <p>
          Meetopia introduces adults through shared interests, asks both people to agree before
          video, and then hosts a live, interactive Vibe Room. This policy explains what we store,
          who can see it, why we need camera and microphone access, and how you can remove your
          data.
        </p>
      }
      sections={[
        {
          title: 'Information you provide',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account:</strong> email address, username, display name and a hashed
                password. Your password is never stored in readable form.
              </li>
              <li>
                <strong>Age confirmation:</strong> the date you confirmed that you are 18 or older.
              </li>
              <li>
                <strong>Chemistry Passport:</strong> what you are looking for (for example
                relationship, dating, friendship or open), your conversation style and the
                interests you pick from a fixed list. You choose these; we do not infer them.
              </li>
              <li>
                <strong>Safety actions:</strong> reports you submit (category, time and the session
                involved) and the people you block.
              </li>
              <li>
                <strong>Vibes and Connections:</strong> whether you sent a Vibe, and the Connection
                created when both people Vibe.
              </li>
              <li>
                <strong>Connection messages:</strong> messages you send to a Connection after a
                mutual Vibe, with delivery and read status.
              </li>
              <li>
                <strong>Encore / Spark Card:</strong> if you choose an Encore idea for a Connection
                and explicitly agree to share it, we store that choice so your Connection can see
                it. Nothing is stored until you agree to share.
              </li>
              <li>
                <strong>Co-Create shared creations:</strong> the final theme, activity and setting
                that you and your partner both approved in a Vibe Room. It is saved only after both
                of you approve it and both of you Vibe.
              </li>
            </ul>
          ),
        },
        {
          title: 'How introductions use your Chemistry Passport',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                We compare your Passport with other members who are available, or who chose the
                same themed Vibe Session, to suggest an introduction.
              </li>
              <li>
                Before video, the other person sees your display name, your conversation style and
                only the interests you have in common. Your other interests are not shown.
              </li>
              <li>
                Video starts only if both of you accept. Declining is private, and an introduction
                that expires does not start a call.
              </li>
              <li>We do not use your Passport for advertising.</li>
            </ul>
          ),
        },
        {
          title: 'Inside a Vibe Room',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Private round choices (for example a Curveball answer) are held only temporarily by
                our signaling service so they can be revealed when both of you have chosen. They
                are cleared when the session ends, either of you leaves, or the session expires.
                They are not saved to your account.
              </li>
              <li>
                Chat inside a Vibe Room is passed between the two of you and is not saved to your
                account. Messages to a Connection after a mutual Vibe are saved, as described
                above.
              </li>
              <li>
                Only the final creation that both of you approve can be saved, and only after a
                mutual Vibe.
              </li>
            </ul>
          ),
        },
        {
          title: 'Camera, microphone and connections',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Camera and microphone access is needed for live video in Vibe Rooms. You can deny
                it, but video features will not work.
              </li>
              <li>
                Video and audio travel directly between the two devices with WebRTC where possible.
                Like most video calling apps, a direct connection can expose each device&apos;s
                network (IP) address to the other device.
              </li>
              <li>
                When a direct connection is not possible, encrypted media is relayed through a
                TURN relay service. The relay handles network addresses but cannot view the
                encrypted video or audio.
              </li>
              <li>We do not record or store live video or audio.</li>
              <li>We do not use AI to analyze your video or audio.</li>
            </ul>
          ),
        },
        {
          title: 'Automatically collected',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>A sign-in session cookie that keeps you logged in.</li>
              <li>
                Temporary connection identifiers used for real-time signaling, matching and
                presence.
              </li>
              <li>Service logs that help us keep the service secure and working.</li>
            </ul>
          ),
        },
        {
          title: 'Where your data is stored',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Account, Chemistry Passport, Vibes, Connections, messages, blocks, reports, Encore
                choices and shared creations are stored in our database, hosted by Supabase.
              </li>
              <li>The website and API are hosted by Netlify.</li>
              <li>Real-time signaling is hosted by Render and is temporary.</li>
              <li>
                Password-reset emails, and notices to our moderation team about new safety
                reports, are sent through our email provider.
              </li>
              <li>
                Our database tables are reachable only through our own servers, not through a
                public database interface.
              </li>
            </ul>
          ),
        },
        {
          title: 'What we do not do',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not sell your personal data.</li>
              <li>We do not record live calls.</li>
              <li>We do not show your full interest list to people you are introduced to.</li>
            </ul>
          ),
        },
        {
          title: 'Your choices and deletion',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Edit your Chemistry Passport at any time.</li>
              <li>Decline any introduction, or leave any Vibe Room at any time.</li>
              <li>
                Withdraw a shared Encore choice. Either person can remove a saved shared creation.
              </li>
              <li>
                Blocking someone removes your Connection with them, including its Encore and
                shared creation, and prevents future introductions.
              </li>
              <li>
                Deleting your account removes your account, Chemistry Passport, Vibes, Connections
                (including their Encore choices and shared creations) and messages.
              </li>
              <li>
                Safety reports made during a live session are kept separately so our team can
                review them, and may be retained after an account is deleted where needed for
                safety and moderation.
              </li>
            </ul>
          ),
        },
        {
          title: 'Children',
          body: (
            <p>
              Meetopia is 18+ only. We do not knowingly collect data from anyone under 18. Report
              anyone who appears underage using the in-app Report flow.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: (
            <p>
              Support &amp; privacy requests: <ContactEmail />
            </p>
          ),
        },
      ]}
    />
  )
}
