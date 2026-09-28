import { useState } from 'react'

type ReportType = 'report' | 'improvement'

export function useReporting() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportedUserId, setReportedUserId] = useState<string | null>(null)

  const openReportModal = (userId: string) => {
    if (!userId) return
    setReportedUserId(userId)
    setIsReportModalOpen(true)
  }

  const closeReportModal = () => {
    setIsReportModalOpen(false)
    setReportedUserId(null)
  }

  const submitReportForUser = async (
    userId: string,
    type: ReportType,
    reason: string,
    details = ''
  ) => {
    if (!userId) throw new Error('No matched user is available to report.')

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        reportedUserId: userId,
        reason,
        details,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit report')
    }

    return data
  }

  const handleReport = async (type: ReportType, reason: string, details: string) => {
    try {
      if (!reportedUserId) throw new Error('No matched user is available to report.')
      await submitReportForUser(reportedUserId, type, reason, details)
      closeReportModal()
    } catch (err) {
      console.error('Error submitting report:', err)
      throw err
    }
  }

  return {
    isReportModalOpen,
    reportedUserId,
    openReportModal,
    closeReportModal,
    handleReport,
    submitReportForUser,
  }
}
