import type { Video } from './Video'

interface User {
  id: string
  username: string
  profileImage?: string
  videos: Video[]
}

export type { User } 