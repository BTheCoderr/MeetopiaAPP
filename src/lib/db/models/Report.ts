import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  reportedUserId: { type: String, required: true },
  reporterId: { type: String, required: true },
  reason: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
})

export const ReportModel = mongoose.models.Report || mongoose.model('Report', reportSchema) 