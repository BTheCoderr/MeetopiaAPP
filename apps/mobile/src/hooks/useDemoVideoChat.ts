import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { MediaStream } from 'react-native-webrtc'
import type { ReportCategory } from '@/components/safety/ReportModal'
import {
  getBlockedEntries,
  isBlockedEntry,
  type BlockedEntry,
} from '@/lib/onboardingStorage'
import type { ChatMessage } from '@/types/videoChat'
import type { PeerProfilePayload } from '@/hooks/useMobileVideoChatSocket'

const DEMO_PEER_ID = 'demo-peer'
const DEMO_PROFILE: PeerProfilePayload = {
  name: 'Alex',
  age: 28,
  city: 'Demo City',
  intent: 'vibe_check',
  prompt: 'Here for good vibes — this is a simulated match.',
  gender: 'other',
  lookingFor: 'both',
}

interface Options {
  enabled: boolean
  stream: MediaStream | null
}

export function useDemoVideoChat({ enabled, stream }: Options) {
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [peerProfile, setPeerProfile] = useState<PeerProfilePayload | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isPeerConnected, setIsPeerConnected] = useState(false)
  const [myVibeSent, setMyVibeSent] = useState(false)
  const [peerVibeReceived, setPeerVibeReceived] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const blockedRef = useRef<BlockedEntry[]>([])
  const matchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const vibeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutualVibe = myVibeSent && peerVibeReceived

  useEffect(() => {
    if (!enabled) return
    getBlockedEntries().then(entries => {
      blockedRef.current = entries
    })
  }, [enabled])

  const clearTimers = () => {
    if (matchTimer.current) clearTimeout(matchTimer.current)
    if (vibeTimer.current) clearTimeout(vibeTimer.current)
  }

  const resetDemo = useCallback(() => {
    clearTimers()
    setCurrentPeer(null)
    setPeerProfile(null)
    setIsSearching(false)
    setIsPeerConnected(false)
    setMyVibeSent(false)
    setPeerVibeReceived(false)
    setMessages([])
    setNewMessage('')
  }, [])

  useEffect(() => {
    if (!enabled) resetDemo()
    return () => clearTimers()
  }, [enabled, resetDemo])

  const simulateMatch = useCallback(() => {
    if (isBlockedEntry(blockedRef.current, DEMO_PEER_ID, DEMO_PROFILE)) {
      Alert.alert('Demo peer blocked', 'Unblock from a fresh install or clear blocks in Settings.')
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    matchTimer.current = setTimeout(() => {
      setCurrentPeer(DEMO_PEER_ID)
      setPeerProfile(DEMO_PROFILE)
      setIsSearching(false)
      setIsPeerConnected(true)
    }, 2000)
  }, [])

  const handleStartChat = useCallback(() => {
    if (!enabled || !stream) return
    resetDemo()
    simulateMatch()
  }, [enabled, stream, resetDemo, simulateMatch])

  const handleNextPerson = useCallback(() => {
    resetDemo()
    simulateMatch()
  }, [resetDemo, simulateMatch])

  const handleLeaveChat = useCallback(() => {
    Alert.alert('Leave Demo Mode?', 'You will return to the home screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: resetDemo,
      },
    ])
  }, [resetDemo])

  const sendVibe = useCallback(() => {
    if (!currentPeer || myVibeSent) return
    setMyVibeSent(true)
    vibeTimer.current = setTimeout(() => {
      setPeerVibeReceived(true)
      setMessages([
        {
          id: 'demo-1',
          text: 'Hey! Nice to meet you in Demo Mode 👋',
          sender: 'peer',
          timestamp: Date.now(),
        },
      ])
    }, 800)
  }, [currentPeer, myVibeSent])

  const reportUser = useCallback((_category: ReportCategory | string) => {
    Alert.alert(
      'Demo report logged',
      'In Demo Mode, reports are not sent to the server. Use live Chemistry Check to test real reporting.',
    )
  }, [])

  const refreshBlockedList = useCallback(async () => {
    blockedRef.current = await getBlockedEntries()
  }, [])

  const emitStreamState = useCallback((_type: 'audio' | 'video', _enabled: boolean) => {}, [])

  const handleMessageChange = useCallback((text: string) => {
    setNewMessage(text)
  }, [])

  const handleSendMessage = useCallback(() => {
    const text = newMessage.trim()
    if (!text || !mutualVibe) return
    setMessages(prev => [
      ...prev,
      { id: `demo-me-${Date.now()}`, text, sender: 'me', timestamp: Date.now() },
    ])
    setNewMessage('')
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `demo-reply-${Date.now()}`,
          text: 'Love the energy! (simulated reply)',
          sender: 'peer',
          timestamp: Date.now(),
        },
      ])
    }, 1200)
  }, [newMessage, mutualVibe])

  return {
    socket: null,
    isSocketConnected: true,
    currentPeer: enabled ? currentPeer : null,
    peerProfile: enabled ? peerProfile : null,
    remoteStream: null,
    isPeerConnected: enabled ? isPeerConnected : false,
    isSearching: enabled ? isSearching : false,
    error: null,
    myVibeSent: enabled ? myVibeSent : false,
    peerVibeReceived: enabled ? peerVibeReceived : false,
    mutualVibe: enabled ? mutualVibe : false,
    handleStartChat,
    handleNextPerson,
    handleLeaveChat,
    emitStreamState,
    sendVibe,
    reportUser,
    refreshBlockedList,
    isDemo: true as const,
    messages,
    newMessage,
    handleMessageChange,
    handleSendMessage,
    isPeerTyping: false,
  }
}

export { DEMO_PROFILE, DEMO_PEER_ID }
