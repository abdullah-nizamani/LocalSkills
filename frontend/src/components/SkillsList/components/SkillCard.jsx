import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaUser, FaTools, FaClock, FaComment, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const SkillCard = ({ skill }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Default image to use when no image is provided - using local path
  const defaultImage = '/images/default-skill.jpg';
  
  // State to track if the image has failed to load
  const [imageError, setImageError] = useState(false);
  
  const {
    title,
    category,
    description,
    location,
    rating,
    reviews,
    hourlyRate,
    image,
    provider,
    createdAt
  } = skill;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Posted today';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  const handleMessage = () => {
    if (provider && provider._id) {
      // Navigate to messages with the provider's information
      navigate('/messages', { 
        state: { 
          recipientId: provider._id, 
          recipientName: provider.name,
          startConversation: true,
          suggestions: [
            "Hi, I'm interested in your services.",
            "Hello, I'd like to know more about your skills.",
            "Hi, can you tell me about your availability?",
            "Hello, I have a project that might be a good fit for your skills."
          ]
        } 
      });
    }
  };

  const handleViewProfile = () => {
    if (provider && provider._id) {
      navigate(`/profile/${provider._id}`);
    }
  };

  // Check if the current user is the provider/author of this skill
  const isOwnSkill = user && provider && user.id === provider._id;

  // Determine which image to use
  const imageSrc = imageError || !image ? defaultImage : image;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Card Header */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-1">
              <span className="inline-block px-2 py-1 bg-[#E7F3FF] text-[#0A66C2] text-xs font-medium rounded-full">
                {category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
          </div>
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ml-4">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => {
                // Only set error state if not already set to prevent infinite loop
                if (!imageError) {
                  setImageError(true);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 pb-3">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FaUser className="mr-2 text-gray-500" />
          <button 
            onClick={handleViewProfile}
            className="font-medium hover:text-[#0A66C2] transition-colors"
          >
            {provider?.name || 'N/A'}
          </button>
          {provider?.isVerified && (
            <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              Verified
            </span>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <FaMapMarkerAlt className="mr-2 text-gray-500" />
          <span>{location}</span>
          <span className="mx-2 text-gray-300">•</span>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{rating || 0}</span>
            <span className="text-gray-500 ml-1">({reviews || 0})</span>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <FaClock className="mr-2" />
          <span>{createdAt ? formatDate(createdAt) : 'N/A'}</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">${hourlyRate || 'N/A'}</span>
            <span className="text-sm text-gray-500 ml-1">/hour</span>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleViewProfile}
              className="flex items-center text-gray-600 hover:text-[#0A66C2] transition-colors duration-200 text-sm font-medium"
            >
              <FaUser className="mr-1.5" /> Profile
            </button>
            {/* Only show message button if user is logged in and not the author of the skill */}
            {user && !isOwnSkill && (
              <button 
                onClick={handleMessage}
                className="flex items-center text-gray-600 hover:text-[#0A66C2] transition-colors duration-200 text-sm font-medium"
              >
                <FaComment className="mr-1.5" /> Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;