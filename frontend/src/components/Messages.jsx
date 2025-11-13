import React, { useState, useEffect, useRef, useCallback } from 'react';
import { textContent } from '../constants';
import { FaComments, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-toastify';
import MessageList from './Messages/MessageList';
import ChatWindow from './Messages/ChatWindow';
import MessageInput from './Messages/MessageInput';
import ConversationStarter from './Messages/ConversationStarter';

const Messages = () => {
  const { user } = useAuth();
  const { sendMessage, isConnected, markAsSeen, socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConversationStarter, setShowConversationStarter] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [existingConversations, setExistingConversations] = useState(new Set());

  // Load conversations function wrapped in useCallback to prevent unnecessary re-renders
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log('Conversations loaded successfully:', data.data.conversations.length);
        
        // Transform backend data to frontend format
        const transformedConversations = data.data.conversations.map(conv => ({
          id: conv.conversationId,
          name: conv.otherUser.name,
          userType: conv.otherUser.userType,
          lastMessage: conv.lastMessage.content,
          timestamp: conv.lastMessage.createdAt,
          unread: conv.unreadCount,
          otherUserId: conv.otherUser.id,
          lastMessageSeen: conv.lastMessageSeen || false
        }));

        setConversations(transformedConversations);
        
        // Store existing conversation IDs
        const existingIds = new Set(transformedConversations.map(conv => conv.otherUserId));
        setExistingConversations(existingIds);
      } else {
        console.error('Failed to load conversations:', data.message);
        toast.error(data.message || 'Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if we have a recipient from navigation state
  useEffect(() => {
    if (location.state && location.state.recipientId) {
      const recipientId = location.state.recipientId;
      setRecipient({
        id: recipientId,
        name: location.state.recipientName
      });
      
      // Check if conversation already exists
      const conversationExists = conversations.some(conv => 
        conv.otherUserId === recipientId
      );
      
      if (!conversationExists && location.state.startConversation) {
        setSuggestions(location.state.suggestions || [
          "Hi, I'm interested in your services.",
          "Hello, I'd like to know more about your skills.",
          "Hi, can you tell me about your availability?",
          "Hello, I have a project that might be a good fit for your skills."
        ]);
        setShowConversationStarter(true);
      } else if (conversationExists) {
        // If conversation exists, select it
        const existingConv = conversations.find(conv => conv.otherUserId === recipientId);
        if (existingConv) {
          handleSelectConversation(existingConv);
        }
      }
    }
  }, [location.state, conversations]);

  // Load conversations and messages
  useEffect(() => {
    if (user) {
      loadConversations();
      fetchUnreadCount();
    }
  }, [user, loadConversations]);

  // Add this useEffect to mark messages as seen when a conversation is selected
  useEffect(() => {
    const markMessagesAsSeen = async () => {
      if (selectedConversation && user) {
        try {
          const token = localStorage.getItem('token');
          await fetch(`http://localhost:5000/api/messages/seen/${selectedConversation.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          // Also update the conversation in the local state to reflect seen status
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation.id 
                ? { ...conv, lastMessageSeen: true, unread: 0 } 
                : conv
            )
          );
        } catch (error) {
          console.error('Error marking messages as seen:', error);
        }
      }
    };

    markMessagesAsSeen();
  }, [selectedConversation, user]);

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { message, conversationId } = event.detail;

      // Add message to current conversation if it's the active one
      if (selectedConversation && selectedConversation.id === conversationId) {
        setMessages(prev => [...prev, message]);
        // Don't increment unread if this is the active conversation
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, lastMessage: message.content, timestamp: message.timestamp }
              : conv
          )
        );
      } else {
        // Update conversation list to show new message and increment unread
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, lastMessage: message.content, timestamp: message.timestamp, unread: (conv.unread || 0) + 1 }
              : conv
          )
        );
      }
      
      // Update unread count
      fetchUnreadCount();
    };

    const handleMessagesSeen = (event) => {
      const { conversationId } = event.detail;
      
      // Update the conversation in the local state to reflect seen status
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessageSeen: true, unread: 0 } 
            : conv
        )
      );
    };

    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('messagesSeen', handleMessagesSeen);

    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('messagesSeen', handleMessagesSeen);
    };
  }, [selectedConversation]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const loadConversationMessages = async (conversation) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/messages/conversation/${conversation.otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log('Messages loaded successfully:', data.data.messages.length);
        
        // Transform messages to frontend format
        const transformedMessages = data.data.messages.map(msg => ({
          id: msg._id,
          senderId: msg.sender._id,
          sender: msg.sender.name,
          content: msg.content,
          timestamp: msg.createdAt,
          isSeen: msg.isSeen,
          isRead: msg.isRead
        }));

        setSelectedConversation(conversation);
        setMessages(transformedMessages);
        setShowConversationStarter(false);
        
        // Update unread count
        fetchUnreadCount();
      } else {
        console.error('Failed to load messages:', data.message);
        toast.error(data.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleSelectConversation = async (conversation) => {
    await loadConversationMessages(conversation);
    
    // Mark messages as seen when conversation is selected
    if (socket && isConnected) {
      markAsSeen(conversation.id);
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
    setShowConversationStarter(false);
  };

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || !selectedConversation) return;

    try {
      // Create a temporary message for optimistic UI update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        sender: user.name,
        content: messageContent,
        timestamp: new Date().toISOString(),
        isTemp: true,
        isSeen: false,
        isRead: false
      };

      // Add to messages immediately for better UX
      setMessages(prev => [...prev, tempMessage]);

      // Try real-time sending first
      if (isConnected) {
        sendMessage(selectedConversation.otherUserId, messageContent);
      } else {
        // Fallback to HTTP API
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiver: selectedConversation.otherUserId,
            content: messageContent,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log('Message sent successfully:', data.data.message._id);
          
          // Replace the temporary message with the real one
          const newMessage = {
            id: data.data.message._id,
            senderId: data.data.message.sender._id,
            sender: data.data.message.sender.name,
            content: data.data.message.content,
            timestamp: data.data.message.createdAt,
            isSeen: false,
            isRead: false
          };

          // Replace the temporary message with the real one
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempMessage.id ? newMessage : msg
            )
          );

          // Update conversation in list
          const updatedConversation = {
            ...selectedConversation,
            lastMessage: messageContent,
            timestamp: new Date().toISOString()
          };

          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversation.id ? updatedConversation : conv
            )
          );

          // Refresh conversations to get updated data
          await loadConversations();
        } else {
          // Remove the temporary message if sending failed
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
          console.error('Failed to send message:', data.message);
          toast.error(data.message || 'Failed to send message');
        }
      }
    } catch (error) {
      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => !msg.isTemp));
      console.error('Error sending message:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleStartConversation = async (message) => {
    if (!recipient || !message.trim()) return;

    try {
      // Create a temporary conversation object
      const newConversation = {
        id: `new-${Date.now()}`,
        name: recipient.name,
        userType: 'worker', // Default, will be updated when we load the conversation
        lastMessage: message,
        timestamp: new Date().toISOString(),
        unread: 0,
        otherUserId: recipient.id
      };

      setSelectedConversation(newConversation);
      setShowConversationStarter(false);
      
      // Create a temporary message for optimistic UI update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        sender: user.name,
        content: message,
        timestamp: new Date().toISOString(),
        isTemp: true,
        isSeen: false,
        isRead: false
      };

      // Add to messages immediately for better UX
      setMessages([tempMessage]);
      
      // Send the message
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: recipient.id,
          content: message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Message sent successfully:', data.data.message._id);
        
        // Replace the temporary message with the real one
        const newMessage = {
          id: data.data.message._id,
          senderId: data.data.message.sender._id,
          sender: data.data.message.sender.name,
          content: data.data.message.content,
          timestamp: data.data.message.createdAt,
          isSeen: false,
          isRead: false
        };

        // Replace the temporary message with the real one
        setMessages([newMessage]);

        // Update the conversation with the real ID from the backend
        const updatedConversation = {
          ...newConversation,
          id: data.data.message.conversationId // Use the conversationId from the message
        };

        setSelectedConversation(updatedConversation);

        // Add the conversation to the list
        setConversations(prev => [updatedConversation, ...prev]);
        
        // Add to existing conversations
        setExistingConversations(prev => new Set(prev).add(recipient.id));
      } else {
        // Remove the temporary message if sending failed
        setMessages([]);
        console.error('Failed to send message:', data.message);
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      // Remove the temporary message if sending failed
      setMessages([]);
      console.error('Error starting conversation:', error);
      toast.error('Network error. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {textContent.messages.title}
            </h1>
            <p className="text-xl text-gray-600">
              {textContent.messages.description}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <FaUser size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h3>
            <p className="text-gray-600">You need to be logged in to view your messages.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)]">
            <MessageList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              unreadCount={unreadCount}
            />

            <div className="flex-1 flex flex-col min-h-0 border-l border-gray-200">
              {showConversationStarter ? (
                <ConversationStarter
                  recipient={recipient}
                  suggestions={suggestions}
                  onStartConversation={handleStartConversation}
                  onCancel={() => {
                    setShowConversationStarter(false);
                    setRecipient(null);
                  }}
                />
              ) : (
                <>
                  {selectedConversation ? (
                    <>
                      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
                        <button
                          onClick={handleBackToConversations}
                          className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                        >
                          <FaArrowLeft size={16} />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedConversation.name}
                        </h2>
                      </div>
                      <ChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        currentUser={user}
                      />
                      <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={loading}
                      />
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                      <div className="text-center p-8 max-w-md">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <FaComments className="text-gray-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
                        <p className="text-gray-600">
                          Choose a conversation from the list or start a new one by clicking on a user's profile.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;