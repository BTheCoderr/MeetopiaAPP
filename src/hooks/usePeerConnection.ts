'use client'
import { useState, useEffect, useRef } from 'react'

export const usePeerConnection = (stream: MediaStream | null) => {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const connectionRef = useRef<RTCPeerConnection | null>(null)

  const createFreshConnection = () => {
    // Close existing connection if any
    if (connectionRef.current) {
      connectionRef.current.close()
    }

    console.log('Creating new peer connection')
    
    // Enhanced ICE servers with multiple STUN servers for better connectivity
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun.relay.metered.ca:80' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      // Multiple TURN servers for better reliability
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      // Backup TURN server
      {
        urls: 'turn:relay.metered.ca:80',
        username: 'b2f4a2a6c8f0b2b7a2c8f0b',
        credential: 'meetopia2024'
      },
      {
        urls: 'turn:relay.metered.ca:443',
        username: 'b2f4a2a6c8f0b2b7a2c8f0b',
        credential: 'meetopia2024'
      }
    ]

    console.log('🌐 ICE servers configured:', iceServers.length, 'servers')
    console.log('📡 STUN servers:', iceServers.filter(s => s.urls.includes('stun')).length)
    console.log('🔄 TURN servers:', iceServers.filter(s => s.urls.includes('turn')).length)

    const config: RTCConfiguration = {
      iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    }

    const pc = new RTCPeerConnection(config)
    
    // Enhanced connection monitoring
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state changed:', pc.iceConnectionState)
      
      // Log transition details
      const states = {
        'new': '🆕 Starting ICE connection process',
        'checking': '🔄 Checking ICE connectivity',
        'connected': '✅ ICE connection established successfully!',
        'completed': '🎉 ICE connection completed - optimal path found',
        'failed': '❌ ICE connection failed - cannot establish connection',
        'disconnected': '⚠️ ICE connection temporarily disconnected',
        'closed': '🔒 ICE connection closed'
      }
      
      console.log(states[pc.iceConnectionState as keyof typeof states] || `Unknown state: ${pc.iceConnectionState}`)
      
      if (pc.iceConnectionState === 'failed') {
        console.log('🔥 ICE CONNECTION FAILED - Debugging info:')
        console.log('- Local description:', pc.localDescription?.type)
        console.log('- Remote description:', pc.remoteDescription?.type)
        console.log('- Signaling state:', pc.signalingState)
        console.log('- Connection state:', pc.connectionState)
        
        console.log('🔄 Attempting ICE restart...')
        if (pc.restartIce) {
          pc.restartIce()
        } else {
          console.log('❌ ICE restart not supported')
        }
      }
      
      if (pc.iceConnectionState === 'disconnected') {
        console.log('⚠️ ICE temporarily disconnected - connection may recover')
        // Don't restart immediately, wait for potential recovery
        setTimeout(() => {
          if (pc.iceConnectionState === 'disconnected') {
            console.log('🔄 ICE still disconnected after 5s, attempting restart')
            if (pc.restartIce) {
              pc.restartIce()
            }
          }
        }, 5000)
      }
    }
    
    pc.onconnectionstatechange = () => {
      console.log('🔗 Peer connection state changed:', pc.connectionState)
      
      // Log transition details
      const states = {
        'new': '🆕 Starting peer connection',
        'connecting': '🔄 Establishing peer connection',
        'connected': '✅ Peer connection established successfully!',
        'disconnected': '⚠️ Peer connection temporarily disconnected',
        'failed': '❌ Peer connection failed completely',
        'closed': '🔒 Peer connection closed'
      }
      
      console.log(states[pc.connectionState as keyof typeof states] || `Unknown state: ${pc.connectionState}`)
      
      if (pc.connectionState === 'failed') {
        console.log('🔥 PEER CONNECTION FAILED - Full diagnostic:')
        console.log('- ICE connection state:', pc.iceConnectionState)
        console.log('- ICE gathering state:', pc.iceGatheringState)
        console.log('- Signaling state:', pc.signalingState)
        console.log('- Local description:', pc.localDescription)
        console.log('- Remote description:', pc.remoteDescription)
      }
    }
    
    pc.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state changed:', pc.iceGatheringState)
      
      const states = {
        'new': '🆕 Starting ICE candidate gathering',
        'gathering': '🔄 Gathering ICE candidates...',
        'complete': '✅ ICE candidate gathering completed'
      }
      
      console.log(states[pc.iceGatheringState as keyof typeof states] || `Unknown state: ${pc.iceGatheringState}`)
    }

    // Enhanced ICE candidate monitoring
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate
        const type = candidate.split(' ')[7] || 'unknown'
        const protocol = candidate.includes('udp') ? 'UDP' : candidate.includes('tcp') ? 'TCP' : 'unknown'
        
        console.log(`🧊 ICE candidate found: ${type} (${protocol})`)
        
        // Log first few candidates in detail
        if (Math.random() < 0.2) { // Log 20% of candidates to avoid spam
          console.log('ICE candidate details:', {
            type,
            protocol,
            foundation: candidate.split(' ')[0],
            priority: candidate.split(' ')[3],
            address: candidate.split(' ')[4],
            port: candidate.split(' ')[5]
          })
        }
      } else {
        console.log('🧊 ICE candidate gathering completed (null candidate received)')
      }
    }

    // Monitor data channel state if any
    pc.ondatachannel = (event) => {
      console.log('📡 Data channel received:', event.channel.label)
      
      event.channel.onopen = () => console.log('📡 Data channel opened')
      event.channel.onclose = () => console.log('📡 Data channel closed')
      event.channel.onerror = (error) => console.log('📡 Data channel error:', error)
    }

    // Add tracks from stream
    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
        console.log('Added track to peer connection:', track.kind)
      })
    }

    connectionRef.current = pc
    setPeerConnection(pc)
    return pc
  }

  useEffect(() => {
    if (stream) {
      createFreshConnection()
    }

    return () => {
      if (connectionRef.current) {
        connectionRef.current.close()
        connectionRef.current = null
      }
    }
  }, [stream])

  return { peerConnection, createFreshConnection }
} 