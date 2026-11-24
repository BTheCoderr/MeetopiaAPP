const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.ekiga.net' },
  { urls: 'stun:stun.ideasip.com' },
  { urls: 'stun:stun.schlund.de' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
  { urls: 'stun:stun.voiparound.com' },
  { urls: 'stun:stun.voipbuster.com' },
  { urls: 'stun:stun.voipstunt.com' },
];

export function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [...STUN_SERVERS];

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  if (turnUrl && turnUser && turnCred) {
    servers.push({
      urls: turnUrl,
      username: turnUser,
      credential: turnCred,
    });
  }

  if (process.env.NODE_ENV === 'production' && !(turnUrl && turnUser && turnCred)) {
    console.warn('[WebRTC:ICE] TURN not configured; restricted networks may fail')
  }
  return servers;
}

export const fallbackConfigurations: RTCConfiguration[] = [
  {
    iceServers: getIceServers(),
    iceCandidatePoolSize: 10,
  },
  {
    iceServers: getIceServers().filter((server, index) => index < 5 || Boolean(server.credential)),
    iceCandidatePoolSize: 5,
    iceTransportPolicy: 'all' as RTCIceTransportPolicy,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
  },
  {
    iceServers: getIceServers().filter((server, index) => index === 0 || Boolean(server.credential)),
    iceCandidatePoolSize: 0,
  },
];
