import React from 'react';
import { FaUser, FaSearch, FaCircle } from 'react-icons/fa';

const MessageList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  searchTerm, 
  onSearchChange,
  unreadCount,
  isMobile = false
}) => {
  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString();
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'w-full md:w-1/3'} bg-white flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaSearch size={14} />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 placeholder-gray-500 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
            <FaUser size={48} className="mb-4" />
            <p className="text-center">No conversations yet</p>
            <p className="text-sm text-center mt-2">Connect with service providers and clients</p>
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-gray-500" size={16} />
                  </div>
                  {/* Online status indicator */}
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <h3 className="text-gray-900 text-sm font-medium truncate">
                        {conversation.name}
                      </h3>
                      {conversation.isOnline && (
                        <span className="ml-2 text-xs text-green-600 font-medium flex items-center">
                          <FaCircle size={8} className="mr-1" /> Online
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs">
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm truncate flex-1">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center">
                      {conversation.unread > 0 && (
                        <div className="bg-[#0A66C2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2 flex-shrink-0">
                          {conversation.unread > 99 ? '99+' : conversation.unread}
                        </div>
                      )}
                      {/* Add seen indicator */}
                      {conversation.lastMessageSeen && (
                        <div className="w-2 h-2 bg-gray-400 rounded-full ml-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageList;