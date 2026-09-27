'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BandwidthQuality, KeyboardShortcut } from '@/types/videoChat'

export function useVideoChatState() {
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSafetyGuidelines, setShowSafetyGuidelines] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [showReportPanel, setShowReportPanel] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const [isClient, setIsClient] = useState(false)
  const [bandwidthQuality, setBandwidthQuality] = useState<BandwidthQuality>('medium')
  const [isAdaptiveQuality] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [buttonCooldown, setButtonCooldown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const [areControlsVisible, setAreControlsVisible] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const [hasExplicitContent, setHasExplicitContent] = useState(false)
  const [blurRemoteVideo, setBlurRemoteVideo] = useState(false)

  const keyboardShortcuts: KeyboardShortcut[] = [
    { key: 'Space', action: 'Start chat or skip to next person' },
    { key: 'Escape', action: 'Leave current chat' },
    { key: 'M', action: 'Toggle microphone mute' },
    { key: 'V', action: 'Toggle camera' },
    { key: 'C', action: 'Focus chat input' },
    { key: 'H', action: 'Show/hide keyboard shortcuts' },
    { key: '?', action: 'Open connection troubleshooting guide' },
  ]

  const startCooldown = useCallback(() => {
    setButtonCooldown(true)
    setTimeout(() => setButtonCooldown(false), 5000)
  }, [])

  const handleControlsVisibility = useCallback(() => {
    setAreControlsVisible(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      setAreControlsVisible(false)
    }, 7000)
  }, [])

  const handleChatFocus = useCallback(() => {
    setAreControlsVisible(true)
    setIsChatOpen(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
  }, [])

  const toggleBlurRemoteVideo = useCallback(() => {
    setBlurRemoteVideo(previous => !previous)
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasCompletedTutorial = localStorage.getItem('meetopia_tutorial_completed') === 'true'
    const hasAcceptedSafety = localStorage.getItem('meetopia_safety_accepted') === 'true'
    if (!hasCompletedTutorial) setShowTutorial(true)
    else if (!hasAcceptedSafety) setShowSafetyGuidelines(true)
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleControlsVisibility)
    return () => {
      document.removeEventListener('mousemove', handleControlsVisibility)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [handleControlsVisibility])

  return {
    showTutorial, setShowTutorial,
    showSafetyGuidelines, setShowSafetyGuidelines,
    showKeyboardHelp, setShowKeyboardHelp,
    showTroubleshooting, setShowTroubleshooting,
    showReportPanel, setShowReportPanel,
    reportReason, setReportReason,
    isReporting, setIsReporting,
    reportSuccess, setReportSuccess,
    isClient,
    bandwidthQuality, setBandwidthQuality,
    isAdaptiveQuality,
    error, setError,
    buttonCooldown,
    isSearching, setIsSearching,
    areControlsVisible,
    isMenuOpen, setIsMenuOpen,
    isDarkTheme, setIsDarkTheme,
    isChatOpen, setIsChatOpen,
    hasExplicitContent, setHasExplicitContent,
    blurRemoteVideo,
    keyboardShortcuts,
    startCooldown,
    handleChatFocus,
    toggleBlurRemoteVideo,
  }
}
