import React, { useEffect, useRef } from 'react';
import { FaUser, FaEllipsisV, FaCircle } from 'react-icons/fa';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ conversation, messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-500" size={16} />
            </div>
            {/* Online status indicator */}
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-gray-900 text-base font-medium">
                {conversation.name}
              </h3>
              {conversation.isOnline && (
                <span className="ml-2 text-xs text-green-600 font-medium">Online</span>
              )}
            </div>
            <p className="text-gray-500 text-xs">
              {conversation.userType === 'worker' ? 'Service Provider' : 'Client'}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button className="text-gray-500 hover:text-gray-700 transition-colors p-2">
            <FaEllipsisV size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const isMine = message.senderId === currentUser?.id;
            const nextMessage = messages[index + 1];
            const showTimestamp = !nextMessage || nextMessage.senderId !== message.senderId;

            return (
              <div key={message.id} className="mb-2">
                <MessageBubble
                  message={message}
                  isMine={isMine}
                  isSeen={message.isSeen}
                  isRead={message.isRead}
                />
                {showTimestamp && (
                  <div className="text-center my-4">
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {new Date(message.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;