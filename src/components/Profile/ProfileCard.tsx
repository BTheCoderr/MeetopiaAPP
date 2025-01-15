import React from 'react'

interface ProfileCardProps {
  name: string
  age: number
  interests: string[]
  onReport: () => void
  onBlock: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  age,
  interests,
  onReport,
  onBlock
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-600">{age} years old</p>
        </div>
        <div className="space-x-2">
          <button 
            onClick={onReport}
            className="text-red-500 hover:text-red-700"
          >
            Report
          </button>
          <button 
            onClick={onBlock}
            className="text-gray-500 hover:text-gray-700"
          >
            Block
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium">Interests</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map(interest => (
            <span 
              key={interest}
              className="px-2 py-1 bg-gray-100 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
} 