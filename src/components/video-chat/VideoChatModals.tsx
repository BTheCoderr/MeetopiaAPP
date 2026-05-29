'use client'

import { motion, AnimatePresence } from 'framer-motion'
import ReportModal from '@/components/ReportModal'
import OnboardingTutorial from '@/components/OnboardingTutorial'
import SafetyGuidelines from '@/components/SafetyGuidelines'
import ConnectionTroubleshooting from '@/components/ConnectionTroubleshooting'
import type { KeyboardShortcut } from '@/types/videoChat'

interface VideoChatModalsProps {
  isReportModalOpen: boolean
  closeReportModal: () => void
  onSubmitReport: (type: 'report' | 'improvement', reason: string, details: string) => void
  reportedUserId?: string
  showKeyboardHelp: boolean
  setShowKeyboardHelp: (v: boolean) => void
  keyboardShortcuts: KeyboardShortcut[]
  showTutorial: boolean
  setShowTutorial: (v: boolean) => void
  showSafetyGuidelines: boolean
  setShowSafetyGuidelines: (v: boolean) => void
  showTroubleshooting: boolean
  setShowTroubleshooting: (v: boolean) => void
  isDarkTheme: boolean
  showReportPanel: boolean
  setShowReportPanel: (v: boolean) => void
  reportReason: string
  setReportReason: (v: string) => void
  isReporting: boolean
  reportSuccess: boolean
  onSubmitLegacyReport: () => void
}

export default function VideoChatModals({
  isReportModalOpen,
  closeReportModal,
  onSubmitReport,
  reportedUserId,
  showKeyboardHelp,
  setShowKeyboardHelp,
  keyboardShortcuts,
  showTutorial,
  setShowTutorial,
  showSafetyGuidelines,
  setShowSafetyGuidelines,
  showTroubleshooting,
  setShowTroubleshooting,
  isDarkTheme,
  showReportPanel,
  setShowReportPanel,
  reportReason,
  setReportReason,
  isReporting,
  reportSuccess,
  onSubmitLegacyReport,
}: VideoChatModalsProps) {
  return (
    <>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        onSubmit={onSubmitReport}
        reportedUserId={reportedUserId}
      />

      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowKeyboardHelp(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md p-6 w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Keyboard Shortcuts</h2>
              <div className="space-y-2">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 font-mono text-sm">
                      {shortcut.key}
                    </kbd>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{shortcut.action}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  onClick={() => setShowKeyboardHelp(false)}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          setShowTutorial(false)
          setShowSafetyGuidelines(true)
        }}
      />

      <SafetyGuidelines
        isOpen={showSafetyGuidelines}
        onClose={() => setShowSafetyGuidelines(false)}
        onAccept={() => setShowSafetyGuidelines(false)}
      />

      <ConnectionTroubleshooting
        isOpen={showTroubleshooting}
        onClose={() => setShowTroubleshooting(false)}
        isDarkTheme={isDarkTheme}
      />

      {showReportPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg w-full max-w-md p-6 mx-4">
            {reportSuccess ? (
              <div className="text-center">
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold mb-2">Report Submitted</h3>
                <p className="text-gray-600 mb-4">Thank you for helping keep Meetopia safe.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Report Inappropriate Behavior</h3>
                <p className="text-gray-600 mb-4">Please let us know why you&apos;re reporting this user.</p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate_content">Inappropriate content</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="underage">Appears underage</option>
                  <option value="violence">Violent behavior</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowReportPanel(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSubmitLegacyReport}
                    disabled={!reportReason || isReporting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400"
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
