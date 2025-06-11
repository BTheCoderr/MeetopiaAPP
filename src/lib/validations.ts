import { z } from 'zod';

// =====================================
// USER VALIDATION SCHEMAS
// =====================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
  displayName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  interests: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  interests: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// =====================================
// MEETING VALIDATION SCHEMAS
// =====================================

export const createMeetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startTime: z.string().datetime('Invalid start time format'),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 8 hours'),
  isPublic: z.boolean().optional(),
  maxParticipants: z.number().min(2, 'Must allow at least 2 participants').max(100, 'Cannot exceed 100 participants').optional(),
  allowChat: z.boolean().optional(),
  allowScreenShare: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  waitingRoom: z.boolean().optional(),
  invitedEmails: z.array(z.string().email('Invalid email address')).optional(),
});

export const updateMeetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startTime: z.string().datetime('Invalid start time format').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 8 hours').optional(),
  isPublic: z.boolean().optional(),
  maxParticipants: z.number().min(2, 'Must allow at least 2 participants').max(100, 'Cannot exceed 100 participants').optional(),
  allowChat: z.boolean().optional(),
  allowScreenShare: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  waitingRoom: z.boolean().optional(),
});

export const joinMeetingSchema = z.object({
  meetingId: z.string().cuid('Invalid meeting ID'),
  password: z.string().optional(), // For password-protected meetings
});

export const meetingActionSchema = z.object({
  action: z.enum(['start', 'end', 'pause', 'resume']),
  meetingId: z.string().cuid('Invalid meeting ID'),
});

// =====================================
// CHAT MESSAGE VALIDATION SCHEMAS
// =====================================

export const sendMessageSchema = z.object({
  meetingId: z.string().cuid('Invalid meeting ID'),
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
  type: z.enum(['TEXT', 'SYSTEM', 'EMOJI', 'FILE']).optional(),
});

// =====================================
// PARTICIPANT VALIDATION SCHEMAS
// =====================================

export const updateParticipantSchema = z.object({
  meetingId: z.string().cuid('Invalid meeting ID'),
  userId: z.string().cuid('Invalid user ID'),
  role: z.enum(['HOST', 'CO_HOST', 'PARTICIPANT']).optional(),
  canSpeak: z.boolean().optional(),
  canVideo: z.boolean().optional(),
  canShare: z.boolean().optional(),
});

export const participantActionSchema = z.object({
  meetingId: z.string().cuid('Invalid meeting ID'),
  userId: z.string().cuid('Invalid user ID'),
  action: z.enum(['mute', 'unmute', 'kick', 'promote', 'demote']),
});

// =====================================
// REPORT VALIDATION SCHEMAS
// =====================================

export const createReportSchema = z.object({
  reportedUserId: z.string().cuid('Invalid user ID'),
  reason: z.string().min(1, 'Reason is required'),
  details: z.string().max(1000, 'Details must be less than 1000 characters').optional(),
});

// =====================================
// FEEDBACK VALIDATION SCHEMAS
// =====================================

export const createFeedbackSchema = z.object({
  type: z.enum(['connection_issues', 'audio_video_quality', 'feature_request', 'bug_report', 'other']),
  details: z.string().max(1000, 'Details must be less than 1000 characters').optional(),
});

// =====================================
// QUERY PARAMETER SCHEMAS
// =====================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be greater than 0').optional(),
  limit: z.coerce.number().min(1, 'Limit must be greater than 0').max(100, 'Limit must be between 1 and 100').optional(),
});

export const meetingQuerySchema = z.object({
  status: z.enum(['SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED']).optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
  hostId: z.string().cuid('Invalid host ID').optional(),
}).merge(paginationSchema);

// =====================================
// RECORDING VALIDATION SCHEMAS
// =====================================

export const recordingActionSchema = z.object({
  meetingId: z.string().cuid('Invalid meeting ID'),
  action: z.enum(['start', 'stop', 'pause', 'resume']),
});

export const uploadRecordingSchema = z.object({
  meetingId: z.string().cuid('Invalid meeting ID'),
  filename: z.string().min(1, 'Filename is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  duration: z.number().min(1, 'Duration must be greater than 0').optional(),
  format: z.string().min(1, 'Format is required'),
});

// =====================================
// WEBRTC SIGNALING VALIDATION SCHEMAS
// =====================================

export const webrtcOfferSchema = z.object({
  to: z.string().min(1, 'Recipient ID is required'),
  offer: z.object({
    type: z.literal('offer'),
    sdp: z.string().min(1, 'SDP is required'),
  }),
});

export const webrtcAnswerSchema = z.object({
  to: z.string().min(1, 'Recipient ID is required'),
  answer: z.object({
    type: z.literal('answer'),
    sdp: z.string().min(1, 'SDP is required'),
  }),
});

export const webrtcIceCandidateSchema = z.object({
  to: z.string().min(1, 'Recipient ID is required'),
  candidate: z.object({
    candidate: z.string(),
    sdpMid: z.string().nullable(),
    sdpMLineIndex: z.number().nullable(),
  }),
});

// =====================================
// TYPE EXPORTS (for TypeScript usage)
// =====================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type JoinMeetingInput = z.infer<typeof joinMeetingSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type MeetingQueryInput = z.infer<typeof meetingQuerySchema>;
export type WebRTCOfferInput = z.infer<typeof webrtcOfferSchema>;
export type WebRTCAnswerInput = z.infer<typeof webrtcAnswerSchema>;
export type WebRTCIceCandidateInput = z.infer<typeof webrtcIceCandidateSchema>; 