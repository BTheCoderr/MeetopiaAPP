'use client'

import { useEffect, useState } from 'react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (type: 'report' | 'improvement', reason: string, details: string) => Promise<void>
  reportedUserId?: string
}

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  reportedUserId,
}: ReportModalProps) {
  const [type, setType] = useState<'report' | 'improvement'>('report')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setDetails('')
      setType('report')
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(type, reason, details)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reportReasons = [
    'Inappropriate behavior',
    'Harassment',
    'Nudity or sexual content',
    'Hate or threats',
    'Spam or scam',
    'Appears underage',
    'Other',
  ]

  const improvementReasons = [
    'Bug report',
    'Feature request',
    'UI/UX suggestion',
    'Performance issue',
    'Other',
  ]

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {reportedUserId ? 'Report this person' : 'Send Feedback'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close report form">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!reportedUserId && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setType('report')} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${type === 'report' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Report Issue
                </button>
                <button type="button" onClick={() => setType('improvement')} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${type === 'improvement' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Suggest Improvement
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {type === 'report' ? 'Reason for report' : 'Type of improvement'}
            </label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500">
              <option value="">Select a reason</option>
              {(type === 'report' ? reportReasons : improvementReasons).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Additional details</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} required rows={4} maxLength={2000} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder="Please provide enough detail for us to review what happened." />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${type === 'report' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
