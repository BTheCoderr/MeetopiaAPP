import { api } from './api'
import type { ConnectionMessage, ConnectionSummary, NotificationItem } from '../types/currentProduct'

export const currentProduct = {
  connections: {
    list: () => api<{ connections: ConnectionSummary[] }>('/api/connections'),
    get: (connectionId: string) => api<{ connection: ConnectionSummary }>(`/api/connections/${encodeURIComponent(connectionId)}`),
    saveMutualVibe: (connectionProof: string) =>
      api<{ connection: ConnectionSummary }>('/api/connections', {
        method: 'POST',
        body: JSON.stringify({ connectionProof }),
      }),
    messages: (connectionId: string) =>
      api<{ messages: ConnectionMessage[] }>(`/api/connections/${encodeURIComponent(connectionId)}/messages`),
    sendMessage: (connectionId: string, content: string) =>
      api<{ message: ConnectionMessage }>(`/api/connections/${encodeURIComponent(connectionId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    callProof: (connectionId: string) =>
      api<{ callProof: string }>(`/api/connections/${encodeURIComponent(connectionId)}/call-proof`, { method: 'POST' }),
  },
  notifications: {
    list: () => api<{ notifications: NotificationItem[] }>('/api/notifications'),
  },
  presence: {
    touch: () => api('/api/presence', { method: 'POST' }),
  },
  blocks: {
    list: () => api('/api/blocks'),
    block: (userId: string) => api('/api/blocks', { method: 'POST', body: JSON.stringify({ userId }) }),
    unblock: (userId: string) => api(`/api/blocks?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' }),
  },
  reports: {
    create: (reportedUserId: string, reason: string, details?: string) =>
      api('/api/reports', { method: 'POST', body: JSON.stringify({ reportedUserId, reason, details }) }),
  },
}
