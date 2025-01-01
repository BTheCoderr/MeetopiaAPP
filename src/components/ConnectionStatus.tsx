'use client'
import React, { useState } from 'react'

interface ConnectionStats {
  quality: 'good' | 'fair' | 'poor';
  latency?: number;
  packetLoss?: number;
}

interface ConnectionStatusProps {
  isConnected?: boolean;
  isWaiting?: boolean;
  error?: string | null;
  stats?: ConnectionStats | null;
  onRetry?: () => Promise<void>;
}

export default function ConnectionStatus({ 
  isConnected = false,
  isWaiting = false,
  error,
  stats,
  onRetry
}: ConnectionStatusProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (isWaiting) return 'bg-yellow-500';
    if (!isConnected) return 'bg-gray-500';
    if (!stats) return 'bg-green-500';

    switch (stats.quality) {
      case 'good':
        return 'bg-green-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (error) return error;
    if (isWaiting) return 'Waiting for partner...';
    if (!isConnected) return 'Not connected';
    if (!stats) return 'Connected';

    switch (stats.quality) {
      case 'good':
        return 'Good connection';
      case 'fair':
        return 'Fair connection';
      case 'poor':
        return 'Poor connection';
      default:
        return 'Connected';
    }
  };

  const getDetailedStats = () => {
    if (!stats) return null;
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
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex items-center gap-2">
      <button 
        className="flex items-center gap-1.5 hover:bg-gray-100 p-1 rounded transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
          isWaiting ? 'animate-pulse' : ''
        }`} />
        <span className="text-sm text-gray-600">
          {getStatusText()}
        </span>
      </button>

      {error && onRetry && (
        <button 
          className="text-xs text-blue-500 hover:underline px-2 py-1 rounded-full hover:bg-blue-50 transition-colors"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}

      {showDetails && getDetailedStats()}
    </div>
  );
} 