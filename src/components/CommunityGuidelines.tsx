'use client'
import { useState, useEffect } from 'react'

interface CommunityGuidelinesProps {
  isOpen: boolean
  onAccept: () => void
  onClose: () => void
}

const CommunityGuidelines: React.FC<CommunityGuidelinesProps> = ({
  isOpen,
  onAccept,
  onClose
}) => {
  const [hasAccepted, setHasAccepted] = useState(false)
  
  // Check if user has previously accepted guidelines
  useEffect(() => {
    const accepted = localStorage.getItem('meetopia_guidelines_accepted')
    if (accepted) {
      setHasAccepted(true)
      // Auto-close if already accepted
      onAccept()
    }
  }, [onAccept])
  
  const handleAccept = () => {
    localStorage.setItem('meetopia_guidelines_accepted', 'true')
    setHasAccepted(true)
    onAccept()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Community Guidelines</h2>
          
          <div className="prose prose-sm max-w-none">
            <p className="font-medium text-gray-700">
              Welcome to Meetopia! To ensure a safe and enjoyable experience for everyone,
              please follow these guidelines when using our platform:
            </p>
            
            <h3 className="font-bold text-lg mt-4 mb-2">Prohibited Content</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nudity or sexually explicit content</li>
              <li>Harassment, hate speech, or bullying</li>
              <li>Violence or threats of violence</li>
              <li>Illegal activities or promotion of illegal content</li>
              <li>Sharing of personal information without consent</li>
              <li>Users under the age of 18</li>
            </ul>
            
            <h3 className="font-bold text-lg mt-4 mb-2">Moderation and Safety</h3>
            <p>
              Meetopia uses automated and user-based moderation to detect inappropriate content.
              Reported users may be temporarily or permanently banned based on the severity and 
              frequency of violations.
            </p>
            
            <h3 className="font-bold text-lg mt-4 mb-2">Your Data and Privacy</h3>
            <p>
              We do not store video or audio from your chats. However, reports may include 
              screenshots for moderation purposes. 
            </p>
            
            <h3 className="font-bold text-lg mt-4 mb-2">Be Respectful</h3>
            <p>
              Treat others with respect. If someone asks you to stop a behavior, please respect 
              their wishes. Use the "Next" button to move on if you're not interested in continuing
              a conversation.
            </p>
            
            <h3 className="font-bold text-lg mt-4 mb-2">Reporting</h3>
            <p>
              If you encounter inappropriate content or behavior, please use the "Report" button.
              Your reports help us keep Meetopia safe for everyone.
            </p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityGuidelines 