'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type DatingProfileForm = {
  name: string
  age: string
  gender: string
  lookingFor: string
  bio: string
}

export default function DatingProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<DatingProfileForm>({
    name: '',
    age: '',
    gender: '',
    lookingFor: '',
    bio: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/auth/signin?next=/dating/profile')
          return
        }
        if (!response.ok) throw new Error('Could not load your Meetopia profile.')

        const profile = await response.json()
        setFormData({
          name: profile.name || '',
          age: profile.age ? String(profile.age) : '',
          gender: profile.gender || '',
          lookingFor: profile.lookingFor || '',
          bio: profile.bio || '',
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [router])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData(previous => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const age = Number(formData.age)
    if (!formData.name.trim() || !Number.isInteger(age) || age < 18 || age > 99 || !formData.gender || !formData.lookingFor) {
      setError('Complete your profile and confirm that you are 18 or older.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age,
          gender: formData.gender,
          lookingFor: formData.lookingFor,
          bio: formData.bio,
        }),
      })
      const profile = await response.json()
      if (!response.ok) throw new Error(profile.error || 'Could not save your profile.')

      localStorage.setItem('datingProfileFormatted', JSON.stringify({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        lookingFor: profile.lookingFor,
        bio: profile.bio || '',
        interests: profile.interests || [],
      }))

      router.push('/chat/video?mode=dating')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save your profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading your profile…</div>
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-[0.2em] mb-2">Chemistry Check</p>
          <h1 className="text-3xl font-bold mb-2">Your Meetopia profile</h1>
          <p className="text-gray-400">A real profile means mutual Vibes can become saved Connections.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            maxLength={60}
            placeholder="First name or display name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="age"
              min="18"
              max="99"
              placeholder="Age (18+)"
              value={formData.age}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">I am…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <select
            name="lookingFor"
            value={formData.lookingFor}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">I want to meet…</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
            <option value="both">Everyone</option>
          </select>

          <textarea
            name="bio"
            maxLength={500}
            rows={3}
            placeholder="A little about you…"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none resize-none"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Start Chemistry Check'}
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Meetopia dating is 18+ only. By continuing, you agree to the Terms and Community Guidelines.
        </p>
      </div>
    </div>
  )
}
