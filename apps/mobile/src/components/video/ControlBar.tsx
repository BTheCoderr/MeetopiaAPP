import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { layout } from './mobileLayout'

interface Props {
  hasPeer: boolean
  isSearching: boolean
  isSocketConnected: boolean
  onStart: () => void
  onNext: () => void
  onLeave: () => void
  onToggleMute: () => void
  onToggleCamera: () => void
  isMuted: boolean
  isCameraOff: boolean
}

export default function ControlBar({
  hasPeer,
  isSearching,
  isSocketConnected,
  onStart,
  onNext,
  onLeave,
  onToggleMute,
  onToggleCamera,
  isMuted,
  isCameraOff,
}: Props) {
  return (
    <View style={layout.controls} pointerEvents="box-none">
      <View style={layout.controlRow}>
        <TouchableOpacity style={[layout.controlBtn, isMuted && styles.active]} onPress={onToggleMute}>
          <Text style={styles.icon}>{isMuted ? '🔇' : '🎤'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[layout.controlBtn, isCameraOff && styles.active]} onPress={onToggleCamera}>
          <Text style={styles.icon}>{isCameraOff ? '🚫' : '📹'}</Text>
        </TouchableOpacity>
        {!hasPeer ? (
          <TouchableOpacity
            style={[layout.controlBtn, layout.controlBtnPrimary]}
            onPress={onStart}
            disabled={!isSocketConnected || isSearching}
          >
            <Text style={styles.icon}>{isSearching ? '…' : '▶'}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={layout.controlBtn} onPress={onNext}>
              <Text style={styles.icon}>⏭</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[layout.controlBtn, layout.controlBtnDanger]}
              onPress={onLeave}
            >
              <Text style={styles.icon}>✕</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  active: { backgroundColor: '#fff' },
  icon: { fontSize: 18 },
})
