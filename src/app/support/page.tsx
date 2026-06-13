import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import ContactEmail from '@/components/ContactEmail'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support — Meetopia',
  description: 'Get help with Meetopia video dating, Chemistry Checks, and safety.',
}

export default function SupportPage() {
  return (
    <LegalPage
      title="Support & Contact"
      intro={
        <p>
          Need help with Meetopia? We&apos;re here for technical issues, safety concerns, and App
          Store review questions.
        </p>
      }
      sections={[
        {
          title: 'Contact us',
          body: (
            <p>
              Email: <ContactEmail />
              <br />
              We aim to respond within <strong>2 business days</strong>.
            </p>
          ),
        },
        {
          title: 'Safety & reporting',
          body: (
            <p>
              For in-app harassment or inappropriate behavior, use <strong>Report</strong> during a
              Chemistry Check. For urgent danger, contact local emergency services first. Learn
              more on our{' '}
              <Link href="/safety" className="text-blue-600 hover:underline">
                Safety &amp; Reporting
              </Link>{' '}
              page.
            </p>
          ),
        },
        {
          title: 'Common questions',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Why does Meetopia need camera and microphone?</strong> For live video
                Chemistry Checks with other members. See our{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </li>
              <li>
                <strong>How do I delete my data?</strong> Mobile app → Settings → Delete local
                profile &amp; data.
              </li>
              <li>
                <strong>Demo Mode for reviewers:</strong> Open the app → Try Demo Mode to experience
                video, Vibe, and chat without a second user online.
              </li>
              <li>
                <strong>Live test with two devices:</strong> Email us to schedule a live test window
                if needed for review.
              </li>
            </ul>
          ),
        },
        {
          title: 'Policies',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-blue-600 hover:underline">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          ),
        },
      ]}
    />
  )
}
