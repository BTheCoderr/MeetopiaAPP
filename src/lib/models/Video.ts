import mongoose from 'mongoose'

export interface Video {
  id: string
  url: string
  userId: string
  likes: number
  createdAt: Date
}

const videoSchema = new mongoose.Schema<Video>({
  url: { type: String, required: true },
  userId: { type: String, required: true },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

export const VideoModel = mongoose.models.Video || mongoose.model<Video>('Video', videoSchema)