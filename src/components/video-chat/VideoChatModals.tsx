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
    </>
  )
}
