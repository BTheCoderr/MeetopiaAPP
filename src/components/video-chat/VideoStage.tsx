'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BandwidthQuality } from '@/types/videoChat'
import PictureInPicture, { type PictureInPictureProps } from './PictureInPicture'
import { videoChatLayout } from './videoChatLayout'

/** A idle | B searching | connecting (matched, no remote track yet) | C connected | D → idle/searching */
export type VideoStageMode = 'idle' | 'searching' | 'connecting' | 'connected'

interface VideoStageProps {
  isDating: boolean
  isDarkTheme: boolean
  isClient: boolean
  isSearching: boolean
  hasPeer: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  blurRemoteVideo: boolean
  isPeerConnected: boolean
  bandwidthQuality: BandwidthQuality
  isRemoteCameraOff: boolean
  isRemoteAudioOff: boolean
  areControlsVisible: boolean
  isCameraOff: boolean
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  pipProps: PictureInPictureProps
  onToggleBlur: () => void
  onReportExplicit: () => void
}

const videoTransition = { duration: 0.38, ease: [0.4, 0, 0.2, 1] as const }
const isDev = process.env.NODE_ENV === 'development'

/**
 * Primary vs PIP: hasRemote = peer connected AND remote track available.
 * - !hasRemote → local full-screen, PIP hidden
 * - hasRemote → remote full-screen, local in PIP
 */
export function deriveVideoStageMode(
  isPeerConnected: boolean,
  remoteStream: MediaStream | null,
  isSearching: boolean,
  hasPeer: boolean,
): VideoStageMode {
  const hasRemote = isPeerConnected && !!remoteStream
  if (hasRemote) return 'connected'
  if (hasPeer) return 'connecting'
  if (isSearching) return 'searching'
  return 'idle'
}

export default function VideoStage({
  isDating,
  isDarkTheme,
  isClient,
  isSearching,
  hasPeer,
  localStream,
  remoteStream,
  blurRemoteVideo,
  isPeerConnected,
  bandwidthQuality,
  isRemoteCameraOff,
  isRemoteAudioOff,
  areControlsVisible,
  isCameraOff,
  remoteVideoRef,
  localVideoRef,
  pipProps,
  onToggleBlur,
  onReportExplicit,
}: VideoStageProps) {
  const hasRemote = isPeerConnected && !!remoteStream
  const pipStream = hasRemote ? localStream : null
  const mode = deriveVideoStageMode(isPeerConnected, remoteStream, isSearching, hasPeer)
  const showRemotePrimary = hasRemote
  const showStatusOverlay = mode === 'searching' || mode === 'connecting'
  const overlayMessage =
    mode === 'connecting'
      ? isDating
        ? 'Connecting video to your match…'
        : 'Connecting video…'
      : isDating
        ? 'Finding your match…'
        : 'Looking for someone…'

  useEffect(() => {
    const el = localVideoRef.current
    if (!el) return
    el.srcObject = hasRemote ? null : (localStream ?? null)
  }, [hasRemote, localStream, localVideoRef])

  useEffect(() => {
    const el = remoteVideoRef.current
    if (!el) return
    el.srcObject = hasRemote ? (remoteStream ?? null) : null
  }, [hasRemote, remoteStream, remoteVideoRef])

  useEffect(() => {
    const el = pipProps.localVideoRef.current
    if (!el) return
    el.srcObject = pipStream ?? null
  }, [pipStream, pipProps.localVideoRef])

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Primary local video — full-screen before/during match setup, hidden once remote is primary */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{
          opacity: showRemotePrimary ? 0 : 1,
          scale: showRemotePrimary ? 1.04 : 1,
        }}
        transition={videoTransition}
        style={{ zIndex: showRemotePrimary ? 0 : 1, pointerEvents: showRemotePrimary ? 'none' : 'auto' }}
        aria-hidden={showRemotePrimary}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`${videoChatLayout.mainVideo} -scale-x-100 transition-opacity duration-300 ${
            isCameraOff ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {!showRemotePrimary && isCameraOff && (
          <div className="absolute inset-0 bg-[#1c1c1e] flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2z" />
              </svg>
            </div>
          </div>
        )}
      </motion.div>

      {/* Primary remote video — full-screen once connected */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{
          opacity: showRemotePrimary ? 1 : 0,
          scale: showRemotePrimary ? 1 : 1.04,
        }}
        transition={videoTransition}
        style={{ zIndex: showRemotePrimary ? 1 : 0, pointerEvents: showRemotePrimary ? 'auto' : 'none' }}
        aria-hidden={!showRemotePrimary}
      >
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`${videoChatLayout.mainVideo} transition-[filter] duration-300 ${
            blurRemoteVideo ? 'blur-xl' : ''
          }`}
        />
      </motion.div>

      {isDev && (
        <div className="absolute top-2 left-2 z-[5] pointer-events-none px-2 py-1 rounded bg-black/60 text-[10px] font-mono text-white/90">
          {hasRemote ? 'MAIN: REMOTE' : 'MAIN: LOCAL'}
        </div>
      )}

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/50 z-[2]" />

      {/* A. Idle — prompt to start matching */}
      <AnimatePresence>
        {mode === 'idle' && (
          <motion.div
            key="idle-overlay"
            className={videoChatLayout.idleHint}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28 }}
          >
            <p className={`text-center text-[15px] max-w-xs leading-relaxed drop-shadow-lg ${
              isDarkTheme ? 'text-white/75' : 'text-white/90'
            }`}>
              Tap the green button to start matching
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* B/C. Searching or connecting — spinner over local full-screen preview */}
      <AnimatePresence>
        {showStatusOverlay && (
          <motion.div
            key={mode === 'connecting' ? 'connecting-overlay' : 'searching-overlay'}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[3]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="w-10 h-10 border-[3px] border-white/25 border-t-white rounded-full animate-spin mb-4" />
            <p className={`text-[15px] ${isDarkTheme ? 'text-white/80' : 'text-white/90'}`}>
              {overlayMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* C. Connected — status chips */}
      {hasRemote && (
        <div className={`${videoChatLayout.statusChips} transition-opacity duration-300 ${
          areControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-0.5 h-3">
                <div className={`w-0.5 rounded-sm ${bandwidthQuality !== 'low' ? 'bg-green-400 h-1.5' : 'bg-white/30 h-1'}`} />
                <div className={`w-0.5 rounded-sm ${bandwidthQuality !== 'low' ? 'bg-green-400 h-2' : 'bg-white/30 h-1.5'}`} />
                <div className={`w-0.5 rounded-sm ${bandwidthQuality === 'high' ? 'bg-green-400 h-3' : 'bg-white/30 h-2'}`} />
              </div>
              <span className="text-[11px] text-white/80 font-medium">
                {bandwidthQuality === 'high' ? 'HD' : bandwidthQuality === 'medium' ? 'SD' : 'Low'}
              </span>
            </div>
          </div>
          {isRemoteCameraOff && (
            <span className="text-[11px] text-white/80 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/10">
              Camera off
            </span>
          )}
          {isRemoteAudioOff && (
            <span className="text-[11px] text-white/80 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/10">
              Muted
            </span>
          )}
        </div>
      )}

      {/* Safety controls — only when connected */}
      {hasRemote && areControlsVisible && (
        <div className={videoChatLayout.safetyControls}>
          <button
            onClick={onToggleBlur}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-colors ${
              blurRemoteVideo ? 'bg-yellow-500/80 text-white' : 'bg-black/35 hover:bg-black/50 text-white/85'
            }`}
            title={blurRemoteVideo ? 'Unblur' : 'Blur video'}
            aria-label={blurRemoteVideo ? 'Unblur video' : 'Blur video'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </button>
          <button
            onClick={onReportExplicit}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/35 hover:bg-red-500/70 text-white/85 backdrop-blur-md border border-white/10 shadow-lg"
            title="Report inappropriate content"
            aria-label="Report inappropriate content"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </button>
        </div>
      )}

      {/* C. Connected — local camera shrinks into PIP (hidden when !hasRemote) */}
      <AnimatePresence>
        {isClient && hasRemote && pipStream && (
          <motion.div
            key="pip"
            initial={{ opacity: 0, scale: 0.82, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -8 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="z-[4]"
          >
            <PictureInPicture {...pipProps} pipStream={pipStream} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
