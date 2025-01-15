'use client'
import React, { useState } from 'react'

interface ReportUserProps {
  userId: string
  onReport: (reason: string, details: string) => void
  onBlock: () => void
}

export default function ReportUser({ userId, onReport, onBlock }: ReportUserProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault()
    onReport(reason, details)
    setReason('')
    setDetails('')
  }

  const REPORT_REASONS = [
    'Inappropriate behavior',
    'Harassment',
    'Spam',
    'Underage user',
    'Other'
  ]

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Report User</h3>
      
      <form onSubmit={handleReport} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2"
            required
          >
            <option value="">Select a reason</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2"
            rows={4}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-red-500 text-white rounded-md py-2 hover:bg-red-600"
          >
            Report User
          </button>
          <button
            type="button"
            onClick={onBlock}
            className="flex-1 bg-gray-500 text-white rounded-md py-2 hover:bg-gray-600"
          >
            Block User
          </button>
        </div>
      </form>
    </div>
  )
} 