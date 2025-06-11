'use client'
import DailyIframe from '@daily-co/daily-js';
import { useState, useEffect } from 'react';

// =====================================
// TYPES
// =====================================

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  api_created: boolean;
  privacy: 'private' | 'public';
  config: {
    max_participants?: number;
    enable_screenshare?: boolean;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    enable_recording?: boolean;
    start_cloud_recording?: boolean;
    autojoin?: boolean;
  };
  created_at: string;
}

export interface DailyMeetingToken {
  token: string;
  room_name: string;
  is_owner: boolean;
  user_name?: string;
  user_id?: string;
}

export interface CreateRoomOptions {
  name?: string;
  privacy?: 'private' | 'public';
  maxParticipants?: number;
  enableScreenshare?: boolean;
  enableChat?: boolean;
  enableKnocking?: boolean;
  enableRecording?: boolean;
  autoJoin?: boolean;
}

export interface CreateTokenOptions {
  roomName: string;
  userName?: string;
  userId?: string;
  isOwner?: boolean;
  expiration?: number; // Unix timestamp
}

// =====================================
// DAILY API SERVICE
// =====================================

class DailyService {
  private apiKey: string;
  private baseUrl = 'https://api.daily.co/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DAILY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Daily API key not found. Video features will be limited.');
    }
  }

  // =====================================
  // ROOM MANAGEMENT
  // =====================================

  async createRoom(options: CreateRoomOptions = {}): Promise<DailyRoom> {
    const roomData = {
      name: options.name || `meetopia-${Date.now()}`,
      privacy: options.privacy || 'private',
      properties: {
        max_participants: options.maxParticipants || 10,
        enable_screenshare: options.enableScreenshare !== false,
        enable_chat: options.enableChat !== false,
        enable_knocking: options.enableKnocking !== false,
        enable_recording: options.enableRecording || false,
        autojoin: options.autoJoin || false,
        // Enterprise features
        enable_prejoin_ui: true,
        enable_network_ui: true,
        enable_noise_cancellation_ui: true,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Daily API Error: ${error.error || response.statusText}`);
      }

      const room = await response.json();
      console.log('✅ Daily room created:', room.name);
      return room;
    } catch (error) {
      console.error('❌ Failed to create Daily room:', error);
      throw error;
    }
  }

  async getRoom(roomName: string): Promise<DailyRoom> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Room not found: ${roomName}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get Daily room:', error);
      throw error;
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete room: ${roomName}`);
      }

      console.log('✅ Daily room deleted:', roomName);
    } catch (error) {
      console.error('❌ Failed to delete Daily room:', error);
      throw error;
    }
  }

  // =====================================
  // ACCESS TOKEN MANAGEMENT
  // =====================================

  async createMeetingToken(options: CreateTokenOptions): Promise<DailyMeetingToken> {
    const tokenData = {
      properties: {
        room_name: options.roomName,
        user_name: options.userName,
        user_id: options.userId,
        is_owner: options.isOwner || false,
        exp: options.expiration || Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour default
        // Participant permissions
        enable_screenshare: true,
        enable_recording: options.isOwner || false,
        start_cloud_recording: false,
        start_transcription: false,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/meeting-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(tokenData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Daily Token Error: ${error.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Daily meeting token created for:', options.userName);
      
      return {
        token: result.token,
        room_name: options.roomName,
        is_owner: options.isOwner || false,
        user_name: options.userName,
        user_id: options.userId,
      };
    } catch (error) {
      console.error('❌ Failed to create Daily meeting token:', error);
      throw error;
    }
  }

  // =====================================
  // RECORDING MANAGEMENT
  // =====================================

  async startRecording(roomName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}/recordings/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to start recording for room: ${roomName}`);
      }

      console.log('✅ Recording started for room:', roomName);
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(roomName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}/recordings/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to stop recording for room: ${roomName}`);
      }

      console.log('✅ Recording stopped for room:', roomName);
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      throw error;
    }
  }

  // =====================================
  // ANALYTICS AND MONITORING
  // =====================================

  async getRoomAnalytics(roomName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}/presence`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get analytics for room: ${roomName}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get room analytics:', error);
      throw error;
    }
  }

  // =====================================
  // CLIENT-SIDE DAILY IFRAME HELPERS
  // =====================================

  static createDailyCall(containerElement?: HTMLElement) {
    return DailyIframe.createCallObject({
      showLeaveButton: true,
      showFullscreenButton: true,
      showLocalVideo: true,
      showParticipantsBar: true,
      activeSpeakerMode: true,
    });
  }

  static async joinMeeting(call: any, roomUrl: string, token?: string) {
    try {
      await call.join({
        url: roomUrl,
        token: token,
        userName: 'Meetopia User',
      });
      console.log('✅ Successfully joined Daily meeting');
    } catch (error) {
      console.error('❌ Failed to join Daily meeting:', error);
      throw error;
    }
  }

  static async leaveMeeting(call: any) {
    try {
      await call.leave();
      call.destroy();
      console.log('✅ Successfully left Daily meeting');
    } catch (error) {
      console.error('❌ Failed to leave Daily meeting:', error);
      throw error;
    }
  }
}

// =====================================
// SINGLETON INSTANCE
// =====================================

export const dailyService = new DailyService();

// =====================================
// REACT HOOKS (for easy integration)
// =====================================

export const useDailyCall = () => {
  const [call, setCall] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const dailyCall = DailyService.createDailyCall();
    setCall(dailyCall);

    // Event listeners
    dailyCall.on('joined-meeting', () => {
      setIsJoined(true);
      console.log('📹 Joined Daily meeting');
    });

    dailyCall.on('left-meeting', () => {
      setIsJoined(false);
      setParticipants([]);
      console.log('👋 Left Daily meeting');
    });

    dailyCall.on('participant-joined', (event: any) => {
      console.log('👤 Participant joined:', event.participant);
      setParticipants((prev: any[]) => [...prev, event.participant]);
    });

    dailyCall.on('participant-left', (event: any) => {
      console.log('👤 Participant left:', event.participant);
      setParticipants((prev: any[]) => prev.filter((p: any) => p.session_id !== event.participant.session_id));
    });

    return () => {
      if (dailyCall) {
        dailyCall.destroy();
      }
    };
  }, []);

  const joinMeeting = async (roomUrl: string, token?: string) => {
    if (call) {
      await DailyService.joinMeeting(call, roomUrl, token);
    }
  };

  const leaveMeeting = async () => {
    if (call) {
      await DailyService.leaveMeeting(call);
    }
  };

  return {
    call,
    participants,
    isJoined,
    joinMeeting,
    leaveMeeting,
  };
};

// =====================================
// EXPORT TYPES AND UTILITIES
// =====================================

export default DailyService; 