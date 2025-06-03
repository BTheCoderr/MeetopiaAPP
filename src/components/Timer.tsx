import React from 'react'

interface TimerProps {
  seconds: number
}

const Timer: React.FC<TimerProps> = ({ seconds }) => {
  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Determine color based on time remaining
  const getColorClass = (): string => {
    if (seconds <= 30) return 'text-red-600 bg-red-100'
    if (seconds <= 60) return 'text-yellow-600 bg-yellow-100' 
    return 'text-blue-600 bg-blue-100'
  }
  
  const colorClass = getColorClass()
  
  return (
    <div className={`px-4 py-2 rounded-lg font-mono font-bold ${colorClass} flex items-center shadow-md`}>
      <svg 
        className="w-5 h-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      {formatTime(seconds)}
    </div>
  )
}

export default Timer 