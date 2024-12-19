import mongoose from 'mongoose'
import { Report } from '../../types/user'

const reportSchema = new mongoose.Schema<Report>({
  id: String,
  reportedUserId: String,
  reporterId: String,
  reason: String,
  details: String,
  timestamp: Date,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  }
})

export const ReportModel = mongoose.models.Report || mongoose.model<Report>('Report', reportSchema) 