// SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within an SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id
        }
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);

        // Authenticate user
        newSocket.emit('authenticate', { userId: user.id });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Online status events
      newSocket.on('userOnline', ({ userId }) => {
        console.log(`User ${userId} came online`);
        setOnlineUsers(prev => new Set(prev).add(userId));
      });

      newSocket.on('userOffline', ({ userId }) => {
        console.log(`User ${userId} went offline`);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      // Message events
      newSocket.on('new_message', (data) => {
        console.log('New message received:', data);
        // Emit custom event for components to listen to
        window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
      });

      newSocket.on('message_sent', (data) => {
        console.log('Message sent confirmation:', data);
        window.dispatchEvent(new CustomEvent('messageSent', { detail: data }));
      });

      newSocket.on('message_error', (data) => {
        console.error('Message error:', data);
        window.dispatchEvent(new CustomEvent('messageError', { detail: data }));
      });

      newSocket.on('message_read', (data) => {
        console.log('Message read:', data);
        window.dispatchEvent(new CustomEvent('messageRead', { detail: data }));
      });

      newSocket.on('messages_seen', (data) => {
        console.log('Messages seen:', data);
        window.dispatchEvent(new CustomEvent('messagesSeen', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
    }
  }, [user]);

  const sendMessage = (receiverId, content) => {
    if (socket && isConnected) {
      socket.emit('private_message', { receiverId, content });
    } else {
      console.error('Socket not connected');
    }
  };

  const markAsRead = (messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_as_read', { messageId });
    } else {
      console.error('Socket not connected');
    }
  };

  const markAsSeen = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('mark_as_seen', { conversationId });
    } else {
      console.error('Socket not connected');
    }
  };

  const sendTypingStatus = (receiverId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', { receiverId, isTyping });
    } else {
      console.error('Socket not connected');
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const authenticate = (userData) => {
    if (socket && isConnected) {
      socket.emit('authenticate', userData);
    } else {
      console.error('Socket not connected for authentication');
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    markAsRead,
    markAsSeen,
    sendTypingStatus,
    isUserOnline,
    authenticate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};