// Production Daily.co service for real video calling
// This version uses your actual Daily.co API key and domain

interface DailyRoomConfig {
  max_participants?: number;
  enable_chat?: boolean;
  enable_screenshare?: boolean;
  privacy?: 'public' | 'private';
  exp?: number; // Expiration time
}

interface DailyRoomResponse {
  id: string;
  name: string;
  api_created: boolean;
  privacy: string;
  url: string;
  created_at: string;
  config: {
    max_participants: number;
    enable_chat: boolean;
    enable_screenshare: boolean;
  };
}

// Daily.co API configuration - PRODUCTION
const DAILY_API_KEY = process.env.EXPO_PUBLIC_DAILY_API_KEY || '60dd35ba5b70dcbc5f9809f27d6d47623bebd234a7eec2a0f35be9caf4e539e8';
const DAILY_DOMAIN = process.env.EXPO_PUBLIC_DAILY_DOMAIN || 'meetopia.daily.co';
const DAILY_API_BASE_URL = 'https://api.daily.co/v1';

export const createDailyRoom = async (config: DailyRoomConfig = {}): Promise<DailyRoomResponse> => {
  try {
    console.log('Creating Daily.co room with API key:', DAILY_API_KEY ? 'Present' : 'Missing');
    
    const roomConfig = {
      privacy: 'public',
      max_participants: config.max_participants || 2,
      enable_chat: config.enable_chat !== false,
      enable_screenshare: config.enable_screenshare !== false,
      exp: config.exp || Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours from now
      ...config,
    };

    const response = await fetch(`${DAILY_API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify(roomConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Daily.co API error:', response.status, errorText);
      throw new Error(`Daily.co API error: ${response.status} ${response.statusText}`);
    }

    const roomData = await response.json();
    console.log('Successfully created Daily.co room:', roomData.name);
    return roomData;

  } catch (error) {
    console.error('Failed to create Daily.co room:', error);
    throw error; // Don't fallback to mock for production
  }
};

export const deleteDailyRoom = async (roomName: string): Promise<void> => {
  try {
    const response = await fetch(`${DAILY_API_BASE_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.status} ${response.statusText}`);
    }

    console.log('Successfully deleted Daily.co room:', roomName);
  } catch (error) {
    console.error('Failed to delete Daily.co room:', error);
    throw error;
  }
};

export const getDailyRoom = async (roomName: string): Promise<DailyRoomResponse | null> => {
  try {
    const response = await fetch(`${DAILY_API_BASE_URL}/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Room not found
      }
      throw new Error(`Failed to get room: ${response.status} ${response.statusText}`);
    }

    const roomData = await response.json();
    return roomData;

  } catch (error) {
    console.error('Failed to get Daily.co room:', error);
    return null;
  }
};

// Create a meeting token for authentication
export const createMeetingToken = async (roomName: string, options: {
  user_name?: string;
  is_owner?: boolean;
  exp?: number;
} = {}): Promise<string> => {
  try {
    const tokenConfig = {
      properties: {
        room_name: roomName,
        user_name: options.user_name || 'Guest',
        is_owner: options.is_owner || false,
        exp: options.exp || Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours from now
      },
    };

    const response = await fetch(`${DAILY_API_BASE_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify(tokenConfig),
    });

    if (!response.ok) {
      throw new Error(`Failed to create meeting token: ${response.status} ${response.statusText}`);
    }

    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('Failed to create meeting token:', error);
    throw error;
  }
};

// Utility function to validate room URL
export const isValidDailyRoomUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('daily.co');
  } catch {
    return false;
  }
};

// Extract room name from Daily.co URL
export const extractRoomNameFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
};

// Generate a unique room name for Meetopia
export const generateRoomName = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `meetopia-${timestamp}-${random}`;
};

export default {
  createDailyRoom,
  deleteDailyRoom,
  getDailyRoom,
  createMeetingToken,
  isValidDailyRoomUrl,
  extractRoomNameFromUrl,
  generateRoomName,
}; 