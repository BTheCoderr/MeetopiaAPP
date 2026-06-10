'use client'

import VideoConnectionStatusBar from './ConnectionStatus'
import { videoChatLayout } from './videoChatLayout'

interface VideoChatHeaderProps {
  isDarkTheme: boolean
  setIsDarkTheme: (v: boolean) => void
  areControlsVisible: boolean
  isPeerConnected: boolean
  isSearching: boolean
  hasPeer: boolean
  isSocketConnected: boolean
  isMenuOpen: boolean
  setIsMenuOpen: (v: boolean) => void
}

export default function VideoChatHeader({
  isDarkTheme,
  setIsDarkTheme,
  areControlsVisible,
  isPeerConnected,
  isSearching,
  hasPeer,
  isSocketConnected,
  isMenuOpen,
  setIsMenuOpen,
}: VideoChatHeaderProps) {
  return (
    <>
      <div className={`${videoChatLayout.header} px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 pointer-events-none bg-gradient-to-b from-black/55 via-black/20 to-transparent`}>
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMenuOpen(true)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white/90 transition-opacity duration-300 ${
                areControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold tracking-tight drop-shadow-md">
              <span className="text-[#0A84FF]">Meet</span>
              <span className="text-white">opia</span>
            </h1>
          </div>
          <div className={`flex items-center gap-2 transition-opacity duration-300 ${
            areControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <VideoConnectionStatusBar
              isDarkTheme={isDarkTheme}
              areControlsVisible={true}
              isPeerConnected={isPeerConnected}
              isSearching={isSearching}
              hasPeer={hasPeer}
              isSocketConnected={isSocketConnected}
            />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-[#1c1c1e]/95 backdrop-blur-xl z-50 p-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-white mb-4 px-1">Menu</h2>
              <p className="text-white/45 text-xs uppercase tracking-wide px-3 mb-1">Appearance</p>
              <button
                onClick={() => setIsDarkTheme(true)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                  isDarkTheme ? 'bg-white/12 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                Dark Mode
              </button>
              <button
                onClick={() => setIsDarkTheme(false)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                  !isDarkTheme ? 'bg-white/12 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                Light Mode
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
