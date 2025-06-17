import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  isRead: boolean;
  replyTo?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  avatar?: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface ChatContextType {
  // Chat rooms
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  
  // Messages
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  
  // Typing indicators
  typingUsers: TypingUser[];
  
  // Actions
  createRoom: (name: string, type: 'direct' | 'group', participants: string[]) => Promise<string>;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  sendTypingIndicator: () => void;
  markMessagesAsRead: (roomId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // File sharing
  sendImage: (imageUri: string) => Promise<void>;
  sendFile: (fileUri: string, fileName: string) => Promise<void>;
  
  // Search
  searchMessages: (query: string) => ChatMessage[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, updateStats } = useAuth();
  
  // State
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Load chat rooms on mount
  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
  }, [user]);

  // Clean up typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(typing => now - typing.timestamp < 3000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadChatRooms = async () => {
    try {
      const storedRooms = await AsyncStorage.getItem(`chat_rooms_${user?.id}`);
      if (storedRooms) {
        setChatRooms(JSON.parse(storedRooms));
      } else {
        // Create demo rooms for new users
        const demoRooms = await createDemoRooms();
        setChatRooms(demoRooms);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const createDemoRooms = async (): Promise<ChatRoom[]> => {
    if (!user) return [];

    const demoRooms: ChatRoom[] = [
      {
        id: 'general',
        name: 'General Chat',
        type: 'group',
        participants: [user.id, 'demo_user_1', 'demo_user_2'],
        unreadCount: 3,
        createdAt: new Date().toISOString(),
        lastMessage: {
          id: 'demo_msg_1',
          senderId: 'demo_user_1',
          senderName: 'Demo User',
          content: 'Welcome to Meetopia! 👋',
          type: 'text',
          timestamp: new Date().toISOString(),
          isRead: false,
        },
      },
      {
        id: 'meetopia_support',
        name: 'Meetopia Support',
        type: 'direct',
        participants: [user.id, 'support_bot'],
        unreadCount: 1,
        createdAt: new Date().toISOString(),
        lastMessage: {
          id: 'support_msg_1',
          senderId: 'support_bot',
          senderName: 'Support Bot',
          content: 'Hi! How can I help you today?',
          type: 'text',
          timestamp: new Date().toISOString(),
          isRead: false,
        },
      },
    ];

    await AsyncStorage.setItem(`chat_rooms_${user.id}`, JSON.stringify(demoRooms));
    return demoRooms;
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateRoomId = () => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createRoom = async (name: string, type: 'direct' | 'group', participants: string[]): Promise<string> => {
    if (!user) throw new Error('User must be authenticated');

    const roomId = generateRoomId();
    const newRoom: ChatRoom = {
      id: roomId,
      name,
      type,
      participants: [user.id, ...participants],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedRooms = [...chatRooms, newRoom];
    setChatRooms(updatedRooms);
    
    await AsyncStorage.setItem(`chat_rooms_${user.id}`, JSON.stringify(updatedRooms));
    
    return roomId;
  };

  const joinRoom = async (roomId: string): Promise<boolean> => {
    try {
      const room = chatRooms.find(r => r.id === roomId);
      if (!room) return false;

      setCurrentRoom(room);
      setIsLoadingMessages(true);
      
      // Load messages for this room
      const messages = await loadMessages(roomId);
      setMessages(messages);
      
      // Mark messages as read
      await markMessagesAsRead(roomId);
      
      setIsLoadingMessages(false);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      setIsLoadingMessages(false);
      return false;
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers([]);
  };

  const loadMessages = async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const storedMessages = await AsyncStorage.getItem(`messages_${roomId}`);
      if (storedMessages) {
        return JSON.parse(storedMessages);
      } else {
        // Create demo messages for demo rooms
        const demoMessages = createDemoMessages(roomId);
        await AsyncStorage.setItem(`messages_${roomId}`, JSON.stringify(demoMessages));
        return demoMessages;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  const createDemoMessages = (roomId: string): ChatMessage[] => {
    if (!user) return [];

    const baseMessages: ChatMessage[] = [];

    if (roomId === 'general') {
      baseMessages.push(
        {
          id: 'demo_msg_1',
          senderId: 'demo_user_1',
          senderName: 'Alex Chen',
          content: 'Welcome to Meetopia! 👋',
          type: 'text',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
        },
        {
          id: 'demo_msg_2',
          senderId: 'demo_user_2',
          senderName: 'Sarah Johnson',
          content: 'Great to have you here! This is where we chat and connect.',
          type: 'text',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          isRead: false,
        },
        {
          id: 'demo_msg_3',
          senderId: 'demo_user_1',
          senderName: 'Alex Chen',
          content: 'Feel free to start a video call anytime! 📹',
          type: 'text',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isRead: false,
        }
      );
    } else if (roomId === 'meetopia_support') {
      baseMessages.push(
        {
          id: 'support_msg_1',
          senderId: 'support_bot',
          senderName: 'Meetopia Support',
          content: 'Hi! How can I help you today?',
          type: 'text',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isRead: false,
        },
        {
          id: 'support_msg_2',
          senderId: 'support_bot',
          senderName: 'Meetopia Support',
          content: 'You can ask me about:\n• Video calling\n• Profile setup\n• Chat features\n• Technical issues',
          type: 'text',
          timestamp: new Date(Date.now() - 1700000).toISOString(),
          isRead: false,
        }
      );
    }

    return baseMessages;
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<void> => {
    if (!user || !currentRoom || !content.trim()) return;

    const newMessage: ChatMessage = {
      id: generateMessageId(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: content.trim(),
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Add message to current messages
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    // Save messages
    await AsyncStorage.setItem(`messages_${currentRoom.id}`, JSON.stringify(updatedMessages));

    // Update room's last message
    const updatedRoom = {
      ...currentRoom,
      lastMessage: newMessage,
    };

    const updatedRooms = chatRooms.map(room => 
      room.id === currentRoom.id ? updatedRoom : room
    );
    setChatRooms(updatedRooms);
    setCurrentRoom(updatedRoom);

    await AsyncStorage.setItem(`chat_rooms_${user.id}`, JSON.stringify(updatedRooms));

    // Update user stats
    await updateStats('messages', 1);

    // Simulate bot responses for demo
    if (currentRoom.id === 'meetopia_support') {
      setTimeout(() => {
        simulateBotResponse(content);
      }, 1000);
    } else if (currentRoom.id === 'general') {
      setTimeout(() => {
        simulateGroupResponse();
      }, 2000);
    }
  };

  const simulateBotResponse = async (userMessage: string) => {
    if (!currentRoom) return;

    let botResponse = "Thanks for your message! I'm here to help.";
    
    if (userMessage.toLowerCase().includes('video')) {
      botResponse = "For video calling, go to the Video Call tab and tap 'Start New Call' or 'Join Call' with a room ID!";
    } else if (userMessage.toLowerCase().includes('profile')) {
      botResponse = "You can edit your profile by going to the Profile tab and tapping 'Edit Profile'. Don't forget to add a photo!";
    } else if (userMessage.toLowerCase().includes('chat')) {
      botResponse = "You're already using the chat feature! You can create new rooms, send messages, and even share images.";
    }

    const botMessage: ChatMessage = {
      id: generateMessageId(),
      senderId: 'support_bot',
      senderName: 'Meetopia Support',
      content: botResponse,
      type: 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updatedMessages = [...messages, botMessage];
    setMessages(updatedMessages);
    await AsyncStorage.setItem(`messages_${currentRoom.id}`, JSON.stringify(updatedMessages));
  };

  const simulateGroupResponse = async () => {
    if (!currentRoom) return;

    const responses = [
      { sender: 'Alex Chen', message: "That's interesting! 🤔" },
      { sender: 'Sarah Johnson', message: "I agree! Thanks for sharing." },
      { sender: 'Alex Chen', message: "Let's hop on a video call later!" },
      { sender: 'Sarah Johnson', message: "Sounds good! 👍" },
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const groupMessage: ChatMessage = {
      id: generateMessageId(),
      senderId: randomResponse.sender === 'Alex Chen' ? 'demo_user_1' : 'demo_user_2',
      senderName: randomResponse.sender,
      content: randomResponse.message,
      type: 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updatedMessages = [...messages, groupMessage];
    setMessages(updatedMessages);
    await AsyncStorage.setItem(`messages_${currentRoom.id}`, JSON.stringify(updatedMessages));
  };

  const sendTypingIndicator = () => {
    if (!user) return;

    // Add typing indicator (in real app, this would be sent via WebSocket)
    const typingUser: TypingUser = {
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
    };

    setTypingUsers(prev => {
      const filtered = prev.filter(t => t.userId !== user.id);
      return [...filtered, typingUser];
    });
  };

  const markMessagesAsRead = async (roomId: string): Promise<void> => {
    try {
      const storedMessages = await AsyncStorage.getItem(`messages_${roomId}`);
      if (storedMessages) {
        const messages: ChatMessage[] = JSON.parse(storedMessages);
        const updatedMessages = messages.map(msg => ({ ...msg, isRead: true }));
        await AsyncStorage.setItem(`messages_${roomId}`, JSON.stringify(updatedMessages));
        
        if (currentRoom?.id === roomId) {
          setMessages(updatedMessages);
        }
      }

      // Update room unread count
      const updatedRooms = chatRooms.map(room => 
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      );
      setChatRooms(updatedRooms);
      await AsyncStorage.setItem(`chat_rooms_${user?.id}`, JSON.stringify(updatedRooms));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    if (!currentRoom) return;

    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    await AsyncStorage.setItem(`messages_${currentRoom.id}`, JSON.stringify(updatedMessages));
  };

  const sendImage = async (imageUri: string): Promise<void> => {
    await sendMessage(imageUri, 'image');
  };

  const sendFile = async (fileUri: string, fileName: string): Promise<void> => {
    await sendMessage(`${fileName}|${fileUri}`, 'file');
  };

  const searchMessages = (query: string): ChatMessage[] => {
    if (!query.trim()) return [];
    
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(query.toLowerCase())
    );
  };

  const value: ChatContextType = {
    // Chat rooms
    chatRooms,
    currentRoom,
    
    // Messages
    messages,
    isLoadingMessages,
    
    // Typing indicators
    typingUsers,
    
    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    deleteMessage,
    
    // File sharing
    sendImage,
    sendFile,
    
    // Search
    searchMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 