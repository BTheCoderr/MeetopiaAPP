import { View, Text, StyleSheet } from 'react-native'
import { RTCView, MediaStream } from 'react-native-webrtc'
import { layout } from './mobileLayout'
import PictureInPicture from './PictureInPicture'

interface Props {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isPeerConnected: boolean
  isSearching: boolean
  hasPeer: boolean
  isCameraOff: boolean
  remoteCameraOff?: boolean
  remoteMicOff?: boolean
  hideConnectingOverlay?: boolean
  overlayHint?: string
}

export default function VideoStage({
  localStream,
  remoteStream,
  isPeerConnected,
  isSearching,
  hasPeer,
  isCameraOff,
  remoteCameraOff = false,
  remoteMicOff = false,
  hideConnectingOverlay,
  overlayHint,
}: Props) {
  const hasRemote = isPeerConnected && !!remoteStream
  const pipStream = hasRemote ? localStream : null

  return (
    <View style={StyleSheet.absoluteFill}>
      {!hasRemote && localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={[layout.mainVideo, isCameraOff && styles.hidden]}
          objectFit="cover"
          mirror
        />
      )}
      {hasRemote && remoteStream && (
        <RTCView streamURL={remoteStream.toURL()} style={layout.mainVideo} objectFit="cover" />
      )}
      {hasRemote && (remoteCameraOff || remoteMicOff) && (
        <View style={styles.remoteState} pointerEvents="none">
          <Text style={styles.remoteStateText}>
            {[remoteCameraOff ? 'Their camera is off' : null, remoteMicOff ? 'Their mic is muted' : null].filter(Boolean).join(' · ')}
          </Text>
        </View>
      )}
      {pipStream && (
        <PictureInPicture stream={pipStream} isCameraOff={isCameraOff} />
      )}
      {!hideConnectingOverlay && (isSearching || (hasPeer && !hasRemote)) && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            {overlayHint ??
              (hasPeer && !hasRemote ? 'Connecting video…' : 'Opening your Vibe Room…')}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
  remoteState: { position: 'absolute', top: 120, left: 16, right: 16, alignItems: 'center' },
  remoteStateText: { color: '#fff', backgroundColor: 'rgba(0,0,0,0.55)', overflow: 'hidden', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, fontSize: 13 },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  overlayText: { color: '#fff', fontSize: 15 },
})
