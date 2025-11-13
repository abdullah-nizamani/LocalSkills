import React from 'react';

const MessageBubble = ({ message, isMine, isSeen, isRead }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine the status icon and tooltip based on message state
  const getStatusIcon = () => {
    if (!isMine) return null; // Only show status icons for messages sent by the current user
    
    if (isSeen) {
      return (
        <div className="flex items-center" title="Seen">
          <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4 text-blue-300 -ml-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (isRead) {
      return (
        <div className="flex items-center" title="Read">
          <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex items-center" title="Sent">
          <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v6a1 1 0 001 1h3a1 1 0 100-2h-2V6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className={`flex mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          isMine
            ? 'bg-[#0A66C2] text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1`}>
          <span className={`text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;