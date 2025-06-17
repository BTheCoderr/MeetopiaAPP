'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface ConnectionMetrics {
  connectionAttempts: number;
  lastConnectionTime: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'failed';
  reconnectAttempts: number;
}

export const usePeerConnection = (stream: MediaStream | null) => {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics>({
    connectionAttempts: 0,
    lastConnectionTime: 0,
    connectionQuality: 'excellent',
    reconnectAttempts: 0
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isStable, setIsStable] = useState(false)
  
  const connectionRef = useRef<RTCPeerConnection | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stabilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const connectionStartTime = useRef<number>(0)

  // Enhanced connection cleanup
  const cleanupConnection = useCallback(() => {
    console.log('🧹 Cleaning up peer connection...')
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current)
      stabilityTimeoutRef.current = null
    }
    
    if (connectionRef.current) {
      try {
        // Remove all event listeners
        connectionRef.current.oniceconnectionstatechange = null
        connectionRef.current.onconnectionstatechange = null
        connectionRef.current.onicegatheringstatechange = null
        connectionRef.current.onicecandidate = null
        connectionRef.current.ondatachannel = null
        connectionRef.current.ontrack = null
        
        // Close the connection
        connectionRef.current.close()
        connectionRef.current = null
      } catch (error) {
        console.error('Error during connection cleanup:', error)
      }
    }
    
    setIsConnecting(false)
    setIsStable(false)
    setPeerConnection(null)
  }, [])

  // Enhanced connection quality assessment
  const assessConnectionQuality = useCallback((pc: RTCPeerConnection) => {
    const connectionTime = Date.now() - connectionStartTime.current
    let quality: ConnectionMetrics['connectionQuality'] = 'excellent'
    
    if (pc.iceConnectionState === 'failed') {
      quality = 'failed'
    } else if (pc.iceConnectionState === 'disconnected') {
      quality = 'poor'
    } else if (connectionTime > 10000) { // Taking longer than 10s
      quality = 'poor'
    } else if (connectionTime > 5000) { // Taking longer than 5s
      quality = 'good'
    }
    
    setConnectionMetrics(prev => ({
      ...prev,
      connectionQuality: quality,
      lastConnectionTime: connectionTime
    }))
    
    return quality
  }, [])

  // Smart reconnection logic
  const attemptReconnection = useCallback(() => {
    setConnectionMetrics(prev => {
      const newAttempts = prev.reconnectAttempts + 1
      
      // Exponential backoff: don't spam reconnections
      if (newAttempts > 5) {
        console.log('🚫 Max reconnection attempts reached, giving up')
        return { ...prev, connectionQuality: 'failed' }
      }
      
      const delay = Math.min(1000 * Math.pow(2, newAttempts - 1), 10000) // Max 10s delay
      console.log(`🔄 Scheduling reconnection attempt ${newAttempts} in ${delay}ms`)
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 Executing reconnection attempt ${newAttempts}`)
        createFreshConnection()
      }, delay)
      
      return { ...prev, reconnectAttempts: newAttempts }
    })
  }, [])

  const createFreshConnection = useCallback(() => {
    console.log('🆕 Creating fresh peer connection...')
    
    // Clean up existing connection
    cleanupConnection()
    
    setIsConnecting(true)
    connectionStartTime.current = Date.now()
    
    setConnectionMetrics(prev => ({
      ...prev,
      connectionAttempts: prev.connectionAttempts + 1,
      reconnectAttempts: 0 // Reset on fresh connection
    }))

    // Enhanced ICE servers with better reliability
    const iceServers = [
      // Primary Google STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      
      // Backup STUN servers
      { urls: 'stun:stun.cloudflare.com:3478' },
      { urls: 'stun:stun.relay.metered.ca:80' },
      
      // Reliable TURN servers for NAT traversal
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
      }
    ]

    const config: RTCConfiguration = {
      iceServers,
      iceCandidatePoolSize: 10, // Balanced for performance
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    }

    const pc = new RTCPeerConnection(config)
    
    // Enhanced state monitoring with stability tracking
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState)
      
      const quality = assessConnectionQuality(pc)
      
      switch (pc.iceConnectionState) {
        case 'connected':
        case 'completed':
          console.log('✅ ICE connection established successfully!')
          setIsConnecting(false)
          setIsStable(false) // Reset stability timer
          
          // Set stable after 3 seconds of successful connection
          if (stabilityTimeoutRef.current) {
            clearTimeout(stabilityTimeoutRef.current)
          }
          stabilityTimeoutRef.current = setTimeout(() => {
            setIsStable(true)
            console.log('🎯 Connection marked as stable')
          }, 3000)
          break
          
        case 'failed':
          console.log('❌ ICE connection failed')
          setIsConnecting(false)
          setIsStable(false)
          attemptReconnection()
          break
          
        case 'disconnected':
          console.log('⚠️ ICE connection disconnected')
          setIsStable(false)
          
          // Only attempt reconnection if we were previously stable
          setTimeout(() => {
            if (pc && pc.iceConnectionState === 'disconnected') {
              console.log('🔄 Connection still disconnected, attempting recovery')
              attemptReconnection()
            }
          }, 5000)
          break
          
        case 'checking':
          console.log('🔄 Checking connectivity...')
          setIsConnecting(true)
          break
          
        case 'closed':
          console.log('🔒 ICE connection closed')
          setIsConnecting(false)
          setIsStable(false)
          break
      }
    }
    
    pc.onconnectionstatechange = () => {
      console.log('🔗 Peer connection state:', pc.connectionState)
      
      if (pc.connectionState === 'failed') {
        console.log('🔥 Peer connection failed completely')
        setIsConnecting(false)
        setIsStable(false)
        attemptReconnection()
      }
    }
    
    pc.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state:', pc.iceGatheringState)
    }

    // Optimized ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Only log important candidates to reduce noise
        const candidate = event.candidate.candidate
        if (candidate.includes('typ srflx') || candidate.includes('typ relay')) {
          console.log('🧊 Important ICE candidate:', candidate.split(' ')[7] || 'unknown')
        }
      } else {
        console.log('🧊 ICE gathering completed')
      }
    }

    // Add tracks with error handling
    if (stream) {
      try {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream)
          console.log(`➕ Added ${track.kind} track to connection`)
        })
      } catch (error) {
        console.error('Error adding tracks:', error)
      }
    }

    connectionRef.current = pc
    setPeerConnection(pc)
    
    console.log('🎯 Fresh connection created and configured')
    return pc
  }, [stream, cleanupConnection, assessConnectionQuality, attemptReconnection])

  // Initialize connection when stream is available
  useEffect(() => {
    if (stream) {
      console.log('🎬 Stream available, creating connection...')
      createFreshConnection()
    }

    return cleanupConnection
  }, [stream, createFreshConnection, cleanupConnection])

  // Connection health monitoring
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      if (connectionRef.current && isStable) {
        const pc = connectionRef.current
        
        // Check if connection is still healthy
        if (pc.iceConnectionState === 'disconnected' || pc.connectionState === 'failed') {
          console.log('🏥 Health check failed, connection degraded')
          setIsStable(false)
        }
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(healthCheckInterval)
  }, [isStable])

  return { 
    peerConnection, 
    createFreshConnection, 
    connectionMetrics,
    isConnecting,
    isStable,
    cleanupConnection
  }
} 