'use client'
import React, { useState } from 'react'

type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected'

interface ConnectionStats {
  latency?: number
  packetLoss?: number
  bandwidth?: number
}

interface ConnectionStatusProps {
  quality?: ConnectionQuality
  isConnecting?: boolean
  error?: string
  stats?: ConnectionStats
  onRetry?: () => void
}

export default function ConnectionStatus({ 
  quality = 'disconnected',
  isConnecting = false,
  error,
  stats,
  onRetry
}: ConnectionStatusProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusColor = () => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-orange-500'
      case 'disconnected':
        return 'bg-red-500'
    }
  }

  const getStatusText = () => {
    if (error) return error
    if (isConnecting) return 'Connecting...'
    switch (quality) {
      case 'excellent':
        return 'Excellent Connection'
      case 'good':
        return 'Good Connection'
      case 'poor':
        return 'Poor Connection'
      case 'disconnected':
        return 'Disconnected'
    }
  }

  const getDetailedStats = () => {
    if (!stats) return null
    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px] z-50">
        <div className="text-xs space-y-1">
          {stats.latency !== undefined && (
            <div className="flex justify-between">
              <span>Latency:</span>
              <span className={stats.latency > 150 ? 'text-orange-500' : 'text-green-500'}>
                {stats.latency}ms
              </span>
            </div>
          )}
          {stats.packetLoss !== undefined && (
            <div className="flex justify-between">
              <span>Packet Loss:</span>
              <span className={stats.packetLoss > 5 ? 'text-orange-500' : 'text-green-500'}>
                {stats.packetLoss}%
              </span>
            </div>
          )}
          {stats.bandwidth !== undefined && (
            <div className="flex justify-between">
              <span>Bandwidth:</span>
              <span>{(stats.bandwidth / 1000).toFixed(1)} Mbps</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center gap-2">
      <button 
        className="flex items-center gap-1.5 hover:bg-gray-100 p-1 rounded transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
          isConnecting ? 'animate-pulse' : ''
        }`} />
        <span className="text-sm text-gray-600">
          {getStatusText()}
        </span>
      </button>

      {error && (
        <button 
          className="text-xs text-blue-500 hover:underline px-2 py-1 rounded-full hover:bg-blue-50 transition-colors"
          onClick={onRetry || (() => window.location.reload())}
        >
          Try Again
        </button>
      )}

      {showDetails && getDetailedStats()}
    </div>
  )
} 