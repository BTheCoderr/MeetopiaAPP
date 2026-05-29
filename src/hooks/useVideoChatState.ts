'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type {
  UserProfile,
  BandwidthQuality,
  SimulatedDemoState,
  KeyboardShortcut,
  VideoChatSearchParams,
} from '@/types/videoChat'
import { INTEREST_CATEGORIES } from '@/constants/interestCategories'

export function useVideoChatState(searchParams: VideoChatSearchParams) {
  const router = useRouter()
  const { isDating, isDemo, demoPartnerId } = searchParams

  const [showTutorial, setShowTutorial] = useState(false)
  const [showSafetyGuidelines, setShowSafetyGuidelines] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [showReportPanel, setShowReportPanel] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const [isClient, setIsClient] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<Record<string, unknown> | null>(null)
  const [demoPartner, setDemoPartner] = useState<Record<string, unknown> | null>(null)
  const [isSimulatingConnection, setIsSimulatingConnection] = useState(false)
  const [simulatedDemoState, setSimulatedDemoState] = useState<SimulatedDemoState>(null)
  const [simulatedMessages, setSimulatedMessages] = useState<unknown[]>([])

  const [bandwidthQuality, setBandwidthQuality] = useState<BandwidthQuality>('medium')
  const [isAdaptiveQuality, setIsAdaptiveQuality] = useState(true)

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
    setBlurRemoteVideo(prev => !prev)
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

  const simulateDemoStream = useCallback((partnerName?: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const drawAvatar = () => {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#4338ca')
        gradient.addColorStop(1, '#3b82f6')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2 - 50, 80, 0, Math.PI * 2)
        ctx.fillStyle = '#f3f4f6'
        ctx.fill()
        ctx.fillStyle = '#1f2937'
        ctx.beginPath()
        ctx.arc(canvas.width / 2 - 25, canvas.height / 2 - 70, 8, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2 + 25, canvas.height / 2 - 70, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2 - 30, 30, 0.1 * Math.PI, 0.9 * Math.PI)
        ctx.strokeStyle = '#1f2937'
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.font = '24px Arial'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.fillText(`Demo: ${partnerName || 'User'}`, canvas.width / 2, canvas.height / 2 + 100)
        ctx.font = '18px Arial'
        ctx.fillText('This is a simulated connection', canvas.width / 2, canvas.height / 2 + 130)
      }
      drawAvatar()
      setInterval(() => {
        drawAvatar()
        const time = Date.now() / 1000
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.beginPath()
        ctx.arc(
          canvas.width / 2 + Math.sin(time) * 20,
          canvas.height / 2 + 180 + Math.cos(time) * 10,
          5, 0, Math.PI * 2
        )
        ctx.fill()
      }, 100)
    }
    const fakeStream = canvas.captureStream(15)
    try {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0.01
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start()
      const audioTrack = audioContext.createMediaStreamDestination().stream.getAudioTracks()[0]
      fakeStream.addTrack(audioTrack)
    } catch (e) {
      console.error('Could not create fake audio track', e)
    }
    window.dispatchEvent(new CustomEvent('remote-stream', { detail: { stream: fakeStream } }))
  }, [])

  const simulateDemoChat = useCallback((demoUser: Record<string, unknown>) => {
    const interests = Array.isArray(demoUser.interests) ? demoUser.interests : []
    const DEMO_MESSAGES = [
      { text: 'Hi there! Nice to meet you!', delay: 3000 },
      { text: 'How are you doing today?', delay: 8000 },
      { text: `I'm interested in ${interests.join(' and ')}. What about you?`, delay: 15000 },
      { text: 'This is a demo chat to show how the interface works.', delay: 22000 },
      { text: 'You can test out features like sending messages and leaving the chat.', delay: 30000 },
    ]
    DEMO_MESSAGES.forEach((message, index) => {
      setTimeout(() => {
        const messageId = Date.now() + index
        const chatMessage = {
          id: messageId.toString(),
          text: message.text,
          from: demoUser.id,
          timestamp: Date.now(),
        }
        window.dispatchEvent(new CustomEvent('chat-message', { detail: chatMessage }))
        setSimulatedMessages(prev => [...prev, chatMessage])
      }, message.delay)
    })
  }, [])

  const simulateDemoConnection = useCallback((demoUser: Record<string, unknown>) => {
    setSimulatedDemoState('connecting')
    setTimeout(() => {
      setSimulatedDemoState('connected')
      simulateDemoStream(demoUser.name as string | undefined)
      setPartnerProfile({
        name: demoUser.name,
        age: demoUser.age,
        gender: demoUser.gender,
        interests: (demoUser.interests as string[]).map((id: string) => {
          const category = INTEREST_CATEGORIES.find(cat => cat.id === id)
          return category ? category.name : id
        }),
        bio: `Hi, I'm ${demoUser.name}. This is a demo profile for testing.`,
      })
      setTimeout(() => {
        setSimulatedDemoState('chatting')
        simulateDemoChat(demoUser)
      }, 2000)
    }, 2000)
  }, [simulateDemoStream, simulateDemoChat])

  useEffect(() => {
    if (isDating) {
      const savedProfile = localStorage.getItem('datingProfileFormatted')
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile))
        } catch (e) {
          console.error('Error parsing saved profile', e)
        }
      } else {
        router.push('/dating/profile')
      }
    }
    if (isDemo && demoPartnerId) {
      const savedDemoPartner = localStorage.getItem('demoPartner')
      if (savedDemoPartner) {
        try {
          const demoUser = JSON.parse(savedDemoPartner)
          setDemoPartner(demoUser)
          setIsSimulatingConnection(true)
          simulateDemoConnection(demoUser)
        } catch (e) {
          console.error('Error parsing demo partner', e)
        }
      }
    }
  }, [isDating, isDemo, demoPartnerId, router, simulateDemoConnection])

  return {
    isDating,
    isDemo,
    showTutorial, setShowTutorial,
    showSafetyGuidelines, setShowSafetyGuidelines,
    showKeyboardHelp, setShowKeyboardHelp,
    showTroubleshooting, setShowTroubleshooting,
    showReportPanel, setShowReportPanel,
    reportReason, setReportReason,
    isReporting, setIsReporting,
    reportSuccess, setReportSuccess,
    isClient,
    userProfile,
    partnerProfile,
    demoPartner,
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
