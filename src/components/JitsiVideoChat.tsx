'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface JitsiVideoChatProps {
  roomId: string
  userName?: string
  onParticipantJoined?: (participant: any) => void
  onParticipantLeft?: (participant: any) => void
  onMeetingEnded?: () => void
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export default function JitsiVideoChat({
  roomId,
  userName = 'Anonymous',
  onParticipantJoined,
  onParticipantLeft,
  onMeetingEnded
}: JitsiVideoChatProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const jitsiApiRef = useRef<any>(null)
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [participantCount, setParticipantCount] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Timer for hiding controls after 10 seconds
  useEffect(() => {
    if (isConnected && participantCount > 1) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
      
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false)
      }, 10000) // 10 seconds like your web app
    }
    
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [isConnected, participantCount])

  // Auto-disconnect when navigating away (like your web app)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Load Jitsi Meet API
  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
      script.onload = initializeJitsi
      document.head.appendChild(script)
    }

    const initializeJitsi = () => {
      if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return

      const domain = 'meet.jit.si'
      const options = {
        roomName: `meetopia-${roomId}`,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName,
          email: '' // Required by Jitsi
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableInviteFunctions: true,
          toolbarButtons: [
            'microphone',
            'camera',
            'desktop',
            'chat',
            'settings',
            'filmstrip'
          ]
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
          APP_NAME: 'Meetopia',
          NATIVE_APP_NAME: 'Meetopia',
          DEFAULT_BACKGROUND: '#1a1a2e'
        }
      }

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options)

      // Event listeners
      jitsiApiRef.current.addEventListeners({
        readyToClose: () => {
          console.log('Jitsi meeting ended')
          onMeetingEnded?.()
          router.push('/')
        },
        participantJoined: (participant: any) => {
          console.log('Participant joined:', participant)
          setParticipantCount(prev => prev + 1)
          onParticipantJoined?.(participant)
          setIsConnected(true)
          resetHideTimer()
        },
        participantLeft: (participant: any) => {
          console.log('Participant left:', participant)
          setParticipantCount(prev => Math.max(1, prev - 1))
          onParticipantLeft?.(participant)
        },
        videoConferenceJoined: () => {
          console.log('Video conference joined')
          setIsLoading(false)
          setIsConnected(true)
          resetHideTimer()
        },
        videoConferenceLeft: () => {
          console.log('Video conference left')
          setIsConnected(false)
          onMeetingEnded?.()
        }
      })

      // Hide loading after a delay even if no events fire
      setTimeout(() => setIsLoading(false), 3000)
    }

    loadJitsiScript()

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [roomId, userName])

  // Reset hide timer
  const resetHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
    
    if (isConnected && participantCount > 1) {
      setShowControls(true)
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false)
      }, 10000) // 10 seconds like your web app
    }
  }

  // Handle video click
  const handleVideoClick = () => {
    if (!showControls && isConnected) {
      resetHideTimer()
    }
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle navigation actions
  const handleKeepExploring = () => {
    resetHideTimer()
    // Add your exploration logic here
    console.log('Keep exploring clicked!')
  }

  const handleBackToBase = () => {
    resetHideTimer()
    router.push('/')
  }

  const handleLetUsKnow = () => {
    resetHideTimer()
    // Add your feedback logic here
    console.log('Let us know clicked!')
  }

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup')
    }
    router.push('/')
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-white text-xl font-semibold mb-2">Setting up your meeting room...</h2>
            <p className="text-white/70">Connecting to Jitsi Meet servers</p>
          </div>
        </div>
      )}

      {/* Your existing top navigation - only show when controls are visible */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={handleKeepExploring}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-green-400/30"
            >
              Keep Exploring! 🌟
            </button>
            
            <button
              onClick={handleBackToBase}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-400/30"
            >
              Back to Base 🏠
            </button>
            
            <button
              onClick={handleLetUsKnow}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-400/30"
            >
              Let Us Know! 💬
            </button>
          </div>

          {/* Connection Status */}
          {isConnected && (
            <div className="bg-black/30 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">
                  {participantCount} participant{participantCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Jitsi Meet Container */}
      <div 
        ref={jitsiContainerRef} 
        className="w-full h-full"
        onClick={handleVideoClick}
        style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      />

      {/* Your existing bottom controls - only show when controls are visible */}
      {showControls && isConnected && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
            <button
              onClick={handleEndCall}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-red-400/30 flex items-center gap-2"
            >
              <span>📞</span>
              End Call
            </button>
            
            <div className="text-white/70 text-sm">
              Jitsi Meet • Enterprise Grade • Up to 50+ people
            </div>
          </div>
        </div>
      )}

      {/* Tap to show hint */}
      {!showControls && isConnected && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 opacity-50 hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
            <p className="text-white text-sm">Tap anywhere to show controls</p>
          </div>
        </div>
      )}

      {/* Room Info */}
      <div className={`absolute top-20 right-4 z-50 transition-all duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
          <div className="text-white text-sm">
            <div className="font-medium">Room: meetopia-{roomId}</div>
            <div className="text-xs text-gray-300">Powered by Jitsi Meet</div>
          </div>
        </div>
      </div>
    </div>
  )
} 