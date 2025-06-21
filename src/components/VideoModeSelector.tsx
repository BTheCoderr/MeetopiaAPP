'use client'
import { useState } from 'react'

interface VideoModeSelectorProps {
  onModeSelect: (mode: 'p2p' | 'jitsi', maxParticipants?: number) => void
  currentMode?: 'p2p' | 'jitsi'
  participantCount?: number
}

export default function VideoModeSelector({ 
  onModeSelect, 
  currentMode = 'p2p',
  participantCount = 1 
}: VideoModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'p2p' | 'jitsi'>(currentMode)
  const [expectedParticipants, setExpectedParticipants] = useState(2)

  const handleModeChange = (mode: 'p2p' | 'jitsi') => {
    setSelectedMode(mode)
    onModeSelect(mode, expectedParticipants)
  }

  const getRecommendedMode = () => {
    if (expectedParticipants <= 4) return 'p2p'
    return 'jitsi'
  }

  const recommendedMode = getRecommendedMode()

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <h3 className="text-white font-semibold mb-3">Choose Video Mode</h3>
      
      {/* Participant Count Selector */}
      <div className="mb-4">
        <label className="block text-white/80 text-sm mb-2">
          Expected participants: {expectedParticipants}
        </label>
        <input
          type="range"
          min="2"
          max="50"
          value={expectedParticipants}
          onChange={(e) => setExpectedParticipants(Number(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>2</span>
          <span>25</span>
          <span>50+</span>
        </div>
      </div>

      {/* Mode Options */}
      <div className="space-y-3">
        {/* P2P WebRTC Mode */}
        <div 
          onClick={() => handleModeChange('p2p')}
          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
            selectedMode === 'p2p'
              ? 'border-blue-400 bg-blue-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium flex items-center gap-2">
                🔗 Direct P2P Connection
                {recommendedMode === 'p2p' && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Recommended
                  </span>
                )}
              </h4>
              <p className="text-white/70 text-sm">
                Best for 1-4 people • Lowest latency • Your existing features
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              selectedMode === 'p2p' ? 'border-blue-400 bg-blue-400' : 'border-white/40'
            }`} />
          </div>
          
          <div className="mt-2 text-xs text-white/60">
            ✅ Picture-in-Picture • ✅ All your controls • ✅ Best quality • ✅ Free
          </div>
          
          {expectedParticipants > 4 && selectedMode === 'p2p' && (
            <div className="mt-2 text-xs text-yellow-400">
              ⚠️ May have connection issues with {expectedParticipants} people
            </div>
          )}
        </div>

        {/* Jitsi Meet Mode */}
        <div 
          onClick={() => handleModeChange('jitsi')}
          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
            selectedMode === 'jitsi'
              ? 'border-purple-400 bg-purple-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium flex items-center gap-2">
                🎥 Jitsi Meet (Scalable)
                {recommendedMode === 'jitsi' && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Recommended
                  </span>
                )}
              </h4>
              <p className="text-white/70 text-sm">
                Perfect for 5+ people • Enterprise grade • Your Meetopia UI
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              selectedMode === 'jitsi' ? 'border-purple-400 bg-purple-400' : 'border-white/40'
            }`} />
          </div>
          
          <div className="mt-2 text-xs text-white/60">
            ✅ Up to 50+ people • ✅ Screen sharing • ✅ Recording • ✅ Free forever
          </div>
          
          {expectedParticipants <= 4 && selectedMode === 'jitsi' && (
            <div className="mt-2 text-xs text-blue-400">
              💡 P2P mode might give better quality for small groups
            </div>
          )}
        </div>
      </div>

      {/* Current Status */}
      {participantCount > 1 && (
        <div className="mt-4 p-2 bg-black/20 rounded-lg">
          <div className="text-xs text-white/80">
            Currently: {participantCount} participant{participantCount !== 1 ? 's' : ''} • 
            Mode: {currentMode === 'p2p' ? 'Direct P2P' : 'Jitsi Meet'}
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #60a5fa;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #60a5fa;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  )
} 