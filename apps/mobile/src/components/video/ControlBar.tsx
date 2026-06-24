import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { layout } from './mobileLayout'

interface Props {
  hasPeer: boolean
  isSearching: boolean
  isSocketConnected: boolean
  canStart: boolean
  onStart: () => void
  onNext: () => void
  onLeave: () => void
  onToggleMute: () => void
  onToggleCamera: () => void
  onVibe: () => void
  onReport: () => void
  onBlock: () => void
  isMuted: boolean
  isCameraOff: boolean
  myVibeSent: boolean
  mutualVibe: boolean
}

export default function ControlBar({
  hasPeer,
  isSearching,
  isSocketConnected,
  canStart,
  onStart,
  onNext,
  onLeave,
  onToggleMute,
  onToggleCamera,
  onVibe,
  onReport,
  onBlock,
  isMuted,
  isCameraOff,
  myVibeSent,
  mutualVibe,
}: Props) {
  return (
    <View style={layout.controls} pointerEvents="box-none">
      {mutualVibe && (
        <Text style={styles.vibeBanner}>Chat unlocked — say hi 👋</Text>
      )}
      <View style={layout.controlRow}>
        <TouchableOpacity style={[layout.controlBtn, isMuted && styles.active]} onPress={onToggleMute}>
          <Text style={styles.icon}>{isMuted ? '🔇' : '🎤'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[layout.controlBtn, isCameraOff && styles.active]} onPress={onToggleCamera}>
          <Text style={styles.icon}>{isCameraOff ? '🚫' : '📹'}</Text>
        </TouchableOpacity>
        {!hasPeer ? (
          <TouchableOpacity
            style={[layout.controlBtn, layout.controlBtnPrimary, !canStart && styles.disabled]}
            onPress={onStart}
            disabled={!isSocketConnected || isSearching || !canStart}
          >
            <Text style={styles.icon}>{isSearching ? '…' : '▶'}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[layout.controlBtn, myVibeSent && styles.vibeActive]}
              onPress={onVibe}
              disabled={myVibeSent}
            >
              <Text style={styles.icon}>{myVibeSent ? '💚' : '✨'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={layout.controlBtn} onPress={onNext}>
              <Text style={styles.icon}>⏭</Text>
            </TouchableOpacity>
            <TouchableOpacity style={layout.controlBtn} onPress={onReport}>
              <Text style={styles.icon}>🚩</Text>
            </TouchableOpacity>
            <TouchableOpacity style={layout.controlBtn} onPress={onBlock}>
              <Text style={styles.icon}>⛔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[layout.controlBtn, layout.controlBtnDanger]} onPress={onLeave}>
              <Text style={styles.icon}>✕</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  active: { backgroundColor: 'rgba(255,255,255,0.35)' },
  vibeActive: { backgroundColor: 'rgba(139,92,246,0.5)' },
  disabled: { opacity: 0.45 },
  vibeBanner: { color: '#30D158', fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  icon: { fontSize: 18 },
})
