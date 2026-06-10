import { useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'
import VideoStage from '@/components/video/VideoStage'
import MessageBar from '@/components/video/MessageBar'
import ControlBar from '@/components/video/ControlBar'
import { layout } from '@/components/video/mobileLayout'
import { useMobileMedia } from '@/hooks/useMobileMedia'
import { useMobilePeerConnection } from '@/hooks/useMobilePeerConnection'
import { useMobileVideoChatSocket } from '@/hooks/useMobileVideoChatSocket'
import { useMobileVideoChatMessages } from '@/hooks/useMobileVideoChatMessages'
import { getSocket } from '@/lib/socket'
import type { UserProfile } from '@/types/videoChat'

export default function VideoChatScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>()
  const isDating = mode === 'dating'
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const { stream, error: mediaError } = useMobileMedia()
  const { peerConnection, restartConnection } = useMobilePeerConnection(stream)

  useEffect(() => {
    if (!isDating) return
    AsyncStorage.getItem('datingProfileFormatted').then(raw => {
      if (raw) {
        try {
          setUserProfile(JSON.parse(raw) as UserProfile)
        } catch {
          /* ignore */
        }
      }
    })
  }, [isDating])

  const chat = useMobileVideoChatSocket({
    stream,
    peerConnection,
    restartConnection,
    isDating,
    userProfile,
  })

  const socket = useMemo(() => getSocket(), [])
  const messages = useMobileVideoChatMessages({
    socket,
    currentPeer: chat.currentPeer,
  })

  const toggleMute = () => {
    if (!stream) return
    const next = !isMuted
    stream.getAudioTracks().forEach(t => {
      t.enabled = !next
    })
    setIsMuted(next)
  }

  const toggleCamera = () => {
    if (!stream) return
    const next = !isCameraOff
    stream.getVideoTracks().forEach(t => {
      t.enabled = !next
    })
    setIsCameraOff(next)
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
          <Text style={styles.logo}>
            <Text style={styles.brand}>Meet</Text>opia
          </Text>
          <Text style={[styles.status, chat.isSocketConnected ? styles.online : styles.offline]}>
            {chat.isSocketConnected ? '●' : '○'}
          </Text>
        </View>
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
        disabled={!chat.currentPeer}
        isPeerTyping={messages.isPeerTyping}
      />

      <ControlBar
        hasPeer={Boolean(chat.currentPeer)}
        isSearching={chat.isSearching}
        isSocketConnected={chat.isSocketConnected}
        onStart={chat.handleStartChat}
        onNext={chat.handleNextPerson}
        onLeave={chat.handleLeaveChat}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { ...layout.header },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { color: '#fff', fontSize: 22, width: 32 },
  logo: { color: '#fff', fontSize: 18, fontWeight: '600' },
  brand: { color: '#0A84FF' },
  status: { fontSize: 14, width: 32, textAlign: 'right' },
  online: { color: '#30D158' },
  offline: { color: '#FF453A' },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(127,29,29,0.85)',
    padding: 12,
    borderRadius: 10,
    zIndex: 50,
  },
  errorText: { color: '#fff', fontSize: 13 },
})
