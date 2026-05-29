'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'peer';
  timestamp: number;
  read?: boolean;
  readAt?: number;
}

interface UseReadReceiptsProps {
  socket: Socket | null;
  currentPeer: string | null;
  messages: Message[];
  chatOpen?: boolean;
}

interface UseReadReceiptsResult {
  updatedMessages: Message[];
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
}

export function useReadReceipts({ 
  socket, 
  currentPeer, 
  messages,
  chatOpen = true,
}: UseReadReceiptsProps): UseReadReceiptsResult {
  const [updatedMessages, setUpdatedMessages] = useState<Message[]>(messages);
  const lastMarkedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    lastMarkedRef.current = new Set();
  }, [currentPeer]);

  useEffect(() => {
    setUpdatedMessages(prev => {
      const readMap = new Map(prev.map(m => [m.id, { read: m.read, readAt: m.readAt }]));
      return messages.map(m => ({
        ...m,
        read: readMap.get(m.id)?.read ?? m.read,
        readAt: readMap.get(m.id)?.readAt ?? m.readAt,
      }));
    });
  }, [messages]);
  
  useEffect(() => {
    if (!socket) return;
    
    const handleReadReceipt = (data: { messageIds: string[] }) => {
      const now = Date.now();
      setUpdatedMessages(prevMessages => 
        prevMessages.map(message => 
          data.messageIds.includes(message.id) && message.sender === 'me'
            ? { ...message, read: true, readAt: now }
            : message
        )
      );
    };
    
    socket.on('message-read', handleReadReceipt);
    
    return () => {
      socket.off('message-read', handleReadReceipt);
    };
  }, [socket]);
  
  const markAllAsRead = useCallback(() => {
    if (!socket || !currentPeer || !chatOpen) return;
    
    setUpdatedMessages(prevMessages => {
      const unreadPeerMessages = prevMessages
        .filter(m => m.sender === 'peer' && !m.read && !lastMarkedRef.current.has(m.id))
        .map(m => m.id);
        
      if (unreadPeerMessages.length === 0) return prevMessages;
      
      unreadPeerMessages.forEach(id => lastMarkedRef.current.add(id));
      
      socket.emit('mark-messages-read', {
        messageIds: unreadPeerMessages,
        to: currentPeer
      });
      
      return prevMessages.map(message => 
        unreadPeerMessages.includes(message.id)
          ? { ...message, read: true }
          : message
      );
    });
  }, [socket, currentPeer, chatOpen]);

  useEffect(() => {
    if (!socket || !currentPeer || !chatOpen) return;

    const unreadCount = updatedMessages.filter(
      m => m.sender === 'peer' && !m.read
    ).length;

    if (unreadCount === 0) return;

    const timeoutId = setTimeout(() => {
      markAllAsRead();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [socket, currentPeer, chatOpen, updatedMessages.length, markAllAsRead]);
  
  const markAsRead = useCallback((messageId: string) => {
    if (!socket || !currentPeer) return;
    if (lastMarkedRef.current.has(messageId)) return;
    
    lastMarkedRef.current.add(messageId);
    
    socket.emit('mark-messages-read', {
      messageIds: [messageId],
      to: currentPeer
    });
    
    setUpdatedMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === messageId
          ? { ...message, read: true }
          : message
      )
    );
  }, [socket, currentPeer]);
  
  return {
    updatedMessages,
    markAsRead,
    markAllAsRead
  };
}
