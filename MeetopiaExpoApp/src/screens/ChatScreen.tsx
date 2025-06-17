import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

interface ChatScreenProps {
  navigation: any;
}

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const { user } = useAuth();
  const {
    chatRooms,
    currentRoom,
    messages,
    isLoadingMessages,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    sendImage,
    createRoom,
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [showRoomList, setShowRoomList] = useState(!currentRoom);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (messageText.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText]);

  const handleJoinRoom = async (roomId: string) => {
    const success = await joinRoom(roomId);
    if (success) {
      setShowRoomList(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setShowRoomList(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');
    
    try {
      await sendMessage(text);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessageText(text); // Restore message on error
    }
  };

  const handleSendImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permissions to send images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await sendImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send image. Please try again.');
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name.');
      return;
    }

    try {
      await createRoom(newRoomName.trim(), 'group', []);
      setNewRoomName('');
      setShowCreateRoom(false);
      Alert.alert('Success!', 'Room created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create room. Please try again.');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item: message, index }: { item: any; index: number }) => {
    const isOwnMessage = message.senderId === user?.id;
    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.senderId !== message.senderId);

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {showAvatar && !isOwnMessage && (
          <View style={styles.avatarContainer}>
            {message.senderAvatar ? (
              <Image source={{ uri: message.senderAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {message.senderName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          !showAvatar && !isOwnMessage && styles.messageBubbleNoAvatar
        ]}>
          {!isOwnMessage && showAvatar && (
            <Text style={styles.senderName}>{message.senderName}</Text>
          )}
          
          {message.type === 'image' ? (
            <Image source={{ uri: message.content }} style={styles.messageImage} />
          ) : message.type === 'file' ? (
            <View style={styles.fileMessage}>
              <Text style={styles.fileIcon}>📎</Text>
              <Text style={styles.fileName}>
                {message.content.split('|')[0] || 'File'}
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {message.content}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    const otherTypingUsers = typingUsers.filter(t => t.userId !== user?.id);
    
    if (otherTypingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {otherTypingUsers.length === 1 
              ? `${otherTypingUsers[0].userName} is typing...`
              : `${otherTypingUsers.length} people are typing...`
            }
          </Text>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  // Create Room Modal
  const CreateRoomModal = () => (
    <Modal visible={showCreateRoom} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Room</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              setShowCreateRoom(false);
              setNewRoomName('');
            }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <Text style={styles.inputLabel}>Room Name</Text>
          <TextInput
            style={styles.input}
            value={newRoomName}
            onChangeText={setNewRoomName}
            placeholder="Enter room name"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
          />
          
          <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
            <Text style={styles.createButtonText}>Create Room</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // If not authenticated, show sign-in prompt
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>💬</Text>
            </View>
            <Text style={styles.title}>Chat & Connect</Text>
            <Text style={styles.subtitle}>
              Sign in to start chatting with people around the world
            </Text>
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.signInButtonText}>🔐 Sign In to Chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show room list
  if (showRoomList) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chat Rooms</Text>
            <TouchableOpacity 
              style={styles.createRoomButton}
              onPress={() => setShowCreateRoom(true)}
            >
              <Text style={styles.createRoomButtonText}>+ New</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={chatRooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item: room }) => (
              <TouchableOpacity
                style={styles.roomItem}
                onPress={() => handleJoinRoom(room.id)}
              >
                <View style={styles.roomAvatar}>
                  <Text style={styles.roomAvatarText}>
                    {room.type === 'group' ? '👥' : '💬'}
                  </Text>
                </View>
                
                <View style={styles.roomInfo}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    {room.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>{room.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  
                  {room.lastMessage && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {room.lastMessage.senderName}: {room.lastMessage.content}
                    </Text>
                  )}
                  
                  <Text style={styles.roomTime}>
                    {room.lastMessage ? formatTime(room.lastMessage.timestamp) : formatTime(room.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <CreateRoomModal />
      </SafeAreaView>
    );
  }

  // Show chat interface
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleLeaveRoom}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderTitle}>{currentRoom?.name}</Text>
            <Text style={styles.chatHeaderSubtitle}>
              {currentRoom?.participants.length} participants
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.videoCallButton}
            onPress={() => navigation.navigate('VideoCall')}
          >
            <Text style={styles.videoCallButtonText}>📹</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleSendImage}>
            <Text style={styles.attachButtonText}>📎</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.messageInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, messageText.trim() && styles.sendButtonActive]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Room list styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createRoomButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createRoomButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roomAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomAvatarText: {
    fontSize: 20,
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  roomTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  
  // Chat interface styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chatHeaderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  videoCallButton: {
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 8,
  },
  videoCallButtonText: {
    fontSize: 18,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleNoAvatar: {
    marginLeft: 40,
  },
  ownMessageBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 4,
  },
  fileIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  
  // Typing indicator
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typingText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginHorizontal: 1,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  
  // Input container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  attachButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 18,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#d1d5db',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonActive: {
    backgroundColor: '#6366f1',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    backgroundColor: '#1f2937',
    padding: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 