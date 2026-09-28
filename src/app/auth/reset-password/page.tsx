'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '')
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    if (!token) {
      setError('This reset link is missing its token.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not reset password.')
      setMessage(data.message || 'Password updated. You can sign in now.')
      setPassword('')
      setConfirmPassword('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-center text-3xl font-bold">
          <span className="text-blue-500">Meet</span>
          <span className="text-gray-700">opia</span>
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Choose a new password</h2>

        {message && <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-16 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm new password</label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-16 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowConfirmPassword(value => !value)} className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600">
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {isLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
