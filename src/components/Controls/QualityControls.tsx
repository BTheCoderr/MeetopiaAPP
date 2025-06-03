'use client'
import React, { useState, useEffect } from 'react'

interface QualityLevel {
  width: number
  height: number
  frameRate: number
  bitrate: number
  label: string
}

interface ConnectionState {
  mode: 'full' | 'audio-only' | 'text-only' | 'failed'
  quality: 'high' | 'medium' | 'low' | 'minimal'
  reason: string
  canUpgrade: boolean
}

interface QualityControlsProps {
  webrtcService: any
  onDiagnosticsOpen: () => void
}

export default function QualityControls({ webrtcService, onDiagnosticsOpen }: QualityControlsProps) {
  const [currentQuality, setCurrentQuality] = useState<QualityLevel | null>(null)
  const [availableQualities, setAvailableQualities] = useState<QualityLevel[]>([])
  const [connectionStats, setConnectionStats] = useState<any>(null)
  const [fallbackState, setFallbackState] = useState<ConnectionState | null>(null)
  const [networkQuality, setNetworkQuality] = useState<'good' | 'fair' | 'poor'>('good')
  const [isAutoQuality, setIsAutoQuality] = useState(true)

  useEffect(() => {
    if (!webrtcService) return

    // Initialize quality settings
    const qualities = webrtcService.getAvailableQualities()
    const current = webrtcService.getCurrentQuality()
    const stats = webrtcService.getConnectionStats()
    const fallback = webrtcService.getFallbackState()

    setAvailableQualities(qualities)
    setCurrentQuality(current)
    setConnectionStats(stats)
    setFallbackState(fallback)
    setNetworkQuality(stats?.networkQuality || 'good')

    // Listen for quality changes
    const handleQualityChange = (event: CustomEvent) => {
      setCurrentQuality(event.detail)
    }

    const handleNetworkQualityChange = (event: CustomEvent) => {
      setNetworkQuality(event.detail.quality)
    }

    const handleConnectionStateChange = (event: CustomEvent) => {
      setFallbackState(event.detail)
    }

    window.addEventListener('quality-changed', handleQualityChange as EventListener)
    window.addEventListener('network-quality-changed', handleNetworkQualityChange as EventListener)
    window.addEventListener('connection-state-changed', handleConnectionStateChange as EventListener)

    // Update stats periodically
    const statsInterval = setInterval(() => {
      const newStats = webrtcService.getConnectionStats()
      setConnectionStats(newStats)
    }, 2000)

    return () => {
      window.removeEventListener('quality-changed', handleQualityChange as EventListener)
      window.removeEventListener('network-quality-changed', handleNetworkQualityChange as EventListener)
      window.removeEventListener('connection-state-changed', handleConnectionStateChange as EventListener)
      clearInterval(statsInterval)
    }
  }, [webrtcService])

  const handleQualityChange = async (qualityLabel: string) => {
    if (!webrtcService) return
    
    setIsAutoQuality(false)
    const success = await webrtcService.setVideoQuality(qualityLabel)
    if (success) {
      const newQuality = webrtcService.getCurrentQuality()
      setCurrentQuality(newQuality)
    }
  }

  const toggleAutoQuality = () => {
    setIsAutoQuality(!isAutoQuality)
    // You would need to implement auto quality toggle in WebRTC service
  }

  const getNetworkQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConnectionModeIcon = (mode: string) => {
    switch (mode) {
      case 'full': return '📹'
      case 'audio-only': return '🎵'
      case 'text-only': return '💬'
      case 'failed': return '❌'
      default: return '🔄'
    }
  }

  const formatLatency = (latency: number) => {
    if (latency === 0) return 'Unknown'
    return `${Math.round(latency)}ms`
  }

  const formatBandwidth = (bytes: number) => {
    if (!bytes) return '0 KB/s'
    const kbps = (bytes * 8) / 1024 / 5 // Approximate over 5 seconds
    if (kbps < 1000) return `${Math.round(kbps)} KB/s`
    return `${(kbps / 1000).toFixed(1)} MB/s`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      {/* Connection Status */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          📊 Connection Status
          <button
            onClick={onDiagnosticsOpen}
            className="ml-auto text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200"
          >
            🔧 Diagnostics
          </button>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getNetworkQualityColor(networkQuality)}`}>
              {networkQuality.toUpperCase()}
            </div>
            <div className="text-xs text-gray-600 mt-1">Network Quality</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg">
              {getConnectionModeIcon(fallbackState?.mode || 'full')}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {fallbackState?.mode === 'full' ? 'Full Video' :
               fallbackState?.mode === 'audio-only' ? 'Audio Only' :
               fallbackState?.mode === 'text-only' ? 'Text Only' : 'Connecting'}
            </div>
          </div>
        </div>

        {/* Connection Metrics */}
        {connectionStats && (
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="text-center">
              <div className="font-semibold">{formatLatency(connectionStats.latency)}</div>
              <div className="text-gray-600">Latency</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{formatBandwidth(connectionStats.bytesReceived)}</div>
              <div className="text-gray-600">Bandwidth</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{connectionStats.reconnectAttempts || 0}</div>
              <div className="text-gray-600">Reconnects</div>
            </div>
          </div>
        )}
      </div>

      {/* Quality Controls */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">🎥 Video Quality</h3>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={isAutoQuality}
              onChange={toggleAutoQuality}
              className="mr-2"
            />
            Auto
          </label>
        </div>

        {currentQuality && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
            <div className="font-semibold">{currentQuality.label}</div>
            <div className="text-gray-600">
              {currentQuality.width}×{currentQuality.height} @ {currentQuality.frameRate}fps
            </div>
          </div>
        )}

        {/* Quality Selection */}
        <div className="space-y-2">
          {availableQualities.map((quality) => (
            <button
              key={quality.label}
              onClick={() => handleQualityChange(quality.label)}
              disabled={isAutoQuality}
              className={`w-full text-left p-2 rounded border text-sm transition-colors ${
                currentQuality?.label === quality.label
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : isAutoQuality
                  ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">{quality.label}</div>
              <div className="text-xs text-gray-600">
                {quality.width}×{quality.height} • {quality.frameRate}fps • {quality.bitrate}kbps
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fallback Recommendations */}
      {fallbackState && fallbackState.mode !== 'full' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Connection Issues Detected
          </h4>
          <p className="text-sm text-yellow-700 mb-2">{fallbackState.reason}</p>
          
          {webrtcService && (
            <div className="space-y-1">
              {webrtcService.getFallbackRecommendations().slice(0, 2).map((rec: string, index: number) => (
                <div key={index} className="text-xs text-yellow-600">
                  • {rec}
                </div>
              ))}
            </div>
          )}
          
          {fallbackState.canUpgrade && (
            <button
              onClick={() => webrtcService?.attemptUpgrade?.(webrtcService, networkQuality)}
              className="mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300"
            >
              Try to Upgrade Connection
            </button>
          )}
        </div>
      )}

      {/* Network Quality Indicator */}
      <div className="text-xs text-gray-600 border-t pt-3">
        <div className="flex justify-between items-center">
          <span>Connection State:</span>
          <span className="font-semibold">
            {connectionStats?.iceConnectionState || 'Unknown'}
          </span>
        </div>
        {connectionStats?.packetsReceived > 0 && (
          <div className="flex justify-between items-center mt-1">
            <span>Packet Loss:</span>
            <span className="font-semibold">
              {((connectionStats.packetsLost / connectionStats.packetsReceived) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 