import { useState } from 'react'

export function useReporting() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportedUserId, setReportedUserId] = useState<string | null>(null)

  const openReportModal = (userId: string) => {
    setReportedUserId(userId)
    setIsReportModalOpen(true)
  }

  const closeReportModal = () => {
    setIsReportModalOpen(false)
    setReportedUserId(null)
  }

  const handleReport = async (type: 'report' | 'improvement', reason: string, details: string) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          reportedUserId,
          reason,
          details
        })
      })

      if (!res.ok) {
        throw new Error('Failed to submit report')
      }

      closeReportModal()
    } catch (err) {
      console.error('Error submitting report:', err)
    }
  }

  return {
    isReportModalOpen,
    reportedUserId,
    openReportModal,
    closeReportModal,
    handleReport
  }
} 