export type Person = {
  id: string
  username: string | null
  displayName: string | null
  lastSeenAt: string | null
}

export type ConnectionSummary = {
  id: string
  createdAt: string
  person: Person
  unreadCount: number
  realtimeProof: string
  lastMessage: null | {
    id: string
    content: string
    createdAt: string
    mine: boolean
  }
}

export type ConnectionMessage = {
  id: string
  content: string
  createdAt: string
  readAt?: string | null
  mine: boolean
  senderId?: string
  receiverId?: string
}

export type NotificationItem = {
  id: string
  type: string
  createdAt: string
  readAt?: string | null
  title?: string
  body?: string
  data?: Record<string, unknown>
}
