import { api } from './api'
import type { BlockRecord, ConnectionMessage, ConnectionSummary, NotificationItem } from '../types/currentProduct'

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
      api<{ messages: ConnectionMessage[]; newlyReadIds?: string[] }>(`/api/connections/${encodeURIComponent(connectionId)}/messages`),
    sendMessage: (connectionId: string, content: string) =>
      api<{ message: ConnectionMessage }>(`/api/connections/${encodeURIComponent(connectionId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    callProof: (connectionId: string) =>
      api<{ proof: string; person: { id: string; username: string | null; displayName: string | null } }>(`/api/connections/${encodeURIComponent(connectionId)}/call-proof`, { method: 'POST' }),
  },
  notifications: {
    list: () => api<{ notifications: NotificationItem[] }>('/api/notifications'),
  },
  presence: {
    touch: () => api<{ lastSeenAt: string }>('/api/presence/heartbeat', { method: 'POST' }),
  },
  blocks: {
    list: () => api<{ blocks: BlockRecord[] }>('/api/blocks'),
    block: (blockedUserId: string) => api('/api/blocks', { method: 'POST', body: JSON.stringify({ blockedUserId }) }),
    unblock: (blockedUserId: string) => api('/api/blocks', { method: 'DELETE', body: JSON.stringify({ blockedUserId }) }),
  },
  reports: {
    create: (reportedUserId: string, reason: string, details?: string) =>
      api('/api/reports', { method: 'POST', body: JSON.stringify({ reportedUserId, reason, details }) }),
  },
}
