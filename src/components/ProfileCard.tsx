import React from 'react'

interface ProfileCardProps {
  bio: string
  interests: string[]
}

const ProfileCard: React.FC<ProfileCardProps> = ({ bio, interests }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm text-gray-500 mb-1">About</h4>
          {bio ? (
            <p className="text-gray-700">{bio}</p>
          ) : (
            <p className="text-gray-400 italic">No bio provided</p>
          )}
        </div>
        
        <div>
          <h4 className="text-sm text-gray-500 mb-2">Interests</h4>
          {interests && interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span 
                  key={index} 
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No interests shared</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileCard 