// Types based on Prisma schema
export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  interests: string[];
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  receiverId: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details?: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  type: 'connection_issues' | 'audio_video_quality' | 'feature_request' | 'bug_report' | 'other';
  details?: string | null;
  status: 'NEW' | 'REVIEWED' | 'IMPLEMENTED' | 'DISMISSED';
  createdAt: Date;
  updatedAt: Date;
} 