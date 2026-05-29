import React from 'react'

interface ProfileCardProps {
  bio: string;
  interests: string[];
  name?: string;
  age?: number;
  gender?: string;
  lookingFor?: string;
}

export default function ProfileCard({ 
  bio, 
  interests,
  name, 
  age,
  gender,
  lookingFor
}: ProfileCardProps) {
  // Format interests for display
  const formattedInterests = interests.map(interest => 
    interest.charAt(0).toUpperCase() + interest.slice(1)
  )

  return (
    <div className="w-full">
      {/* Name, age, gender section (if provided) */}
      {(name || age || gender) && (
        <div className="mb-2">
          {name && (
            <div className="flex items-center gap-2">
              <span className="font-medium">{name}</span>
              {age && <span className="text-gray-600">{age}</span>}
              {gender && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </span>
              )}
            </div>
          )}
          
          {lookingFor && (
            <div className="text-xs text-gray-500 mt-1">
              Looking for: {lookingFor === 'both' ? 'Everyone' : lookingFor === 'male' ? 'Men' : 'Women'}
            </div>
          )}
        </div>
      )}
      
      {/* Bio section */}
      <div className="mt-2">
        <p className="text-sm text-gray-700 line-clamp-3">{bio}</p>
      </div>
      
      {/* Interests tags */}
      <div className="mt-3 flex flex-wrap gap-1">
        {formattedInterests.map((interest, index) => (
          <span 
            key={index}
            className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {interest}
          </span>
        ))}
      </div>
    </div>
  )
} 