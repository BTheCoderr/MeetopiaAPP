import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoStage from '@/components/video/VideoStage'
import MessageBar from '@/components/video/MessageBar'
import ControlBar from '@/components/video/ControlBar'
import ChemistryTimer from '@/components/video/ChemistryTimer'
import ReportModal, { type ReportCategory } from '@/components/safety/ReportModal'
import { layout } from '@/components/video/mobileLayout'
import { colors } from '@/theme/theme'
import { useMobileMedia } from '@/hooks/useMobileMedia'
import { useMobilePeerConnection } from '@/hooks/useMobilePeerConnection'
import { useCurrentMeetopiaSignaling } from '@/hooks/useCurrentMeetopiaSignaling'
import { useMobileVideoChatMessages } from '@/hooks/useMobileVideoChatMessages'
import { currentProduct } from '@/lib/currentProduct'

export default function VideoChatScreen() {
  const router = useRouter()
  const { connectionId, incomingCallId } = useLocalSearchParams<{ connectionId?: string; incomingCallId?: string }>()
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [vibeDismissed, setVibeDismissed] = useState(false)
  const { stream, error: mediaError } = useMobileMedia()
  const { peerConnection, restartConnection } = useMobilePeerConnection(stream)
  const chat = useCurrentMeetopiaSignaling({ stream, peerConnection, restartConnection, directConnectionId: connectionId || null, incomingCallId: incomingCallId || null })
  const liveMessages = useMobileVideoChatMessages({ socket: chat.socket, currentPeer: chat.mutualVibe?.saved ? chat.peerId : null, enabled: true })

  useEffect(() => { if (!chat.mutualVibe) setVibeDismissed(false) }, [chat.mutualVibe])
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
  const handleBlock = () => {
    if (!chat.peerUserId) return
    Alert.alert('Block this person?', "You won't be matched with them again.", [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onPress: async () => { try { await currentProduct.blocks.block(chat.peerUserId!); chat.socket?.emit('block-user', { to: chat.peerId }); chat.next() } catch (e) { Alert.alert('Could not block', e instanceof Error ? e.message : 'Please try again.') } } }])
  }
  const onReportSubmit = async (category: ReportCategory) => {
    if (!chat.peerUserId) return
    try { await currentProduct.reports.create(chat.peerUserId, String(category)); Alert.alert('Report received', 'Thank you for helping keep Meetopia safe.') } catch (e) { Alert.alert('Could not report', e instanceof Error ? e.message : 'Please try again.') }
  }
  const leave = () => { chat.leave(); router.replace('/') }
  const showVibeSuccess = Boolean(chat.mutualVibe?.saved) && !vibeDismissed

  return <View style={layout.root}>
    <VideoStage localStream={stream} remoteStream={chat.remoteStream} isPeerConnected={chat.peerConnected} isSearching={chat.searching} hasPeer={Boolean(chat.peerId)} isCameraOff={isCameraOff} hideConnectingOverlay />
    <SafeAreaView style={styles.header} edges={['top']} pointerEvents="box-none"><View style={styles.headerRow}><Pressable onPress={leave} hitSlop={10} style={styles.backBtn}><Text style={styles.back}>‹</Text></Pressable><View style={styles.headerCenter}><Text style={styles.title}>Chemistry Check</Text><ChemistryTimer active={Boolean(chat.peerId) && chat.peerConnected} />{chat.callStatus ? <Text style={styles.callStatus}>{chat.callStatus}</Text> : null}</View><View style={styles.statusWrap}><Text style={[styles.status, chat.connected ? styles.online : styles.offline]}>●</Text></View></View></SafeAreaView>
    {showPreparing && <View style={styles.preparing} pointerEvents="none"><Text style={styles.preparingText}>{chat.callStatus || 'Preparing your Chemistry Check…'}</Text></View>}
    {(mediaError || chat.error) && <View style={styles.errorBanner}><Text style={styles.errorText}>{mediaError ?? chat.error}</Text></View>}
    {showVibeSuccess && <View style={styles.vibeOverlay}><View style={styles.vibeCard}><Text style={styles.vibeEmoji}>✨</Text><Text style={styles.vibeTitle}>It&apos;s a Vibe</Text><Text style={styles.vibeSub}>You both chose Vibe. This is now a Connection.</Text><Pressable style={styles.vibePrimary} onPress={() => setVibeDismissed(true)}><Text style={styles.vibePrimaryText}>Keep Talking</Text></Pressable><Pressable style={styles.vibeSecondary} onPress={() => router.replace(`/connections/${chat.mutualVibe!.connectionId}`)}><Text style={styles.vibeSecondaryText}>Open Connection</Text></Pressable></View></View>}
    <MessageBar messages={liveMessages.messages} value={liveMessages.newMessage} onChange={liveMessages.handleMessageChange} onSend={liveMessages.handleSendMessage} disabled={!chat.mutualVibe?.saved} isPeerTyping={liveMessages.isPeerTyping} />
    <ControlBar hasPeer={Boolean(chat.peerId)} isSearching={chat.searching} isSocketConnected={chat.connected} canStart={Boolean(stream)} onStart={chat.start} onNext={chat.next} onLeave={leave} onToggleMute={toggleMute} onToggleCamera={toggleCamera} onVibe={chat.vibe} onReport={() => setReportOpen(true)} onBlock={handleBlock} isMuted={isMuted} isCameraOff={isCameraOff} myVibeSent={chat.hasVibed} mutualVibe={Boolean(chat.mutualVibe?.saved)} />
    <ReportModal visible={reportOpen} onClose={() => setReportOpen(false)} onSubmit={(category) => void onReportSubmit(category)} />
  </View>
}

const styles = StyleSheet.create({
  header: { ...layout.header }, headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' }, back: { color: '#fff', fontSize: 34, fontWeight: '300', lineHeight: 34 }, headerCenter: { flex: 1, alignItems: 'center' }, title: { color: '#fff', fontSize: 17, fontWeight: '700' }, callStatus: { color: colors.brandBlueLight, fontSize: 12, marginTop: 3 }, statusWrap: { width: 40, alignItems: 'flex-end', paddingTop: 6 }, status: { fontSize: 12 }, online: { color: colors.success }, offline: { color: colors.danger }, preparing: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 20 }, preparingText: { color: 'rgba(255,255,255,0.85)', fontSize: 15 }, errorBanner: { position: 'absolute', top: 150, left: 16, right: 16, backgroundColor: 'rgba(127,29,29,0.92)', padding: 12, borderRadius: 10, zIndex: 50 }, errorText: { color: '#fff', fontSize: 13 }, vibeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 24 }, vibeCard: { width: '100%', maxWidth: 360, backgroundColor: colors.bgElevated, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: 28, alignItems: 'center' }, vibeEmoji: { fontSize: 44 }, vibeTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8 }, vibeSub: { color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 }, vibePrimary: { width: '100%', backgroundColor: colors.brandBlue, borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 22 }, vibePrimaryText: { color: '#fff', fontWeight: '800' }, vibeSecondary: { width: '100%', padding: 14, alignItems: 'center', marginTop: 5 }, vibeSecondaryText: { color: colors.brandBlueLight, fontWeight: '700' },
})
