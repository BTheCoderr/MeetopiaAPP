import io, {Socket} from 'socket.io-client';

export interface VideoCallConfig {
  roomId: string;
  userId: string;
  isHost: boolean;
}

export interface CallParticipant {
  id: string;
  name: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

class VideoCallService {
  private socket: Socket | null = null;
  private roomId: string = '';
  private userId: string = '';
  private isHost: boolean = false;
  private isAudioEnabled: boolean = true;
  private isVideoEnabled: boolean = true;

  // Callbacks
  private onParticipantJoinedCallback?: (participant: CallParticipant) => void;
  private onParticipantLeftCallback?: (participantId: string) => void;
  private onCallEndedCallback?: () => void;
  private onErrorCallback?: (error: string) => void;
  private onConnectionStateChangedCallback?: (state: string) => void;

  async initializeCall(config: VideoCallConfig, socketUrl: string): Promise<void> {
    try {
      this.roomId = config.roomId;
      this.userId = config.userId;
      this.isHost = config.isHost;

      // Connect to signaling server
      this.socket = io(socketUrl);
      this.setupSocketListeners();

      // Join room
      this.socket.emit('join-room', {
        roomId: this.roomId,
        userId: this.userId,
        isHost: this.isHost,
      });

      this.onConnectionStateChangedCallback?.('connecting');

    } catch (error) {
      console.error('Error initializing call:', error);
      this.onErrorCallback?.('Failed to initialize call');
      throw error;
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.onConnectionStateChangedCallback?.('connected');
    });

    this.socket.on('user-joined', (data: {userId: string; name: string}) => {
      console.log('User joined:', data.userId);
      
      this.onParticipantJoinedCallback?.({
        id: data.userId,
        name: data.name,
        isAudioEnabled: true,
        isVideoEnabled: true,
      });
    });

    this.socket.on('user-left', (data: {userId: string}) => {
      console.log('User left:', data.userId);
      this.onParticipantLeftCallback?.(data.userId);
    });

    this.socket.on('call-ended', () => {
      this.onCallEndedCallback?.();
    });

    this.socket.on('audio-toggled', (data: {userId: string; enabled: boolean}) => {
      console.log(`User ${data.userId} ${data.enabled ? 'enabled' : 'disabled'} audio`);
    });

    this.socket.on('video-toggled', (data: {userId: string; enabled: boolean}) => {
      console.log(`User ${data.userId} ${data.enabled ? 'enabled' : 'disabled'} video`);
    });

    this.socket.on('error', (error: string) => {
      this.onErrorCallback?.(error);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.onConnectionStateChangedCallback?.('disconnected');
    });
  }

  // Media controls
  toggleAudio(): boolean {
    this.isAudioEnabled = !this.isAudioEnabled;
    
    if (this.socket) {
      this.socket.emit('toggle-audio', {
        roomId: this.roomId,
        userId: this.userId,
        enabled: this.isAudioEnabled,
      });
    }
    
    return this.isAudioEnabled;
  }

  toggleVideo(): boolean {
    this.isVideoEnabled = !this.isVideoEnabled;
    
    if (this.socket) {
      this.socket.emit('toggle-video', {
        roomId: this.roomId,
        userId: this.userId,
        enabled: this.isVideoEnabled,
      });
    }
    
    return this.isVideoEnabled;
  }

  async switchCamera(): Promise<void> {
    // TODO: Implement camera switching
    console.log('Camera switching requested');
    
    if (this.socket) {
      this.socket.emit('camera-switched', {
        roomId: this.roomId,
        userId: this.userId,
      });
    }
  }

  // Event handlers
  onParticipantJoined(callback: (participant: CallParticipant) => void): void {
    this.onParticipantJoinedCallback = callback;
  }

  onParticipantLeft(callback: (participantId: string) => void): void {
    this.onParticipantLeftCallback = callback;
  }

  onCallEnded(callback: () => void): void {
    this.onCallEndedCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  onConnectionStateChanged(callback: (state: string) => void): void {
    this.onConnectionStateChangedCallback = callback;
  }

  // Cleanup
  endCall(): void {
    if (this.socket) {
      this.socket.emit('leave-room', {
        roomId: this.roomId,
        userId: this.userId,
      });
      this.socket.disconnect();
      this.socket = null;
    }

    this.roomId = '';
    this.userId = '';
    this.isHost = false;
    this.isAudioEnabled = true;
    this.isVideoEnabled = true;
  }

  // Getters
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getAudioState(): boolean {
    return this.isAudioEnabled;
  }

  getVideoState(): boolean {
    return this.isVideoEnabled;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getUserId(): string {
    return this.userId;
  }

  getIsHost(): boolean {
    return this.isHost;
  }
}

export default new VideoCallService(); 