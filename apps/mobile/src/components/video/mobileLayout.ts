import { StyleSheet } from 'react-native'

/** Mirrors web videoChatLayout.ts — same hierarchy, RN StyleSheet. */
export const layout = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  mainVideo: { ...StyleSheet.absoluteFillObject },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pip: {
    position: 'absolute',
    top: 64,
    right: 12,
    zIndex: 30,
    width: 112,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messagePill: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 104,
    zIndex: 40,
    maxWidth: 448,
    alignSelf: 'center',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    zIndex: 40,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  controlBtnPrimary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#30D158',
  },
  controlBtnDanger: {
    backgroundColor: '#FF453A',
  },
})
