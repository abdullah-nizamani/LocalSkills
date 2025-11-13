import React from 'react';
import { FaComment, FaStar, FaShare, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';

const ActionButtons = ({ profile, onMessage }) => {
  const { user } = useAuth();

  // Check if the current user is viewing their own profile
  const isOwnProfile = user && user.id === profile.id;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Actions</h3>
      <div className="flex flex-col space-y-3">
        {/* Message button - shown for all users but with different text based on login status */}
        {!isOwnProfile && (
          <button
            onClick={onMessage}
            className="flex items-center justify-center bg-[#0A66C2] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#004182] transition-colors duration-200"
          >
            <FaComment className="mr-2" />
            {user ? 'Send Message' : 'Login to Message'}
          </button>
        )}
        
        {/* Review button - shown for all users but with different text based on login status */}
        <button
          onClick={() => {
            if (!user) {
              // If not logged in, redirect to login
              window.location.href = '/auth?mode=login';
            } else {
              // TODO: Implement review functionality
              alert('Review functionality coming soon!');
            }
          }}
          className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          <FaStar className="mr-2 text-yellow-400" />
          {user ? 'Leave a Review' : 'Login to Review'}
        </button>
        
        {/* Share button - available for all users */}
        <button
          onClick={() => {
            // Copy profile URL to clipboard
            const profileUrl = window.location.href;
            navigator.clipboard.writeText(profileUrl)
              .then(() => {
                alert('Profile link copied to clipboard!');
              })
              .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy link. Please copy manually.');
              });
          }}
          className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          <FaShare className="mr-2" />
          Share Profile
        </button>
        
        {/* Follow button - only shown for logged-in users who are not viewing their own profile */}
        {user && !isOwnProfile && (
          <button
            onClick={() => {
              // TODO: Implement follow functionality
              alert('Follow functionality coming soon!');
            }}
            className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            <FaUserPlus className="mr-2" />
            Follow
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;