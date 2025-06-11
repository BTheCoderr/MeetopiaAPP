'use client'
import Link from 'next/link'

export const Profile = () => (
  <div className="relative min-h-screen bg-white">
    {/* Header */}
    <div className="flex justify-between items-center p-4 border-b">
      <Link href="/" className="text-2xl font-bold text-blue-500">
        <img src="/meetopia.png" alt="Meetopia" className="h-6 w-auto" />
        <span className="ml-2 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">Beta</span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">PROFILE</span>
        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">Connected</span>
      </div>
    </div>

    {/* Profile Content */}
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
        
        <form className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500"
                placeholder="Your display name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea 
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Chat Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-blue-500" />
                <span>Enable video by default</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-blue-500" />
                <span>Enable audio by default</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
) 