import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import ChatService, {Message, TypingIndicator} from '../services/ChatService';

interface ChatScreenProps {
  route: any;
  navigation: any;
}

const {width} = Dimensions.get('window');

const ChatScreen: React.FC<ChatScreenProps> = ({route, navigation}) => {
  const {roomId, roomName, participantName} = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initializeChat();
    loadStoredMessages();
    setupEventListeners();

    return () => {
      ChatService.leaveRoom(roomId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set navigation title
    navigation.setOptions({
      title: roomName || participantName || 'Chat',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            // TODO: Navigate to video call
            navigation.navigate('VideoCall', {
              roomId: roomId,
              type: 'join',
            });
          }}>
          <Text style={styles.headerButtonText}>📹</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, roomName, participantName, roomId]);

  const initializeChat = async () => {
    try {
      const userId = `user_${Date.now()}`;
      const userName = 'You'; // TODO: Get from user context
      
      // TODO: Replace with your actual socket server URL
      const socketUrl = 'ws://localhost:3001';
      
      await ChatService.initialize(socketUrl, userId, userName);
      await ChatService.joinRoom(roomId);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Connection Error', 'Failed to connect to chat server');
    }
  };

  const loadStoredMessages = async () => {
    try {
      const storedMessages = await ChatService.getMessagesFromStorage(roomId);
      setMessages(storedMessages);
      
      // Scroll to bottom after loading messages
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error loading stored messages:', error);
    }
  };

  const setupEventListeners = () => {
    ChatService.onConnectionStateChanged((connected) => {
      setIsConnected(connected);
    });

    ChatService.onMessageReceived((message) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    ChatService.onMessageSent((message) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    ChatService.onTypingStart((typing) => {
      if (typing.roomId === roomId) {
        setTypingUsers(prev => {
          const exists = prev.some(t => t.userId === typing.userId);
          return exists ? prev : [...prev, typing];
        });
      }
    });

    ChatService.onTypingStop((userId, roomId) => {
      if (roomId === roomId) {
        setTypingUsers(prev => prev.filter(t => t.userId !== userId));
      }
    });

    ChatService.onError((error) => {
      Alert.alert('Chat Error', error);
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !isConnected) return;

    try {
      await ChatService.sendMessage(roomId, inputText.trim());
      setInputText('');
      ChatService.stopTyping(roomId);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const sendQuickMessage = async (message: string) => {
    try {
      await ChatService.sendMessage(roomId, message, 'text');
      setShowQuickMessages(false);
    } catch (error) {
      console.error('Error sending quick message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const sendEmoji = async (emoji: string) => {
    try {
      await ChatService.sendMessage(roomId, emoji, 'emoji');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending emoji:', error);
      Alert.alert('Error', 'Failed to send emoji');
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    
    // Handle typing indicators
    if (text.length > 0 && isConnected) {
      ChatService.startTyping(roomId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        ChatService.stopTyping(roomId);
      }, 2000);
    } else {
      ChatService.stopTyping(roomId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  const renderMessage = ({item, index}: {item: Message; index: number}) => {
    const isOwnMessage = item.senderId === ChatService.getCurrentUserId();
    const showDate = index === 0 || 
      formatDate(item.timestamp) !== formatDate(messages[index - 1].timestamp);

    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          
          <View style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
            item.type === 'emoji' && styles.emojiBubble
          ]}>
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              item.type === 'emoji' && styles.emojiText
            ]}>
              {item.content}
            </Text>
          </View>
          
          <Text style={[
            styles.timeText,
            isOwnMessage ? styles.ownTimeText : styles.otherTimeText
          ]}>
            {formatTime(item.timestamp)}
            {isOwnMessage && item.isRead && <Text> ✓✓</Text>}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText = typingUsers.length === 1
      ? `${typingUsers[0].userName} is typing...`
      : `${typingUsers.length} people are typing...`;

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  };

  const renderQuickMessages = () => {
    if (!showQuickMessages) return null;

    return (
      <View style={styles.quickMessagesContainer}>
        <FlatList
          horizontal
          data={ChatService.getQuickMessages()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.quickMessageButton}
              onPress={() => sendQuickMessage(item)}>
              <Text style={styles.quickMessageText}>{item}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderEmojiPicker = () => {
    if (!showEmojiPicker) return null;

    return (
      <View style={styles.emojiPickerContainer}>
        <FlatList
          horizontal
          data={ChatService.getEmojiReactions()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => sendEmoji(item)}>
              <Text style={styles.emojiButtonText}>{item}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    headerButton: {
      marginRight: 15,
      padding: 5,
    },
    headerButtonText: {
      fontSize: 20,
    },
    messagesContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    dateContainer: {
      alignItems: 'center',
      marginVertical: 10,
    },
    dateText: {
      color: '#6b7280',
      fontSize: 12,
      fontWeight: '500',
      backgroundColor: '#f3f4f6',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    messageContainer: {
      marginVertical: 4,
      maxWidth: width * 0.8,
    },
    ownMessage: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },
    senderName: {
      fontSize: 12,
      color: '#6b7280',
      marginBottom: 2,
      marginLeft: 12,
    },
    messageBubble: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      maxWidth: '100%',
    },
    ownBubble: {
      backgroundColor: '#6366f1',
    },
    otherBubble: {
      backgroundColor: '#f3f4f6',
    },
    emojiBubble: {
      backgroundColor: 'transparent',
      paddingHorizontal: 8,
      paddingVertical: 4,
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
    emojiText: {
      fontSize: 24,
    },
    timeText: {
      fontSize: 11,
      marginTop: 2,
      marginHorizontal: 12,
    },
    ownTimeText: {
      color: '#9ca3af',
    },
    otherTimeText: {
      color: '#6b7280',
    },
    typingContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    typingText: {
      fontSize: 14,
      color: '#6b7280',
      fontStyle: 'italic',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 8,
      maxHeight: 100,
      fontSize: 16,
    },
    inputButton: {
      padding: 8,
      marginHorizontal: 4,
    },
    inputButtonText: {
      fontSize: 20,
    },
    sendButton: {
      backgroundColor: '#6366f1',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: '#d1d5db',
    },
    sendButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    quickMessagesContainer: {
      backgroundColor: '#f9fafb',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    quickMessageButton: {
      backgroundColor: '#ffffff',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    quickMessageText: {
      fontSize: 14,
      color: '#374151',
    },
    emojiPickerContainer: {
      backgroundColor: '#f9fafb',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    emojiButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      marginHorizontal: 4,
    },
    emojiButtonText: {
      fontSize: 24,
    },
    connectionStatus: {
      backgroundColor: isConnected ? '#10b981' : '#ef4444',
      paddingVertical: 4,
      alignItems: 'center',
    },
    connectionStatusText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          style={styles.messagesContainer}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        {/* Quick Messages */}
        {renderQuickMessages()}

        {/* Emoji Picker */}
        {renderEmojiPicker()}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => {
              setShowQuickMessages(!showQuickMessages);
              setShowEmojiPicker(false);
            }}>
            <Text style={styles.inputButtonText}>💬</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowQuickMessages(false);
            }}>
            <Text style={styles.inputButtonText}>😊</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || !isConnected) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || !isConnected}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen; 