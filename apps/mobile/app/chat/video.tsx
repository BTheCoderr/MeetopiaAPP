import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
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
import { useMobileVideoChatMessages } from '@/hooks/useMobileVideoChatMessages'
import { isOnboardingComplete, getStoredProfile, blockUser } from '@/lib/onboardingStorage'
import { toSignalingProfile } from '@/types/profile'

export default function VideoChatScreen() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [signalingProfile, setSignalingProfile] = useState<Record<string, unknown> | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [timerActive, setTimerActive] = useState(false)

  const { stream, error: mediaError } = useMobileMedia()
  const { peerConnection, restartConnection } = useMobilePeerConnection(stream)

  useEffect(() => {
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
  }, [router])

  const chat = useMobileVideoChatSocket({
    stream,
    peerConnection,
    restartConnection,
    signalingProfile,
  })

  const messages = useMobileVideoChatMessages({
    socket: chat.socket,
    currentPeer: chat.mutualVibe ? chat.currentPeer : null,
  })

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
    Alert.alert('Block user?', 'They will be skipped and cannot reconnect this session.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          await blockUser(peer)
          chat.reportUser('blocked')
          socketLeaveAndSkip()
        },
      },
    ])
  }

  const socketLeaveAndSkip = () => {
    chat.handleNextPerson()
  }

  const onReportSubmit = (category: ReportCategory) => {
    chat.reportUser(category)
    Alert.alert('Report submitted', 'Our team reviews reports. Leave the chat if you feel unsafe.')
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
            <ChemistryTimer active={timerActive} />
          </View>
          <Text style={[styles.status, chat.isSocketConnected ? styles.online : styles.offline]}>
            {chat.isSocketConnected ? '●' : '○'}
          </Text>
        </View>
        <ProfileCard profile={chat.peerProfile} visible={Boolean(chat.currentPeer)} />
      </SafeAreaView>

      {(mediaError || chat.error) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{mediaError ?? chat.error}</Text>
        </View>
      )}

      <MessageBar
        messages={messages.messages}
        value={messages.newMessage}
        onChange={messages.handleMessageChange}
        onSend={messages.handleSendMessage}
        disabled={!chat.mutualVibe}
        isPeerTyping={messages.isPeerTyping}
      />

      <ControlBar
        hasPeer={Boolean(chat.currentPeer)}
        isSearching={chat.isSearching}
        isSocketConnected={chat.isSocketConnected}
        canStart={Boolean(stream && signalingProfile)}
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
  status: { fontSize: 14, width: 32, textAlign: 'right' },
  online: { color: '#30D158' },
  offline: { color: '#FF453A' },
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
