import React, { useState, useEffect } from 'react';
import { FaUser, FaStar, FaTools, FaUserCheck, FaCamera, FaEdit, FaSave, FaUserCircle } from 'react-icons/fa';

const ProfileHeader = ({ 
  profile, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  selectedFile, 
  previewUrl, 
  onFileSelect,
  fileInputRef,
  isOwnProfile,
  uploading
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Reset image error when the avatar changes
  useEffect(() => {
    setImageError(false);
  }, [profile.avatar, profile.avatarFullUrl]);
  
  // Default avatar image using a placeholder service
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=0D8ABC&color=fff`;
  
  // Determine which image source to use
  const getImageSrc = () => {
    console.log('Profile avatar:', profile.avatar);
    console.log('Profile full avatar URL:', profile.avatarFullUrl);
    
    // Show preview if a new image is selected
    if (previewUrl) {
      console.log('Using preview URL:', previewUrl);
      return previewUrl;
    }
    
    // Use default avatar if error or no avatar
    if (imageError || (!profile.avatar && !profile.avatarFullUrl)) {
      console.log('Using default avatar');
      return defaultAvatar;
    }
    
    // Use the full URL if available
    if (profile.avatarFullUrl) {
      console.log('Using provided full URL:', profile.avatarFullUrl);
      return profile.avatarFullUrl;
    }
    
    // If we have a relative path, use a proxy approach
    if (profile.avatar) {
      // Use the API endpoint to get the image
      console.log('Using proxy approach for avatar:', profile.avatar);
      return `/api/uploads?path=${encodeURIComponent(profile.avatar)}`;
    }
    
    console.log('Using default avatar as fallback');
    return defaultAvatar;
  };

  const handleImageError = () => {
    console.log('Image failed to load');
    setImageError(true);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={getImageSrc()}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              onError={handleImageError}
            />
          </div>
          {isEditing && (
            <div className="absolute -bottom-2 -right-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                title="Change profile picture"
              >
                <FaCamera size={12} />
              </button>
            </div>
          )}
          {previewUrl && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
              New
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold">{profile.name}</h2>
          <p className="text-xl opacity-90">{profile.profession}</p>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start mt-2 space-y-2 md:space-y-0 md:space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              profile.userType === 'worker'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile.userType === 'worker' ? 'Service Provider' : 'Client'}
            </span>
            {profile.userType === 'worker' && (
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">{profile.rating}</span>
                <span className="ml-1 opacity-75">({profile.reviews} reviews)</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {isOwnProfile && (
            <>
              {!isEditing ? (
                <button
                  onClick={onEdit}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={onSave}
                    disabled={uploading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {uploading ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    onClick={onCancel}
                    disabled={uploading}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;