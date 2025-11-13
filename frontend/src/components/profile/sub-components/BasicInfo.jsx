// In BasicInfo.jsx
import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaBriefcase, FaStar } from 'react-icons/fa';

const BasicInfo = ({ profile, isEditing, editForm, onInputChange, isOwnProfile }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
      
      <div className="space-y-4">
        {/* Location */}
        <div className="flex items-start">
          <FaMapMarkerAlt className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
            {isEditing && isOwnProfile ? (
              <input
                type="text"
                name="location"
                value={editForm.location}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.location}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start">
          <FaPhone className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
            {isEditing && isOwnProfile ? (
              <input
                type="text"
                name="phone"
                value={editForm.phone}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start">
          <FaEnvelope className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            {isEditing && isOwnProfile ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.email || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="flex items-start">
          <FaBriefcase className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Experience</h3>
            {isEditing && isOwnProfile ? (
              <input
                type="text"
                name="experience"
                value={editForm.experience}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.experience}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-start">
          <FaStar className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(profile.rating) ? 'text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="ml-2 text-gray-900">{profile.rating.toFixed(1)}</span>
              <span className="text-gray-500 ml-1">({profile.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;