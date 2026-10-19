'use client'

import { useState } from 'react'

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

  const handleReport = async (
    type: 'report' | 'improvement',
    reason: string,
    details: string
  ) => {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        type,
        reportedUserId,
        reason,
        details,
      }),
    })
    const data = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(data?.error || 'Failed to submit report')
    }

    closeReportModal()
  }

  return {
    isReportModalOpen,
    reportedUserId,
    openReportModal,
    closeReportModal,
    handleReport,
  }
}
