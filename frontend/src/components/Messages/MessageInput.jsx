import React, { useState } from 'react';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white px-4 py-3 flex items-end space-x-3 border-t border-gray-200">
      <button className="text-gray-500 hover:text-gray-700 transition-colors p-2">
        <FaSmile size={20} />
      </button>

      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!message.trim() || disabled}
        onClick={handleSubmit}
        className="bg-[#0A66C2] text-white p-3 rounded-full hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A66C2]"
      >
        <FaPaperPlane size={16} />
      </button>
    </div>
  );
};

export default MessageInput;