import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoStage from '@/components/video/VideoStage'
import MessageBar from '@/components/video/MessageBar'
import ControlBar from '@/components/video/ControlBar'
import ProfileCard from '@/components/video/ProfileCard'
import ChemistryTimer from '@/components/video/ChemistryTimer'
import ReportModal, { type ReportCategory } from '@/components/safety/ReportModal'
import { layout } from '@/components/video/mobileLayout'
import { useMobileMedia } from '@/hooks/useMobileMedia'
import { useMobilePeerConnection } from '@/hooks/useMobilePeerConnection'
import { useMobileVideoChatSocket } from '@/hooks/useMobileVideoChatSocket'
import { useDemoVideoChat } from '@/hooks/useDemoVideoChat'
import { useMobileVideoChatMessages } from '@/hooks/useMobileVideoChatMessages'
import {
  isOnboardingComplete,
  isAgeVerified,
  getStoredProfile,
  blockUser,
} from '@/lib/onboardingStorage'
import { toSignalingProfile } from '@/types/profile'

export default function VideoChatScreen() {
  const router = useRouter()
  const { demo } = useLocalSearchParams<{ demo?: string }>()
  const isDemo = demo === '1'

  const [ready, setReady] = useState(false)
  const [signalingProfile, setSignalingProfile] = useState<Record<string, unknown> | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [timerActive, setTimerActive] = useState(false)

  const { stream, error: mediaError } = useMobileMedia()
  const { peerConnection, restartConnection } = useMobilePeerConnection(stream)

  useEffect(() => {
    if (isDemo) {
      isAgeVerified().then(ok => {
        if (!ok) {
          router.replace('/onboarding/age-gate')
          return
        }
        setReady(true)
      })
      return
    }

    isOnboardingComplete().then(ok => {
      if (!ok) {
        router.replace('/onboarding/age-gate')
        return
      }
      getStoredProfile().then(p => {
        if (!p) {
          router.replace('/onboarding/profile')
          return
        }
        setSignalingProfile(toSignalingProfile(p))
        setReady(true)
      })
    })
  }, [router, isDemo])

  const liveChat = useMobileVideoChatSocket({
    stream,
    peerConnection,
    restartConnection,
    signalingProfile,
    enabled: !isDemo,
  })

  const demoChat = useDemoVideoChat({ enabled: isDemo, stream })

  const chat = isDemo ? demoChat : liveChat

  const liveMessages = useMobileVideoChatMessages({
    socket: liveChat.socket,
    currentPeer: liveChat.mutualVibe ? liveChat.currentPeer : null,
    enabled: !isDemo,
  })

  const messages = isDemo ? demoChat.messages : liveMessages.messages
  const newMessage = isDemo ? demoChat.newMessage : liveMessages.newMessage
  const handleMessageChange = isDemo ? demoChat.handleMessageChange : liveMessages.handleMessageChange
  const handleSendMessage = isDemo ? demoChat.handleSendMessage : liveMessages.handleSendMessage
  const isPeerTyping = isDemo ? demoChat.isPeerTyping : liveMessages.isPeerTyping

  useEffect(() => {
    setTimerActive(Boolean(chat.currentPeer))
  }, [chat.currentPeer])

  const toggleMute = () => {
    if (!stream) return
    const next = !isMuted
    stream.getAudioTracks().forEach(t => {
      t.enabled = !next
    })
    setIsMuted(next)
    chat.emitStreamState('audio', !next)
  }

  const toggleCamera = () => {
    if (!stream) return
    const next = !isCameraOff
    stream.getVideoTracks().forEach(t => {
      t.enabled = !next
    })
    setIsCameraOff(next)
    chat.emitStreamState('video', !next)
  }

  const handleBlock = () => {
    const peer = chat.currentPeer
    if (!peer) return
    Alert.alert(
      'Block user?',
      "They won't be matched with you again on this device.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await blockUser(peer, chat.peerProfile ?? undefined)
            await chat.refreshBlockedList()
            chat.handleNextPerson()
          },
        },
      ],
    )
  }

  const onReportSubmit = (category: ReportCategory) => {
    chat.reportUser(category)
    if (!isDemo) {
      Alert.alert(
        'Report submitted',
        'Meetopia logs reports for review. Leave the chat if you feel unsafe.',
      )
    }
  }

  if (!ready) {
    return <View style={styles.loading} />
  }

  return (
    <View style={layout.root}>
      <VideoStage
        localStream={stream}
        remoteStream={chat.remoteStream}
        isPeerConnected={chat.isPeerConnected}
        isSearching={chat.isSearching}
        hasPeer={Boolean(chat.currentPeer)}
        isCameraOff={isCameraOff}
        hideConnectingOverlay={isDemo && Boolean(chat.currentPeer)}
        overlayHint={isDemo && chat.isSearching ? 'Demo Mode — finding simulated match…' : undefined}
      />

      <SafeAreaView style={styles.header} edges={['top']} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <Text style={styles.back} onPress={() => router.back()}>
            ←
          </Text>
          <View style={styles.headerCenter}>
            <Text style={styles.logo}>
              <Text style={styles.brand}>Meet</Text>opia
            </Text>
            {isDemo && <Text style={styles.demoBadge}>Demo Mode</Text>}
            <ChemistryTimer active={timerActive} />
          </View>
          <Text style={[styles.status, chat.isSocketConnected ? styles.online : styles.offline]}>
            {chat.isSocketConnected ? '●' : '○'}
          </Text>
        </View>
        <ProfileCard profile={chat.peerProfile} visible={Boolean(chat.currentPeer)} />
      </SafeAreaView>

      {isDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            Demo Mode — no real users connected. Simulated match for App Review testing.
          </Text>
        </View>
      )}

      {(mediaError || chat.error) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{mediaError ?? chat.error}</Text>
        </View>
      )}

      <MessageBar
        messages={messages}
        value={newMessage}
        onChange={handleMessageChange}
        onSend={handleSendMessage}
        disabled={!chat.mutualVibe}
        isPeerTyping={isPeerTyping}
      />

      <ControlBar
        hasPeer={Boolean(chat.currentPeer)}
        isSearching={chat.isSearching}
        isSocketConnected={chat.isSocketConnected}
        canStart={Boolean(stream && (isDemo || signalingProfile))}
        onStart={chat.handleStartChat}
        onNext={chat.handleNextPerson}
        onLeave={chat.handleLeaveChat}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onVibe={chat.sendVibe}
        onReport={() => setReportOpen(true)}
        onBlock={handleBlock}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        myVibeSent={chat.myVibeSent}
        mutualVibe={chat.mutualVibe}
      />

      <ReportModal visible={reportOpen} onClose={() => setReportOpen(false)} onSubmit={onReportSubmit} />
    </View>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#000' },
  header: { ...layout.header },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCenter: { flex: 1, alignItems: 'center' },
  back: { color: '#fff', fontSize: 22, width: 32 },
  logo: { color: '#fff', fontSize: 18, fontWeight: '600' },
  brand: { color: '#0A84FF' },
  demoBadge: { color: '#FFD60A', fontSize: 12, fontWeight: '600', marginTop: 2 },
  status: { fontSize: 14, width: 32, textAlign: 'right' },
  online: { color: '#30D158' },
  offline: { color: '#FF453A' },
  demoBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.4)',
    padding: 10,
    borderRadius: 10,
    zIndex: 40,
  },
  demoBannerText: { color: '#FFD60A', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  errorBanner: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(127,29,29,0.85)',
    padding: 12,
    borderRadius: 10,
    zIndex: 50,
  },
  errorText: { color: '#fff', fontSize: 13 },
})
