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
      {pipStream && (
        <PictureInPicture stream={pipStream} isCameraOff={isCameraOff} />
      )}
      {(isSearching || (hasPeer && !hasRemote && !hideConnectingOverlay)) && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            {overlayHint ??
              (hasPeer && !hasRemote
                ? 'Connecting video…'
                : 'Looking for someone who matches your intent…')}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  overlayText: { color: '#fff', fontSize: 15 },
})
