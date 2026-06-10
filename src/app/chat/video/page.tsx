'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const searchConfig = {
    isDating: searchParams.get('mode') === 'dating',
    isDemo: searchParams.get('demo') === 'true',
    demoPartnerId: searchParams.get('partner'),
    selectedInterest: searchParams.get('interest'),
  }

  const state = useVideoChatState(searchConfig)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localPipVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const { stream } = useLocalMediaStream(localVideoRef, state.setError)
  const { peerConnection, restartConnection } = usePeerConnection(stream)

  const chat = useVideoChatSocket({
    stream,
    peerConnection,
    restartConnection,
    isDating: state.isDating,
    isDemo: searchConfig.isDemo,
    userProfile: state.userProfile,
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

  const { isReportModalOpen, handleReport, openReportModal, closeReportModal } = useReporting()

  useEffect(() => {
    document.body.classList.add('overflow-hidden', 'bg-black')
    return () => {
      document.body.classList.remove('overflow-hidden', 'bg-black')
    }
  }, [])

  const handleNextPerson = useCallback(() => {
    const result = chat.handleNextPerson()
    if (result === 'leave') chat.handleLeaveChat()
  }, [chat])

  const handleSubmitLegacyReport = useCallback(() => {
    if (!state.reportReason || !chat.socket) return
    state.setIsReporting(true)
    chat.socket.emit('report-user', {
      reason: state.reportReason,
      timestamp: new Date().toISOString(),
    })
    setTimeout(() => {
      state.setIsReporting(false)
      state.setReportSuccess(true)
      setTimeout(() => {
        state.setShowReportPanel(false)
        state.setReportSuccess(false)
        state.setReportReason('')
        handleNextPerson()
      }, 2000)
    }, 1000)
  }, [state, chat.socket, handleNextPerson])

  const handleReportExplicit = useCallback(() => {
    state.setHasExplicitContent(true)
    chat.reportExplicitContent()
    alert(
      'Potentially inappropriate content detected. The video has been blurred for your safety. You can unblur it or find a new chat partner.'
    )
    state.toggleBlurRemoteVideo()
  }, [state, chat])

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
        isMuted={media.isMuted}
        isCameraOff={media.isCameraOff}
        isScreenSharing={media.isScreenSharing}
        onStartChat={chat.handleStartChat}
        onNextPerson={handleNextPerson}
        onLeaveChat={chat.handleLeaveChat}
        onToggleMute={media.toggleLocalMute}
        onToggleCamera={media.toggleLocalCamera}
        onToggleScreenShare={media.toggleScreenShare}
        onOpenTroubleshooting={() => state.setShowTroubleshooting(true)}
        onOpenReport={() => openReportModal(chat.currentPeer || '')}
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
        isDating={state.isDating}
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

      <VideoChatModals
        isReportModalOpen={isReportModalOpen}
        closeReportModal={closeReportModal}
        onSubmitReport={handleReport}
        reportedUserId={chat.currentPeer || undefined}
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
