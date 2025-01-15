'use client'
import React, { useState } from 'react'
import { UserProfile, INTERESTS } from '../../lib/types/user'

interface ProfileSettingsProps {
  profile: UserProfile
  onUpdate: (profile: Partial<UserProfile>) => void
}

export default function ProfileSettings({ profile, onUpdate }: ProfileSettingsProps) {
  const [age, setAge] = useState(profile.age)
  const [location, setLocation] = useState(profile.location)
  const [selectedInterests, setSelectedInterests] = useState(profile.interests)
  const [ageRange, setAgeRange] = useState(profile.preferences.ageRange)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({
      age,
      location,
      interests: selectedInterests,
      preferences: {
        ...profile.preferences,
        ageRange,
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div>
        <label className="block text-sm font-medium">Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Interests</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {INTERESTS.map((interest) => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedInterests.includes(interest)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedInterests([...selectedInterests, interest])
                  } else {
                    setSelectedInterests(selectedInterests.filter(i => i !== interest))
                  }
                }}
                className="mr-2"
              />
              {interest}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Age Range Preference</label>
        <div className="flex gap-4">
          <input
            type="number"
            value={ageRange[0]}
            onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
            className="mt-1 block w-full rounded-md border p-2"
          />
          <input
            type="number"
            value={ageRange[1]}
            onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
            className="mt-1 block w-full rounded-md border p-2"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600"
      >
        Save Settings
      </button>
    </form>
  )
} 