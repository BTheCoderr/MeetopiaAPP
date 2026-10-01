'use client'

interface CommunityGuidelinesProps {
  isOpen: boolean
  onAccept: () => void
  onClose: () => void
}

export default function CommunityGuidelines({
  isOpen,
  onAccept,
  onClose,
}: CommunityGuidelinesProps) {
  if (!isOpen) return null

  const handleAccept = () => {
    localStorage.setItem('meetopia_guidelines_accepted', 'true')
    onAccept()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Community Guidelines</h2>
          <p className="mt-3 font-medium text-gray-700">
            Meetopia is for adults 18+. Talk to people the way you would want to be treated in a
            real face-to-face conversation.
          </p>

          <div className="mt-5 space-y-5 text-sm leading-6 text-gray-700 sm:text-base">
            <section>
              <h3 className="font-bold text-gray-950">Respect boundaries</h3>
              <p>No harassment, threats, hate speech, stalking, bullying, or attempts to bypass a block.</p>
            </section>

            <section>
              <h3 className="font-bold text-gray-950">Adults only</h3>
              <p>Do not use Meetopia if you are under 18. Leave and report if someone appears underage.</p>
            </section>

            <section>
              <h3 className="font-bold text-gray-950">No illegal or exploitative content</h3>
              <p>No scams, fraud, doxxing, sexual content involving minors, or other illegal conduct.</p>
            </section>

            <section>
              <h3 className="font-bold text-gray-950">Safety tools are user-triggered</h3>
              <p>
                Use Leave, Next, Report, or Block whenever you need them. Meetopia does not claim to
                automatically detect inappropriate live video in the current beta.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-950">Reports</h3>
              <p>
                Reports are saved for manual review. Meetopia does not intentionally record live
                video or audio, and the report flow does not capture screenshots automatically.
              </p>
            </section>
          </div>

          <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              className="min-h-11 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
