import { View, Text, StyleSheet } from 'react-native'
import { RTCView, MediaStream } from 'react-native-webrtc'
import { layout } from './mobileLayout'

interface Props {
  stream: MediaStream
  isCameraOff: boolean
}

export default function PictureInPicture({ stream, isCameraOff }: Props) {
  return (
    <View style={[layout.pip, styles.shell]}>
      <RTCView
        streamURL={stream.toURL()}
        style={[StyleSheet.absoluteFill, isCameraOff && styles.hidden]}
        objectFit="cover"
        mirror
      />
      {isCameraOff && (
        <View style={styles.paused}>
          <Text style={styles.pausedText}>Camera paused</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: '#1c1c1e',
  },
  hidden: { opacity: 0 },
  paused: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1c1e',
  },
  pausedText: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
})
