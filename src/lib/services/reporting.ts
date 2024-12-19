import { ReportReason } from '../types/user'

export class ReportingService {
  async createReport(
    reporterId: string,
    reportedUserId: string,
    reason: ReportReason,
    details?: string
  ) {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterId,
        reportedUserId,
        reason,
        details
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create report')
    }
    
    return response.json()
  }

  async blockUser(userId: string, blockedUserId: string) {
    const response = await fetch('/api/users/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        blockedUserId
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to block user')
    }
    
    return response.json()
  }
} 