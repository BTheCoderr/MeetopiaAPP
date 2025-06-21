import io, {Socket} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'emoji' | 'system';
  isRead: boolean;
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'direct' | 'group' | 'match';
  createdAt: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  roomId: string;
}

class ChatService {
  private socket: Socket | null = null;
  private currentUserId: string = '';
  private currentUserName: string = '';
  private isConnected: boolean = false;

  // Callbacks
  private onMessageReceivedCallback?: (message: Message) => void;
  private onMessageSentCallback?: (message: Message) => void;
  private onTypingStartCallback?: (typing: TypingIndicator) => void;
  private onTypingStopCallback?: (userId: string, roomId: string) => void;
  private onUserJoinedCallback?: (userId: string, userName: string, roomId: string) => void;
  private onUserLeftCallback?: (userId: string, roomId: string) => void;
  private onConnectionStateChangedCallback?: (connected: boolean) => void;
  private onErrorCallback?: (error: string) => void;

  async initialize(socketUrl: string, userId: string, userName: string): Promise<void> {
    try {
      this.currentUserId = userId;
      this.currentUserName = userName;

      // Connect to chat server
      this.socket = io(socketUrl, {
        auth: {
          userId: userId,
          userName: userName,
        },
      });

      this.setupSocketListeners();

    } catch (error) {
      console.error('Error initializing chat service:', error);
      this.onErrorCallback?.('Failed to initialize chat service');
      throw error;
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
      this.onConnectionStateChangedCallback?.(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      this.isConnected = false;
      this.onConnectionStateChangedCallback?.(false);
    });

    this.socket.on('message', (data: any) => {
      const message: Message = {
        id: data.id,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.content,
        timestamp: new Date(data.timestamp),
        type: data.type || 'text',
        isRead: false,
        roomId: data.roomId,
      };

      this.onMessageReceivedCallback?.(message);
      this.saveMessageToStorage(message);
    });

    this.socket.on('message-sent', (data: any) => {
      const message: Message = {
        id: data.id,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.content,
        timestamp: new Date(data.timestamp),
        type: data.type || 'text',
        isRead: true,
        roomId: data.roomId,
      };

      this.onMessageSentCallback?.(message);
      this.saveMessageToStorage(message);
    });

    this.socket.on('typing-start', (data: {userId: string; userName: string; roomId: string}) => {
      if (data.userId !== this.currentUserId) {
        this.onTypingStartCallback?.(data);
      }
    });

    this.socket.on('typing-stop', (data: {userId: string; roomId: string}) => {
      if (data.userId !== this.currentUserId) {
        this.onTypingStopCallback?.(data.userId, data.roomId);
      }
    });

    this.socket.on('user-joined', (data: {userId: string; userName: string; roomId: string}) => {
      this.onUserJoinedCallback?.(data.userId, data.userName, data.roomId);
    });

    this.socket.on('user-left', (data: {userId: string; roomId: string}) => {
      this.onUserLeftCallback?.(data.userId, data.roomId);
    });

    this.socket.on('error', (error: string) => {
      console.error('Chat error:', error);
      this.onErrorCallback?.(error);
    });
  }

  // Message operations
  async sendMessage(roomId: string, content: string, type: 'text' | 'image' | 'emoji' = 'text'): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat server');
    }

    const messageData = {
      roomId,
      content,
      type,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      timestamp: new Date().toISOString(),
    };

    this.socket.emit('send-message', messageData);
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('join-room', {
      roomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('leave-room', {
      roomId,
      userId: this.currentUserId,
    });
  }

  // Typing indicators
  startTyping(roomId: string): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing-start', {
      roomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });
  }

  stopTyping(roomId: string): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing-stop', {
      roomId,
      userId: this.currentUserId,
    });
  }

  // Message management
  async markMessageAsRead(messageId: string, roomId: string): Promise<void> {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('mark-read', {
      messageId,
      roomId,
      userId: this.currentUserId,
    });
  }

  async markAllMessagesAsRead(roomId: string): Promise<void> {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('mark-all-read', {
      roomId,
      userId: this.currentUserId,
    });
  }

  // Local storage operations
  private async saveMessageToStorage(message: Message): Promise<void> {
    try {
      const key = `messages_${message.roomId}`;
      const existingMessages = await this.getMessagesFromStorage(message.roomId);
      
      // Check if message already exists
      const messageExists = existingMessages.some(m => m.id === message.id);
      if (!messageExists) {
        const updatedMessages = [...existingMessages, message].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
      }
    } catch (error) {
      console.error('Error saving message to storage:', error);
    }
  }

  async getMessagesFromStorage(roomId: string): Promise<Message[]> {
    try {
      const key = `messages_${roomId}`;
      const messagesJson = await AsyncStorage.getItem(key);
      
      if (messagesJson) {
        const messages = JSON.parse(messagesJson);
        return messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting messages from storage:', error);
      return [];
    }
  }

  async clearMessagesFromStorage(roomId: string): Promise<void> {
    try {
      const key = `messages_${roomId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing messages from storage:', error);
    }
  }

  // Room management
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const roomsJson = await AsyncStorage.getItem('chat_rooms');
      if (roomsJson) {
        const rooms = JSON.parse(roomsJson);
        return rooms.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          lastMessage: r.lastMessage ? {
            ...r.lastMessage,
            timestamp: new Date(r.lastMessage.timestamp),
          } : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      return [];
    }
  }

  async saveChatRoom(room: ChatRoom): Promise<void> {
    try {
      const existingRooms = await this.getChatRooms();
      const roomIndex = existingRooms.findIndex(r => r.id === room.id);
      
      if (roomIndex >= 0) {
        existingRooms[roomIndex] = room;
      } else {
        existingRooms.push(room);
      }
      
      await AsyncStorage.setItem('chat_rooms', JSON.stringify(existingRooms));
    } catch (error) {
      console.error('Error saving chat room:', error);
    }
  }

  // Event handlers
  onMessageReceived(callback: (message: Message) => void): void {
    this.onMessageReceivedCallback = callback;
  }

  onMessageSent(callback: (message: Message) => void): void {
    this.onMessageSentCallback = callback;
  }

  onTypingStart(callback: (typing: TypingIndicator) => void): void {
    this.onTypingStartCallback = callback;
  }

  onTypingStop(callback: (userId: string, roomId: string) => void): void {
    this.onTypingStopCallback = callback;
  }

  onUserJoined(callback: (userId: string, userName: string, roomId: string) => void): void {
    this.onUserJoinedCallback = callback;
  }

  onUserLeft(callback: (userId: string, roomId: string) => void): void {
    this.onUserLeftCallback = callback;
  }

  onConnectionStateChanged(callback: (connected: boolean) => void): void {
    this.onConnectionStateChangedCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  // Utility methods
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  getCurrentUserName(): string {
    return this.currentUserName;
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.currentUserId = '';
    this.currentUserName = '';
  }

  // Quick message templates
  getQuickMessages(): string[] {
    return [
      '👋 Hello!',
      '😊 Nice to meet you!',
      '💕 I like your profile',
      '☕ Want to grab coffee?',
      '🎬 Movie tonight?',
      '🍕 Dinner plans?',
      '😄 That\'s funny!',
      '👍 Sounds good!',
      '❤️ Love it!',
      '🤔 Let me think...',
    ];
  }

  // Emoji reactions
  getEmojiReactions(): string[] {
    return ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '💯', '🎉'];
  }
}

export default new ChatService(); 