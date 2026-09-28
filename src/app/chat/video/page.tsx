'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePeerConnection } from '@/hooks/usePeerConnection'
import { useReporting } from '@/hooks/useReporting'
import { useVideoChatState } from '@/hooks/useVideoChatState'
import { useVideoChatSocket } from '@/hooks/useVideoChatSocket'
import { useLocalMediaStream } from '@/hooks/useLocalMediaStream'
import { useMediaControls } from '@/hooks/useMediaControls'
import { useVideoChatMessages } from '@/hooks/useVideoChatMessages'
import VideoChatHeader from '@/components/video-chat/VideoChatHeader'
import ControlBar from '@/components/video-chat/ControlBar'
import VideoStage from '@/components/video-chat/VideoStage'
import ChatPanel from '@/components/video-chat/ChatPanel'
import VideoChatModals from '@/components/video-chat/VideoChatModals'
import { videoChatLayout } from '@/components/video-chat/videoChatLayout'

export default function VideoChatPage() {
  const state = useVideoChatState()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localPipVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const { stream } = useLocalMediaStream(localVideoRef, state.setError)
  const { peerConnection, restartConnection } = usePeerConnection(stream)

  const chat = useVideoChatSocket({
    stream,
    peerConnection,
    restartConnection,
    buttonCooldown: state.buttonCooldown,
    setIsSearching: state.setIsSearching,
    setError: state.setError,
    startCooldown: state.startCooldown,
    setBandwidthQuality: state.setBandwidthQuality,
    isAdaptiveQuality: state.isAdaptiveQuality,
  })

  const media = useMediaControls({
    stream,
    peerConnection,
    currentPeer: chat.currentPeer,
    socket: chat.socket,
    remoteVideoRef,
    bandwidthQuality: state.bandwidthQuality,
    isAdaptiveQuality: state.isAdaptiveQuality,
  })

  const messages = useVideoChatMessages({
    socket: chat.socket,
    currentPeer: chat.currentPeer,
    chatOpen: state.isChatOpen,
  })

  const {
    isReportModalOpen,
    handleReport,
    openReportModal,
    closeReportModal,
    submitReportForUser,
  } = useReporting()

  useEffect(() => {
    document.body.classList.add('overflow-hidden', 'bg-black')
    return () => {
      document.body.classList.remove('overflow-hidden', 'bg-black')
    }
  }, [])

  useEffect(() => {
    if (chat.currentPeer) state.showControlsTemporarily()
    else state.showControls()
  }, [chat.currentPeer, state.showControls, state.showControlsTemporarily])

  const handleNextPerson = useCallback(() => {
    chat.handleNextPerson()
  }, [chat])

  const handleSubmitLegacyReport = useCallback(async () => {
    if (!state.reportReason || !chat.currentPeerUserId) return
    state.setIsReporting(true)
    try {
      await submitReportForUser(
        chat.currentPeerUserId,
        'report',
        state.reportReason,
        'Submitted from the live Chemistry Check report panel.'
      )
      state.setReportSuccess(true)
      window.setTimeout(() => {
        state.setShowReportPanel(false)
        state.setReportSuccess(false)
        state.setReportReason('')
        handleNextPerson()
      }, 1200)
    } catch (error) {
      console.error('Error submitting live report:', error)
      state.setError(error instanceof Error ? error.message : 'Could not submit report.')
    } finally {
      state.setIsReporting(false)
    }
  }, [state, chat.currentPeerUserId, submitReportForUser, handleNextPerson])

  const handleReportExplicit = useCallback(async () => {
    if (!chat.currentPeerUserId) return
    state.setHasExplicitContent(true)
    state.toggleBlurRemoteVideo()

    try {
      await submitReportForUser(
        chat.currentPeerUserId,
        'report',
        'explicit_content',
        'Reported from the live explicit-content safety control.'
      )
    } catch (error) {
      console.error('Error submitting explicit-content report:', error)
      state.setError(error instanceof Error ? error.message : 'Could not submit report.')
    }
  }, [state, chat.currentPeerUserId, submitReportForUser])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        if (chat.currentPeer) handleNextPerson()
        else chat.handleStartChat()
      }
      if (e.code === 'Escape' && !e.repeat) {
        e.preventDefault()
        chat.handleLeaveChat()
      }
      if (e.code === 'KeyM' && !e.repeat) {
        e.preventDefault()
        media.toggleLocalMute()
      }
      if (e.code === 'KeyV' && !e.repeat) {
        e.preventDefault()
        media.toggleLocalCamera()
      }
      if (e.code === 'KeyC' && !e.repeat) {
        e.preventDefault()
        const input = document.querySelector('input[type="text"]')
        if (input instanceof HTMLInputElement) input.focus()
      }
      if (e.code === 'KeyH' && !e.repeat) {
        e.preventDefault()
        state.setShowKeyboardHelp(prev => !prev)
      }
      if (e.key === '?' && !e.repeat) {
        e.preventDefault()
        state.setShowTroubleshooting(true)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [chat, media, state, handleNextPerson])

  return (
    <div className={videoChatLayout.root}>
      <VideoChatHeader
        isDarkTheme={state.isDarkTheme}
        setIsDarkTheme={state.setIsDarkTheme}
        areControlsVisible={state.areControlsVisible}
        isPeerConnected={chat.isPeerConnected}
        isSearching={state.isSearching}
        hasPeer={Boolean(chat.currentPeer)}
        isSocketConnected={chat.isSocketConnected}
        isMenuOpen={state.isMenuOpen}
        setIsMenuOpen={state.setIsMenuOpen}
      />

      <ControlBar
        areControlsVisible={state.areControlsVisible}
        isSocketConnected={chat.isSocketConnected}
        isSearching={state.isSearching}
        buttonCooldown={state.buttonCooldown}
        hasPeer={Boolean(chat.currentPeer)}
        hasVibed={chat.hasVibed}
        isMuted={media.isMuted}
        isCameraOff={media.isCameraOff}
        isScreenSharing={media.isScreenSharing}
        onStartChat={chat.handleStartChat}
        onCancelSearch={chat.handleCancelSearch}
        onNextPerson={handleNextPerson}
        onVibe={chat.handleVibe}
        onBlock={chat.handleBlock}
        onLeaveChat={chat.handleLeaveChat}
        onToggleMute={media.toggleLocalMute}
        onToggleCamera={media.toggleLocalCamera}
        onToggleScreenShare={media.toggleScreenShare}
        onOpenTroubleshooting={() => state.setShowTroubleshooting(true)}
        onOpenReport={() => openReportModal(chat.currentPeerUserId || '')}
        onControlsActivity={chat.currentPeer ? state.showControlsTemporarily : state.showControls}
      />

      {state.error && (
        <div className="absolute top-[calc(4.25rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-20 max-w-md w-full px-4">
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-900/80 backdrop-blur-sm text-white text-sm">
            <span>{state.error}</span>
            <button
              onClick={() => state.setShowTroubleshooting(true)}
              className="shrink-0 underline hover:no-underline text-red-200"
            >
              Get help
            </button>
          </div>
        </div>
      )}

      <VideoStage
        isDarkTheme={state.isDarkTheme}
        isClient={state.isClient}
        isSearching={state.isSearching}
        hasPeer={Boolean(chat.currentPeer)}
        localStream={stream}
        remoteStream={chat.remoteStream}
        blurRemoteVideo={state.blurRemoteVideo}
        isPeerConnected={chat.isPeerConnected}
        bandwidthQuality={state.bandwidthQuality}
        isRemoteCameraOff={chat.isRemoteCameraOff}
        isRemoteAudioOff={chat.isRemoteAudioOff}
        areControlsVisible={state.areControlsVisible}
        isCameraOff={media.isCameraOff}
        remoteVideoRef={remoteVideoRef}
        localVideoRef={localVideoRef}
        pipProps={{
          localVideoRef: localPipVideoRef,
          areControlsVisible: state.areControlsVisible,
          isCameraOff: media.isCameraOff,
        }}
        onToggleBlur={state.toggleBlurRemoteVideo}
        onReportExplicit={handleReportExplicit}
        onControlsActivity={state.showControlsTemporarily}
        onToggleControls={state.toggleControlsVisibility}
      />

      <ChatPanel
        isChatOpen={state.isChatOpen}
        isDarkTheme={state.isDarkTheme}
        hasPeer={Boolean(chat.currentPeer)}
        updatedMessages={messages.updatedMessages}
        newMessage={messages.newMessage}
        isPeerTyping={messages.isPeerTyping}
        markAllAsRead={messages.markAllAsRead}
        handleMessageChange={messages.handleMessageChange}
        handleSendMessage={messages.handleSendMessage}
        onFocus={state.handleChatFocus}
      />

      {chat.mutualVibe && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#161618] p-7 text-center text-white shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-3xl">
              ♥
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-pink-300">Chemistry confirmed</p>
            <h2 className="text-3xl font-black">It&apos;s a Vibe!</h2>
            <p className="mt-3 text-white/70">
              You and {chat.mutualVibe.partnerDisplayName || 'your match'} both sent a Vibe.
            </p>
            <div className="mt-3 text-sm">
              {chat.mutualVibe.saved ? (
                <span className="text-green-300">Connection saved ✓</span>
              ) : (
                <span className="text-amber-300">{chat.mutualVibe.error || 'Connection not saved yet.'}</span>
              )}
            </div>
            <div className="mt-6 grid gap-3">
              {chat.mutualVibe.saved && (
                <Link
                  href="/connections"
                  className="rounded-xl bg-white px-4 py-3 font-bold text-black transition hover:bg-white/90"
                >
                  View Connections
                </Link>
              )}
              <button
                onClick={chat.dismissMutualVibe}
                className="rounded-xl border border-white/15 px-4 py-3 font-semibold text-white/90 hover:bg-white/10"
              >
                Keep talking
              </button>
            </div>
          </div>
        </div>
      )}

      <VideoChatModals
        isReportModalOpen={isReportModalOpen}
        closeReportModal={closeReportModal}
        onSubmitReport={handleReport}
        reportedUserId={chat.currentPeerUserId || undefined}
        showKeyboardHelp={state.showKeyboardHelp}
        setShowKeyboardHelp={state.setShowKeyboardHelp}
        keyboardShortcuts={state.keyboardShortcuts}
        showTutorial={state.showTutorial}
        setShowTutorial={state.setShowTutorial}
        showSafetyGuidelines={state.showSafetyGuidelines}
        setShowSafetyGuidelines={state.setShowSafetyGuidelines}
        showTroubleshooting={state.showTroubleshooting}
        setShowTroubleshooting={state.setShowTroubleshooting}
        isDarkTheme={state.isDarkTheme}
        showReportPanel={state.showReportPanel}
        setShowReportPanel={state.setShowReportPanel}
        reportReason={state.reportReason}
        setReportReason={state.setReportReason}
        isReporting={state.isReporting}
        reportSuccess={state.reportSuccess}
        onSubmitLegacyReport={handleSubmitLegacyReport}
      />
    </div>
  )
}
