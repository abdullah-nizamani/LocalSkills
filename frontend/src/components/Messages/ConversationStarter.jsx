import React, { useState } from 'react';
import { FaUser, FaTimes } from 'react-icons/fa';

const ConversationStarter = ({ recipient, suggestions, onStartConversation, onCancel }) => {
  const [selectedMessage, setSelectedMessage] = useState('');

  const handleSuggestionClick = (suggestion) => {
    setSelectedMessage(suggestion);
  };

  const handleSubmit = () => {
    if (selectedMessage.trim()) {
      onStartConversation(selectedMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <FaUser className="text-gray-500" size={16} />
          </div>
          <div>
            <h3 className="text-gray-900 text-base font-medium">
              {recipient?.name || 'New Conversation'}
            </h3>
            <p className="text-gray-500 text-xs">
              Start a conversation
            </p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Start a conversation</h2>
            <p className="text-gray-600">
              Send a message to {recipient?.name}. Here are some suggestions to get started:
            </p>
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`p-4 text-left rounded-lg border transition-colors ${
                  selectedMessage === suggestion
                    ? 'border-[#0A66C2] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="text-gray-800">{suggestion}</p>
              </button>
            ))}
          </div>

          {/* Custom Message */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Or write your own message:</h3>
            <textarea
              value={selectedMessage}
              onChange={(e) => setSelectedMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedMessage.trim()}
              className="bg-[#0A66C2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationStarter;