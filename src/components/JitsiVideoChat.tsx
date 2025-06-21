'use client'
import React, { useState, useEffect, useRef } from 'react'
import { JitsiMeeting } from '@jitsi/react-sdk'
import Logo from '@/components/Logo'
import ReportModal from '@/components/ReportModal'
import { useReporting } from '@/hooks/useReporting'

interface JitsiVideoChatProps {
  roomName?: string
  displayName?: string
  onLeave?: () => void
}

export default function JitsiVideoChat({ 
  roomName = `meetopia-room-${Date.now()}`, 
  displayName = 'Anonymous User',
  onLeave 
}: JitsiVideoChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  const [areControlsVisible, setAreControlsVisible] = useState(true)
  const [controlsTimer, setControlsTimer] = useState<NodeJS.Timeout | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStartTime, setConnectionStartTime] = useState<Date | null>(null)
  
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  
  const { handleReport: submitReport } = useReporting()

  // Timer for hiding controls after 10 seconds
  useEffect(() => {
    if (isConnected && areControlsVisible) {
      if (controlsTimer) {
        clearTimeout(controlsTimer)
      }
      
      const timer = setTimeout(() => {
        setAreControlsVisible(false)
      }, 10000) // Hide after 10 seconds
      
      setControlsTimer(timer)
    }
    
    return () => {
      if (controlsTimer) {
        clearTimeout(controlsTimer)
      }
    }
  }, [isConnected, areControlsVisible])

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isConnected && connectionStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - connectionStartTime.getTime()) / 1000)
        setCallDuration(duration)
      }, 1000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isConnected, connectionStartTime])

  // Show controls when user interacts
  const showControls = () => {
    setAreControlsVisible(true)
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle API ready
  const handleApiReady = (externalApi: any) => {
    apiRef.current = externalApi
    
    // Set up event listeners
    externalApi.addEventListener('videoConferenceJoined', () => {
      console.log('📹 Joined Jitsi meeting')
      setIsConnected(true)
      setConnectionStartTime(new Date())
    })
    
    externalApi.addEventListener('videoConferenceLeft', () => {
      console.log('👋 Left Jitsi meeting')
      setIsConnected(false)
      setConnectionStartTime(null)
      setCallDuration(0)
      if (onLeave) {
        onLeave()
      }
    })
    
    externalApi.addEventListener('participantJoined', (event: any) => {
      console.log('👤 Participant joined:', event.displayName)
      // Update participants list
      externalApi.getParticipantsInfo().then((participantsList: any[]) => {
        setParticipants(participantsList)
      })
    })
    
    externalApi.addEventListener('participantLeft', (event: any) => {
      console.log('👤 Participant left:', event.displayName)
      // Update participants list
      externalApi.getParticipantsInfo().then((participantsList: any[]) => {
        setParticipants(participantsList)
      })
    })
  }

  // Handle navigation actions
  const handleKeepExploring = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup')
    }
    window.location.href = '/chat/video'
  }

  const handleBackToBase = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup')
    }
    window.location.href = '/'
  }

  const handleLetUsKnow = () => {
    setIsReportModalOpen(true)
  }

  const handleReport = async (type: 'report' | 'improvement', reason: string, details: string) => {
    try {
      await submitReport(type, reason, details)
      setIsReportModalOpen(false)
      alert('Report submitted successfully!')
    } catch (error) {
      console.error('Failed to submit report:', error)
      alert('Failed to submit report. Please try again.')
    }
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Jitsi Meet Container */}
      <div 
        ref={jitsiContainerRef}
        className="absolute inset-0 w-full h-full"
        onClick={showControls} // Show controls when clicking on video
      >
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableModeratorIndicator: false,
            enableEmailInStats: false,
            toolbarButtons: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'security'
            ],
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'e2ee'
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            DEFAULT_BACKGROUND: '#474747',
          }}
          userInfo={{
            displayName: displayName,
            email: '',
          }}
          onApiReady={handleApiReady}
          getIFrameRef={(iframeRef) => {
            if (iframeRef) {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }
          }}
        />
      </div>

      {/* Meetopia Navigation Header - Always Visible */}
      <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
        areControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <Logo className="text-white" />
          
          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleKeepExploring}
              className="px-4 py-2 bg-green-500/80 hover:bg-green-600/90 text-white rounded-lg font-medium transition-all duration-300 backdrop-blur-md border border-green-400/30 shadow-lg hover:scale-105"
            >
              Keep Exploring! 🌟
            </button>
            <button
              onClick={handleBackToBase}
              className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600/90 text-white rounded-lg font-medium transition-all duration-300 backdrop-blur-md border border-blue-400/30 shadow-lg hover:scale-105"
            >
              Back to Base 🏠
            </button>
            <button
              onClick={handleLetUsKnow}
              className="px-4 py-2 bg-purple-500/80 hover:bg-purple-600/90 text-white rounded-lg font-medium transition-all duration-300 backdrop-blur-md border border-purple-400/30 shadow-lg hover:scale-105"
            >
              Let Us Know! 📝
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status & Call Duration */}
      <div className={`absolute top-20 left-4 z-50 transition-all duration-300 ${
        areControlsVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
          <div className="flex items-center gap-2 text-white">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-sm font-medium">
              {isConnected ? `Connected • ${formatDuration(callDuration)}` : 'Connecting...'}
            </span>
          </div>
          {participants.length > 0 && (
            <div className="text-xs text-gray-300 mt-1">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} in call
            </div>
          )}
        </div>
      </div>

      {/* Room Info */}
      <div className={`absolute top-20 right-4 z-50 transition-all duration-300 ${
        areControlsVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
          <div className="text-white text-sm">
            <div className="font-medium">Room: {roomName}</div>
            <div className="text-xs text-gray-300">Powered by Jitsi Meet</div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
      />

      {/* Instructions for showing controls */}
      {!areControlsVisible && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-white text-sm opacity-70">
            Tap anywhere to show controls
          </div>
        </div>
      )}
    </div>
  )
} 