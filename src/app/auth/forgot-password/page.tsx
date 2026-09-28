'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not send reset link.')
      setMessage(data.message || 'Check your email for a reset link.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send reset link.')
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
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the email or username on your account.
        </p>

        {message && <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Email or username</label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
