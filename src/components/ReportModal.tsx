'use client'
import { useState } from 'react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (type: 'report' | 'improvement', reason: string, details: string) => void
  reportedUserId?: string
}

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  reportedUserId
}: ReportModalProps) {
  const [type, setType] = useState<'report' | 'improvement'>('report')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(type, reason, details)
    setReason('')
    setDetails('')
    setType('report')
  }

  const reportReasons = [
    'Inappropriate behavior',
    'Harassment',
    'Spam',
    'Offensive content',
    'Other'
  ]

  const improvementReasons = [
    'Bug report',
    'Feature request',
    'UI/UX suggestion',
    'Performance issue',
    'Other'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {reportedUserId ? 'Report User' : 'Send Feedback'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!reportedUserId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setType('report')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                    type === 'report'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Report Issue
                </button>
                <button
                  type="button"
                  onClick={() => setType('improvement')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                    type === 'improvement'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Suggest Improvement
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'report' ? 'Reason for report' : 'Type of improvement'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a reason</option>
              {(type === 'report' ? reportReasons : improvementReasons).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide more information..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                type === 'report'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 