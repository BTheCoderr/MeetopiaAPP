// Jitsi Meet Integration Service
// Free, open-source video conferencing that scales to 50+ participants

import { useState } from 'react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export interface JitsiRoom {
  roomName: string;
  domain: string;
  url: string;
  options: JitsiMeetOptions;
}

export interface JitsiMeetOptions {
  roomName: string;
  width?: string | number;
  height?: string | number;
  parentNode?: HTMLElement;
  configOverwrite?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableWelcomePage?: boolean;
    prejoinPageEnabled?: boolean;
    toolbarButtons?: string[];
  };
  interfaceConfigOverwrite?: {
    TOOLBAR_BUTTONS?: string[];
    SETTINGS_SECTIONS?: string[];
    SHOW_JITSI_WATERMARK?: boolean;
    SHOW_WATERMARK_FOR_GUESTS?: boolean;
    SHOW_BRAND_WATERMARK?: boolean;
    BRAND_WATERMARK_LINK?: string;
    DEFAULT_BACKGROUND?: string;
  };
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

export interface CreateRoomOptions {
  roomName?: string;
  displayName?: string;
  domain?: string;
  moderatorPassword?: string;
  guestPassword?: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  enableChat?: boolean;
  enableScreenSharing?: boolean;
  maxParticipants?: number;
}

// JITSI MEET SERVICE
class JitsiService {
  private defaultDomain = 'meet.jit.si'; // Free Jitsi server
  private api: any = null;
  private isScriptLoaded = false;

  constructor() {
    console.log('🎥 Jitsi Meet Service initialized');
  }

  // Load Jitsi Meet External API script
  async loadJitsiScript(): Promise<void> {
    if (this.isScriptLoaded || typeof window === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      
      script.onload = () => {
        this.isScriptLoaded = true;
        console.log('✅ Jitsi Meet External API loaded');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Jitsi Meet External API');
        reject(new Error('Failed to load Jitsi Meet script'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Create a Jitsi Meet room
  async createRoom(options: CreateRoomOptions = {}): Promise<JitsiRoom> {
    try {
      const roomName = options.roomName || this.generateRoomName();
      const domain = options.domain || this.defaultDomain;
      
      const jitsiOptions: JitsiMeetOptions = {
        roomName,
        configOverwrite: {
          startWithAudioMuted: options.startWithAudioMuted ?? false,
          startWithVideoMuted: options.startWithVideoMuted ?? false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'e2ee'
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          DEFAULT_BACKGROUND: '#474747',
        },
        userInfo: {
          displayName: options.displayName || 'Anonymous User',
        },
      };

      const room: JitsiRoom = {
        roomName,
        domain,
        url: `https://${domain}/${roomName}`,
        options: jitsiOptions,
      };

      console.log('✅ Jitsi room created:', roomName);
      return room;

    } catch (error) {
      console.error('❌ Failed to create Jitsi room:', error);
      throw error;
    }
  }

  // Initialize Jitsi Meet in a container
  async initializeJitsiMeet(
    containerElement: HTMLElement,
    room: JitsiRoom,
    displayName?: string
  ): Promise<any> {
    try {
      await this.loadJitsiScript();

      if (!window.JitsiMeetExternalAPI) {
        throw new Error('Jitsi Meet External API not available');
      }

      // Dispose existing API if any
      if (this.api) {
        this.api.dispose();
      }

      const options = {
        ...room.options,
        parentNode: containerElement,
        width: '100%',
        height: '100%',
        userInfo: {
          ...room.options.userInfo,
          displayName: displayName || room.options.userInfo?.displayName || 'Anonymous User',
        },
      };

      this.api = new window.JitsiMeetExternalAPI(room.domain, options);

      // Set up event listeners
      this.setupEventListeners();

      console.log('✅ Jitsi Meet initialized for room:', room.roomName);
      return this.api;

    } catch (error) {
      console.error('❌ Failed to initialize Jitsi Meet:', error);
      throw error;
    }
  }

  // Set up event listeners for Jitsi Meet
  private setupEventListeners() {
    if (!this.api) return;

    this.api.addEventListener('videoConferenceJoined', (event: any) => {
      console.log('📹 Joined Jitsi meeting:', event);
    });

    this.api.addEventListener('videoConferenceLeft', (event: any) => {
      console.log('👋 Left Jitsi meeting:', event);
    });

    this.api.addEventListener('participantJoined', (event: any) => {
      console.log('👤 Participant joined:', event.displayName);
    });

    this.api.addEventListener('participantLeft', (event: any) => {
      console.log('👤 Participant left:', event.displayName);
    });

    this.api.addEventListener('readyToClose', () => {
      console.log('🔚 Jitsi Meet ready to close');
    });
  }

  // Get current participants
  getParticipants(): Promise<any[]> {
    if (!this.api) {
      return Promise.resolve([]);
    }
    return this.api.getParticipantsInfo();
  }

  // Mute/unmute audio
  toggleAudio(): void {
    if (this.api) {
      this.api.executeCommand('toggleAudio');
    }
  }

  // Mute/unmute video
  toggleVideo(): void {
    if (this.api) {
      this.api.executeCommand('toggleVideo');
    }
  }

  // Start screen sharing
  toggleScreenShare(): void {
    if (this.api) {
      this.api.executeCommand('toggleShareScreen');
    }
  }

  // Toggle chat
  toggleChat(): void {
    if (this.api) {
      this.api.executeCommand('toggleChat');
    }
  }

  // Hang up the call
  hangUp(): void {
    if (this.api) {
      this.api.executeCommand('hangup');
    }
  }

  // Dispose the API
  dispose(): void {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
  }

  // Generate a random room name
  private generateRoomName(): string {
    const adjectives = ['cool', 'awesome', 'amazing', 'fantastic', 'brilliant', 'super', 'mega'];
    const nouns = ['meeting', 'chat', 'room', 'space', 'hub', 'zone', 'place'];
    const randomNum = Math.floor(Math.random() * 10000);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `meetopia-${adjective}-${noun}-${randomNum}`;
  }

  // Get room URL for sharing
  getRoomUrl(roomName: string, domain?: string): string {
    const roomDomain = domain || this.defaultDomain;
    return `https://${roomDomain}/${roomName}`;
  }
}

// CLIENT-SIDE JITSI HELPERS
export const JitsiMeetHelpers = {
  // Create and join a meeting
  async createAndJoinMeeting(
    containerElement: HTMLElement,
    options: CreateRoomOptions = {}
  ) {
    try {
      const jitsiService = new JitsiService();
      const room = await jitsiService.createRoom(options);
      const api = await jitsiService.initializeJitsiMeet(
        containerElement,
        room,
        options.displayName
      );
      
      return { room, api, jitsiService };
    } catch (error) {
      console.error('❌ Failed to create and join Jitsi meeting:', error);
      throw error;
    }
  },

  // Join existing meeting
  async joinMeeting(
    containerElement: HTMLElement,
    roomName: string,
    displayName?: string,
    domain?: string
  ) {
    try {
      const jitsiService = new JitsiService();
      const room: JitsiRoom = {
        roomName,
        domain: domain || 'meet.jit.si',
        url: jitsiService.getRoomUrl(roomName, domain),
        options: {
          roomName,
          userInfo: {
            displayName: displayName || 'Anonymous User',
          },
        },
      };

      const api = await jitsiService.initializeJitsiMeet(
        containerElement,
        room,
        displayName
      );

      return { room, api, jitsiService };
    } catch (error) {
      console.error('❌ Failed to join Jitsi meeting:', error);
      throw error;
    }
  },
};

// React hook for Jitsi Meet
export const useJitsiMeet = () => {
  const [api, setApi] = useState<any>(null);
  const [room, setRoom] = useState<JitsiRoom | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  const createMeeting = async (
    containerElement: HTMLElement,
    options: CreateRoomOptions = {}
  ) => {
    try {
      const { room: newRoom, api: newApi } = await JitsiMeetHelpers.createAndJoinMeeting(
        containerElement,
        options
      );
      
      setRoom(newRoom);
      setApi(newApi);
      setIsJoined(true);

      // Update participants periodically
      const updateParticipants = async () => {
        if (newApi) {
          const currentParticipants = await newApi.getParticipantsInfo();
          setParticipants(currentParticipants);
        }
      };
      
      const interval = setInterval(updateParticipants, 5000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('❌ Failed to create meeting:', error);
      throw error;
    }
  };

  const joinMeeting = async (
    containerElement: HTMLElement,
    roomName: string,
    displayName?: string
  ) => {
    try {
      const { room: joinedRoom, api: joinedApi } = await JitsiMeetHelpers.joinMeeting(
        containerElement,
        roomName,
        displayName
      );
      
      setRoom(joinedRoom);
      setApi(joinedApi);
      setIsJoined(true);
    } catch (error) {
      console.error('❌ Failed to join meeting:', error);
      throw error;
    }
  };

  const leaveMeeting = () => {
    if (api) {
      api.dispose();
      setApi(null);
      setRoom(null);
      setParticipants([]);
      setIsJoined(false);
    }
  };

  return {
    api,
    room,
    participants,
    isJoined,
    createMeeting,
    joinMeeting,
    leaveMeeting,
  };
};

export const jitsiService = new JitsiService();
export default JitsiService; 