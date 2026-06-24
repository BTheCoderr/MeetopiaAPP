import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoStage from '@/components/video/VideoStage'
import MessageBar from '@/components/video/MessageBar'
import ControlBar from '@/components/video/ControlBar'
import ProfileCard from '@/components/video/ProfileCard'
import ChemistryTimer from '@/components/video/ChemistryTimer'
import ReportModal, { type ReportCategory } from '@/components/safety/ReportModal'
import Avatar from '@/components/ui/Avatar'
import { layout } from '@/components/video/mobileLayout'
import { colors } from '@/theme/theme'
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
import { getSuggestedMatch } from '@/data/suggestedMatches'
import type { PeerProfilePayload } from '@/hooks/useMobileVideoChatSocket'

export default function VideoChatScreen() {
  const router = useRouter()
  const { demo, matchId } = useLocalSearchParams<{ demo?: string; matchId?: string }>()
  const match = getSuggestedMatch(matchId)
  // Both Demo Mode and an accepted suggested-match use the local, profile-based experience.
  const isDemo = demo === '1' || Boolean(match)
  const cameFromMatch = Boolean(match)

  const matchPeerProfile: PeerProfilePayload | null = match
    ? {
        name: match.name,
        age: match.age,
        city: match.city,
        intent: match.intent,
        prompt: match.prompt,
        gender: 'other',
        lookingFor: 'both',
      }
    : null

  const [ready, setReady] = useState(false)
  const [signalingProfile, setSignalingProfile] = useState<Record<string, unknown> | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [vibeDismissed, setVibeDismissed] = useState(false)

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

  const demoChat = useDemoVideoChat({
    enabled: isDemo,
    stream,
    matchProfile: matchPeerProfile,
    autoStart: cameFromMatch,
  })

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

  useEffect(() => {
    if (!chat.mutualVibe) setVibeDismissed(false)
  }, [chat.mutualVibe])

  const peerName = chat.peerProfile?.name ?? match?.name ?? null
  const connecting = Boolean(chat.currentPeer) && !chat.isPeerConnected
  const showPreparing = chat.isSearching || connecting

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
      `Block ${peerName ?? 'this person'}?`,
      "They won't be matched with you again on this device.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await blockUser(peer, chat.peerProfile ?? undefined)
            await chat.refreshBlockedList()
            Alert.alert(
              'Blocked',
              "You won't be matched with this person again on this device.",
            )
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
        'Report received',
        'Thank you for helping keep Meetopia safe. Leave the chat if you feel unsafe.',
      )
    }
  }

  if (!ready) {
    return <View style={styles.loading} />
  }

  const showVibeSuccess = chat.mutualVibe && !vibeDismissed

  return (
    <View style={layout.root}>
      <VideoStage
        localStream={stream}
        remoteStream={chat.remoteStream}
        isPeerConnected={chat.isPeerConnected}
        isSearching={chat.isSearching}
        hasPeer={Boolean(chat.currentPeer)}
        isCameraOff={isCameraOff}
        hideConnectingOverlay
      />

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Chemistry Check</Text>
            {peerName ? <Text style={styles.meeting}>You&apos;re meeting {peerName}</Text> : null}
            <ChemistryTimer active={timerActive && chat.isPeerConnected} />
          </View>
          <View style={styles.statusWrap}>
            <Text style={[styles.status, chat.isSocketConnected ? styles.online : styles.offline]}>
              ●
            </Text>
          </View>
        </View>
        <ProfileCard profile={chat.peerProfile} visible={chat.isPeerConnected && Boolean(chat.currentPeer)} />
      </SafeAreaView>

      {isDemo && (
        <View style={styles.demoBanner} pointerEvents="none">
          <Text style={styles.demoBannerText}>
            Demo Mode: simulated profile-based Chemistry Check for review/testing.
          </Text>
        </View>
      )}

      {/* Preparing overlay */}
      {showPreparing && (
        <View style={styles.preparing} pointerEvents="none">
          {peerName ? <Avatar name={peerName} size={84} /> : null}
          {peerName ? <Text style={styles.preparingName}>{peerName}</Text> : null}
          <Text style={styles.preparingText}>Preparing your Chemistry Check…</Text>
        </View>
      )}

      {(mediaError || chat.error) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{mediaError ?? chat.error}</Text>
        </View>
      )}

      {/* Mutual vibe success */}
      {showVibeSuccess && (
        <View style={styles.vibeOverlay}>
          <View style={styles.vibeCard}>
            <Text style={styles.vibeEmoji}>✨</Text>
            <Text style={styles.vibeTitle}>It&apos;s a Vibe</Text>
            <Text style={styles.vibeSub}>Chat unlocked because you both tapped Vibe.</Text>
            <Pressable style={styles.vibePrimary} onPress={() => setVibeDismissed(true)}>
              <Text style={styles.vibePrimaryText}>Send Message</Text>
            </Pressable>
            <Pressable
              style={styles.vibeSecondary}
              onPress={() => router.replace(isDemo ? '/matches?demo=1' : '/matches')}
            >
              <Text style={styles.vibeSecondaryText}>Back to Matches</Text>
            </Pressable>
          </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  back: { color: '#fff', fontSize: 34, fontWeight: '300', lineHeight: 34 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  meeting: { color: colors.brandBlueLight, fontSize: 13, fontWeight: '500', marginTop: 2 },
  statusWrap: { width: 40, alignItems: 'flex-end', justifyContent: 'center', paddingTop: 6 },
  status: { fontSize: 12 },
  online: { color: colors.success },
  offline: { color: colors.danger },
  demoBanner: {
    position: 'absolute',
    top: 132,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.4)',
    padding: 10,
    borderRadius: 12,
    zIndex: 35,
    alignSelf: 'center',
    maxWidth: 488,
  },
  demoBannerText: { color: colors.warning, fontSize: 12, textAlign: 'center', lineHeight: 17 },
  preparing: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 20 },
  preparingName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  preparingText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  errorBanner: {
    position: 'absolute',
    top: 170,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(127,29,29,0.9)',
    padding: 12,
    borderRadius: 10,
    zIndex: 50,
    alignSelf: 'center',
    maxWidth: 488,
  },
  errorText: { color: '#fff', fontSize: 13 },
  vibeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
    padding: 24,
  },
  vibeCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 28,
    alignItems: 'center',
  },
  vibeEmoji: { fontSize: 44 },
  vibeTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 8 },
  vibeSub: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  vibePrimary: {
    backgroundColor: colors.brandPurple,
    borderRadius: 14,
    paddingVertical: 15,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 24,
  },
  vibePrimaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  vibeSecondary: { paddingVertical: 14, alignSelf: 'stretch', alignItems: 'center', marginTop: 4 },
  vibeSecondaryText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
})
