'use client'

import { videoChatLayout } from './videoChatLayout'

interface ControlBarProps {
  areControlsVisible: boolean
  isSocketConnected: boolean
  isSearching: boolean
  buttonCooldown: boolean
  hasPeer: boolean
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
  onStartChat: () => void
  onNextPerson: () => void
  onLeaveChat: () => void
  onToggleMute: () => void
  onToggleCamera: () => void
  onToggleScreenShare: () => void
  onOpenTroubleshooting: () => void
  onOpenReport: () => void
}

function IconButton({
  onClick,
  disabled,
  active,
  danger,
  primary,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  danger?: boolean
  primary?: boolean
  label: string
  children: React.ReactNode
}) {
  const sizeClass = primary
    ? videoChatLayout.controlButtonPrimary
    : videoChatLayout.controlButton

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-full flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-35 ${sizeClass} ${
        primary
          ? 'bg-[#30D158] hover:bg-[#28BD4E] text-white shadow-lg shadow-green-500/25'
          : danger
            ? 'bg-[#FF453A] hover:bg-[#FF3B30] text-white shadow-lg shadow-red-500/20'
            : active
              ? 'bg-white text-black'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
      }`}
    >
      {children}
    </button>
  )
}

export default function ControlBar({
  areControlsVisible,
  isSocketConnected,
  isSearching,
  buttonCooldown,
  hasPeer,
  isMuted,
  isCameraOff,
  isScreenSharing,
  onStartChat,
  onNextPerson,
  onLeaveChat,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onOpenTroubleshooting,
  onOpenReport,
}: ControlBarProps) {
  return (
    <div
      className={`${videoChatLayout.controls} ${
        areControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div className={videoChatLayout.controlRow}>
        <IconButton
          onClick={onToggleMute}
          active={isMuted}
          label={isMuted ? 'Unmute' : 'Mute'}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
            {isMuted ? (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            ) : (
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            )}
          </svg>
        </IconButton>

        <IconButton
          onClick={onToggleCamera}
          active={isCameraOff}
          label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
            {isCameraOff ? (
              <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2z" />
            ) : (
              <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69L18 8V6.48l2 1.99L18 9.69z" />
            )}
          </svg>
        </IconButton>

        {!hasPeer ? (
          <IconButton
            onClick={onStartChat}
            disabled={!isSocketConnected || isSearching || buttonCooldown}
            primary
            label="Make a Connection"
          >
            {isSearching ? (
              <div className="w-5 h-5 md:w-6 md:h-6 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            )}
          </IconButton>
        ) : (
          <>
            <IconButton
              onClick={onToggleScreenShare}
              active={isScreenSharing}
              label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
              </svg>
            </IconButton>
            <IconButton onClick={onNextPerson} label="Keep Exploring">
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </IconButton>
            <IconButton onClick={onLeaveChat} danger label="Back to Base">
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 010-1.41l2.76-2.76c.18-.18.43-.29.71-.29.27 0 .52.11.7.28.79.73 1.68 1.36 2.66 1.85.33.16.56.51.56.9v3.1c1.45-.47 3-.72 4.6-.72s3.15.25 4.6.72v-3.1c0-.39.23-.74.56-.9.98-.49 1.87-1.12 2.66-1.85.18-.18.43-.28.7-.28.28 0 .53.11.71.29l2.76 2.76c.18.18.29.43.29.71 0 .28-.11.53-.29.71-.79.73-1.68 1.36-2.66 1.85-.33.16-.56.51-.56.9v3.1c-1.45.47-3 .72-4.6.72z" />
              </svg>
            </IconButton>
          </>
        )}

        <IconButton onClick={onOpenReport} label="Let Us Know">
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 9V5h-4v4H7l5 5 5-5h-3zm-4 11H5v-2h5v2zm5-4H5v-2h10v2zm4-8H5V6h14v2z" />
          </svg>
        </IconButton>

        {!hasPeer && (
          <IconButton onClick={onOpenTroubleshooting} label="Connection Help">
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
          </IconButton>
        )}
      </div>
    </div>
  )
}
