import '@testing-library/jest-dom'

// Mock WebRTC APIs for testing
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  createOffer: jest.fn().mockResolvedValue({}),
  createAnswer: jest.fn().mockResolvedValue({}),
  setLocalDescription: jest.fn().mockResolvedValue(),
  setRemoteDescription: jest.fn().mockResolvedValue(),
  addIceCandidate: jest.fn().mockResolvedValue(),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  getSenders: jest.fn().mockReturnValue([]),
  getReceivers: jest.fn().mockReturnValue([]),
  ontrack: null,
  onicecandidate: null,
  oniceconnectionstatechange: null,
  iceConnectionState: 'new',
  signalingState: 'stable',
}))

global.RTCSessionDescription = jest.fn()
global.RTCIceCandidate = jest.fn()

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn(), kind: 'video' },
        { stop: jest.fn(), kind: 'audio' }
      ]),
    }),
  },
})

// Mock Socket.IO
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  })),
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}) 