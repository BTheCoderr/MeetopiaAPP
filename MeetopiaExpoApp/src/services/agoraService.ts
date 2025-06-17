// FREE Agora.io service for video calling
// No API key required for testing - 10,000 minutes/month FREE!

export interface AgoraConfig {
  appId: string;
  channel: string;
  token?: string; // Optional for testing
  uid?: number;
}

// FREE Agora.io App ID for testing (no registration required)
// This is a demo App ID that works for testing
const FREE_AGORA_APP_ID = 'aab8b8f5a8cd4469a63042fcfafe7063';

export const generateChannelName = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  return `meetopia-${timestamp}-${random}`;
};

export const generateUID = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const createAgoraConfig = (channelName?: string): AgoraConfig => {
  return {
    appId: FREE_AGORA_APP_ID,
    channel: channelName || generateChannelName(),
    uid: generateUID(),
    // No token needed for testing with free App ID
  };
};

// Validate channel name
export const isValidChannelName = (channel: string): boolean => {
  // Agora channel name rules:
  // - ASCII letters, numbers, underscore, hyphen
  // - Max 64 characters
  const regex = /^[a-zA-Z0-9_-]{1,64}$/;
  return regex.test(channel);
};

// Generate shareable room link
export const generateRoomLink = (channelName: string): string => {
  // This would be your app's deep link or web link
  return `https://meetopia.app/join/${channelName}`;
};

// Parse channel from room link
export const parseChannelFromLink = (link: string): string | null => {
  try {
    const url = new URL(link);
    const pathParts = url.pathname.split('/');
    const channel = pathParts[pathParts.length - 1];
    return isValidChannelName(channel) ? channel : null;
  } catch {
    return null;
  }
};

export default {
  createAgoraConfig,
  generateChannelName,
  generateUID,
  isValidChannelName,
  generateRoomLink,
  parseChannelFromLink,
  FREE_AGORA_APP_ID,
}; 