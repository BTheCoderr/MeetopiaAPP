export interface Video {
  id: string
  url: string
  title: string
  description?: string
  duration: number
  createdAt: Date
  updatedAt: Date
  userId: string
}