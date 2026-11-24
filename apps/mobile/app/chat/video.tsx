import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoStage from '@/components/video/VideoStage'
import MessageBar from '@/components/video/MessageBar'
import ControlBar from '@/components/video/ControlBar'
import ChemistryTimer from '@/components/video/ChemistryTimer'
import VibeRounds from '@/components/video/VibeRounds'
import ReportModal, { type ReportCategory } from '@/components/safety/ReportModal'
import { layout } from '@/components/video/mobileLayout'
import { colors } from '@/theme/theme'
import { useMobileMedia } from '@/hooks/useMobileMedia'
import { useMobilePeerConnection } from '@/hooks/useMobilePeerConnection'
import { useCurrentMeetopiaSignaling } from '@/hooks/useCurrentMeetopiaSignaling'
import { useMobileVideoChatMessages } from '@/hooks/useMobileVideoChatMessages'
import { usePersistentInCallMessages } from '@/hooks/usePersistentInCallMessages'
import { currentProduct } from '@/lib/currentProduct'
import { accountStatus, isAuthFailure } from '@/lib/auth'
import { invalidateAuthenticatedSocket } from '@/lib/socket'
import { isVibeThemeId } from '@/types/vibeThemes'

export default function VideoChatScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ themeId?: string | string[]; connectionId?: string | string[]; incomingCallId?: string | string[] }>()
  const selectedTheme = Array.isArray(params.themeId) ? params.themeId[0] : params.themeId
  const directCall = Boolean(params.connectionId || params.incomingCallId)
  const [access, setAccess] = useState<'checking' | 'allowed' | 'error'>('checking')
  const [accessError, setAccessError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    void accountStatus().then(async ({ adultConfirmed }) => {
      if (!active) return
      if (!adultConfirmed) { router.replace('/onboarding/age-gate'); return }
      const passport = await currentProduct.passport.get()
      if (!active) return
      if (!passport.complete) { router.replace('/onboarding/passport'); return }
      if (!directCall && !isVibeThemeId(selectedTheme)) { router.replace('/sessions'); return }
      setAccess('allowed')
    }).catch(cause => {
      if (!active) return
      if (isAuthFailure(cause)) router.replace('/auth/signin')
      else {
        setAccessError(cause instanceof Error ? cause.message : 'Could not verify your account.')
        setAccess('error')
      }
    })
    return () => { active = false }
  }, [router, attempt, directCall, selectedTheme])
  if (access !== 'allowed') return <View style={layout.root}>
    <View style={styles.accessGate}>
      <Text style={styles.accessText}>{accessError || 'Checking Meetopia account…'}</Text>
      {access === 'error' ? <Pressable onPress={() => { setAccess('checking'); setAccessError(null); setAttempt(n => n + 1) }}><Text style={styles.accessRetry}>Retry</Text></Pressable> : null}
    </View>
  </View>
  return <LiveVideoScreen />
}

function LiveVideoScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ themeId?: string | string[]; connectionId?: string | string[]; incomingCallId?: string | string[] }>()
  const themeCandidate = Array.isArray(params.themeId) ? params.themeId[0] : params.themeId
  const themeId = isVibeThemeId(themeCandidate) ? themeCandidate : null
  const connectionId = Array.isArray(params.connectionId) ? params.connectionId[0] : params.connectionId
  const incomingCallId = Array.isArray(params.incomingCallId) ? params.incomingCallId[0] : params.incomingCallId
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [dismissedConnectionId, setDismissedConnectionId] = useState<string | null>(null)
  const { stream, error: mediaError } = useMobileMedia()
  const { peerConnection, restartConnection } = useMobilePeerConnection(stream)
  const chat = useCurrentMeetopiaSignaling({ stream, peerConnection, restartConnection, themeId, directConnectionId: connectionId || null, incomingCallId: incomingCallId || null })
  const activeConnectionId = chat.mutualVibe?.saved ? chat.mutualVibe.connectionId : connectionId || null
  const persistentMessages = usePersistentInCallMessages({ socket: chat.socket, connectionId: activeConnectionId })
  const chemistryMessages = useMobileVideoChatMessages({ socket: chat.socket, currentPeer: chat.peerId, enabled: !activeConnectionId })
  const messages = activeConnectionId ? persistentMessages.messages : chemistryMessages.messages
  const draft = activeConnectionId ? persistentMessages.newMessage : chemistryMessages.newMessage
  const onDraftChange = activeConnectionId ? persistentMessages.handleMessageChange : chemistryMessages.handleMessageChange
  const isPeerTyping = activeConnectionId ? persistentMessages.isPeerTyping : chemistryMessages.isPeerTyping
  const sendMessage = () => {
    if (activeConnectionId) void persistentMessages.handleSendMessage()
    else chemistryMessages.handleSendMessage()
  }

  const connecting = Boolean(chat.peerId) && !chat.peerConnected
  const showPreparing = chat.searching || connecting

  const toggleMute = () => {
    if (!stream) return
    const next = !isMuted
    stream.getAudioTracks().forEach((t) => { t.enabled = !next })
    setIsMuted(next); chat.streamState('audio', !next)
  }
  const toggleCamera = () => {
    if (!stream) return
    const next = !isCameraOff
    stream.getVideoTracks().forEach((t) => { t.enabled = !next })
    setIsCameraOff(next); chat.streamState('video', !next)
  }
  const flipCamera = () => {
    const track = stream?.getVideoTracks()[0] as { _switchCamera?: () => void } | undefined
    if (isCameraOff || !track?._switchCamera) {
      Alert.alert('Camera unavailable', 'Turn on your camera before switching views.')
      return
    }
    try { track._switchCamera() }
    catch { Alert.alert('Could not switch camera', 'Please try again.') }
  }
  const handleBlock = () => {
    if (!chat.peerUserId) return
    Alert.alert('Block this person?', "You won't be matched with them again.", [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onPress: async () => { try { await currentProduct.blocks.block(chat.peerUserId!); chat.socket?.emit('block-user', { to: chat.peerId }); chat.next() } catch (e) { Alert.alert('Could not block', e instanceof Error ? e.message : 'Please try again.') } } }])
  }
  const onReportSubmit = async (category: ReportCategory) => {
    if (!chat.peerUserId) return
    try { await currentProduct.reports.create(chat.peerUserId, String(category)); Alert.alert('Report received', 'Thank you for helping keep Meetopia safe.') } catch (e) { Alert.alert('Could not report', e instanceof Error ? e.message : 'Please try again.') }
  }
  const leave = () => { chat.leave(); invalidateAuthenticatedSocket(); router.replace('/') }
  const showVibeSuccess = Boolean(chat.mutualVibe?.saved && chat.mutualVibe.connectionId !== dismissedConnectionId)

  return <View style={layout.root}>
    <VideoStage localStream={stream} remoteStream={chat.remoteStream} isPeerConnected={chat.peerConnected} isSearching={chat.searching} hasPeer={Boolean(chat.peerId)} isCameraOff={isCameraOff} remoteCameraOff={chat.remoteCameraOff} remoteMicOff={chat.remoteMicOff} hideConnectingOverlay />
    <SafeAreaView style={styles.header} edges={['top']} pointerEvents="box-none"><View style={styles.headerRow}><Pressable onPress={leave} hitSlop={10} style={styles.backBtn}><Text style={styles.back}>‹</Text></Pressable><View style={styles.headerCenter}><Text style={styles.title}>Vibe Room</Text><ChemistryTimer active={Boolean(chat.peerId) && chat.peerConnected} />{chat.callStatus ? <Text style={styles.callStatus}>{chat.callStatus}</Text> : null}</View><View style={styles.statusWrap}><Text style={[styles.status, chat.connected ? styles.online : styles.offline]}>●</Text></View></View></SafeAreaView>
    {showPreparing && <View style={styles.preparing} pointerEvents="none"><Text style={styles.preparingText}>{chat.callStatus || 'Preparing your Vibe Room…'}</Text></View>}
    <VibeRounds room={chat.room} onAnswer={chat.answerRound} onNext={chat.nextRound} onContribute={chat.contribute} onApprove={chat.approveCreation} />
    {chat.introduction && <View style={styles.introOverlay}>
      <View style={styles.introCard}>
        <Text style={styles.introEyebrow}>MEETOPIA / THE INTRODUCTION</Text>
        <Text style={styles.introHeading}>Common ground. Real chemistry.</Text>
        <Text style={styles.introName}>{chat.introduction.themeTitle}: Meet {chat.introduction.person.displayName}</Text>
        <Text style={styles.introDescription}>You both chose to explore these interests:</Text>
        <View style={styles.sharedChips}>{chat.introduction.person.sharedInterests.map(interest => <View key={interest} style={styles.sharedChip}><Text style={styles.sharedText}>{interest}</Text></View>)}</View>
        <Text style={styles.introDescription}>Their conversation style: {chat.introduction.person.conversationStyle}.</Text>
        <Text style={styles.introNote}>Video only starts after you BOTH agree. Either person can decline without starting a call.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Accept this introduction" disabled={chat.introduction.accepted} style={[styles.acceptButton, chat.introduction.accepted && styles.acceptWaiting]} onPress={chat.acceptIntroduction}>
          <Text style={styles.acceptText}>{chat.introduction.accepted ? 'Accepted · waiting for them…' : 'Meet in the Vibe Room'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={chat.declineIntroduction} style={styles.declineButton}><Text style={styles.declineText}>Not this introduction</Text></Pressable>
      </View>
    </View>}
    {(mediaError || chat.error || persistentMessages.error) && <View style={styles.errorBanner}><Text style={styles.errorText}>{mediaError ?? chat.error ?? persistentMessages.error}</Text></View>}
    {showVibeSuccess && <View style={styles.vibeOverlay}><View style={styles.vibeCard}><Text style={styles.vibeEmoji}>✨</Text><Text style={styles.vibeTitle}>It&apos;s a Vibe</Text><Text style={styles.vibeSub}>You both chose Vibe. This is now a Connection.</Text><Pressable style={styles.vibePrimary} onPress={() => setDismissedConnectionId(chat.mutualVibe?.connectionId || null)}><Text style={styles.vibePrimaryText}>Keep Talking</Text></Pressable><Pressable style={styles.vibeSecondary} onPress={() => router.replace(`/connections/${chat.mutualVibe!.connectionId}`)}><Text style={styles.vibeSecondaryText}>Open Connection</Text></Pressable></View></View>}
    <MessageBar messages={messages} value={draft} onChange={onDraftChange} onSend={sendMessage} disabled={!chat.peerId || persistentMessages.sending} isPeerTyping={isPeerTyping} />
    <ControlBar hasPeer={Boolean(chat.peerId)} isSearching={chat.searching} isSocketConnected={chat.connected} canStart={Boolean(stream)} onStart={chat.start} onNext={chat.next} onLeave={leave} onToggleMute={toggleMute} onToggleCamera={toggleCamera} onFlipCamera={flipCamera} onVibe={chat.vibe} canVibe={chat.room?.completed === true} onReport={() => setReportOpen(true)} onBlock={handleBlock} isMuted={isMuted} isCameraOff={isCameraOff} myVibeSent={chat.hasVibed} mutualVibe={Boolean(chat.mutualVibe?.saved)} />
    <ReportModal visible={reportOpen} onClose={() => setReportOpen(false)} onSubmit={(category) => void onReportSubmit(category)} />
  </View>
}

const styles = StyleSheet.create({
  introOverlay: { ...StyleSheet.absoluteFill, zIndex: 42, backgroundColor: 'rgba(3, 4, 16, 0.96)', justifyContent: 'center', padding: 22 },
  introCard: { backgroundColor: '#111028', borderColor: '#6e50af', borderWidth: 1, borderRadius: 28, padding: 24 },
  introEyebrow: { color: '#a995ef', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  introHeading: { color: '#ffffff', fontSize: 29, fontWeight: '900', marginTop: 10, lineHeight: 34 },
  introName: { color: '#ded5ff', fontSize: 18, fontWeight: '700', marginTop: 20 },
  introDescription: { color: '#cbc9d7', fontSize: 14, marginTop: 13, lineHeight: 21 },
  sharedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sharedChip: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#32245c', borderColor: '#7651c7', borderWidth: 1 },
  sharedText: { color: '#f4eaff', fontWeight: '700', textTransform: 'capitalize' },
  introNote: { color: '#9c99af', fontSize: 13, lineHeight: 18, marginTop: 22 },
  acceptButton: { backgroundColor: '#7c5cff', padding: 17, borderRadius: 16, marginTop: 22, alignItems: 'center' },
  acceptWaiting: { opacity: 0.65 },
  acceptText: { color: 'white', fontWeight: '800', fontSize: 15 },
  declineButton: { padding: 16, alignItems: 'center' },
  declineText: { color: '#cec6df', fontWeight: '700' },
  accessGate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  accessText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  accessRetry: { color: colors.brandBlueLight, fontSize: 16, fontWeight: '700', marginTop: 20 },
  header: { ...layout.header }, headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' }, back: { color: '#fff', fontSize: 34, fontWeight: '300', lineHeight: 34 }, headerCenter: { flex: 1, alignItems: 'center' }, title: { color: '#fff', fontSize: 17, fontWeight: '700' }, callStatus: { color: colors.brandBlueLight, fontSize: 12, marginTop: 3 }, statusWrap: { width: 40, alignItems: 'flex-end', paddingTop: 6 }, status: { fontSize: 12 }, online: { color: colors.success }, offline: { color: colors.danger }, preparing: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', zIndex: 20 }, preparingText: { color: 'rgba(255,255,255,0.85)', fontSize: 15 }, errorBanner: { position: 'absolute', top: 150, left: 16, right: 16, backgroundColor: 'rgba(127,29,29,0.92)', padding: 12, borderRadius: 10, zIndex: 50 }, errorText: { color: '#fff', fontSize: 13 }, vibeOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 24 }, vibeCard: { width: '100%', maxWidth: 360, backgroundColor: colors.bgElevated, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: 28, alignItems: 'center' }, vibeEmoji: { fontSize: 44 }, vibeTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8 }, vibeSub: { color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 }, vibePrimary: { width: '100%', backgroundColor: colors.brandBlue, borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 22 }, vibePrimaryText: { color: '#fff', fontWeight: '800' }, vibeSecondary: { width: '100%', padding: 14, alignItems: 'center', marginTop: 5 }, vibeSecondaryText: { color: colors.brandBlueLight, fontWeight: '700' },
})
