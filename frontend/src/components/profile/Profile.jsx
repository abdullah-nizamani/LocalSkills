import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { textContent } from '../../constants';
import { FaUser, FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaSave, FaTools, FaUserCheck, FaCamera, FaComment, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import ProfileHeader from './sub-components/ProfileHeader';
import BasicInfo from './sub-components/BasicInfo';
import BioSkills from './sub-components/BioSkills';
import ActionButtons from './sub-components/ActionButtons';

const Profile = () => {
  const { userId } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    profession: '',
    location: '',
    phone: '',
    email: '',
    experience: '',
    rating: 0,
    reviews: 0,
    bio: '',
    skills: [],
    userType: 'client',
    avatar: '',
    avatarFullUrl: '', // Add field for full URL
    isVerified: false
  });

  const [editForm, setEditForm] = useState(profile);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Check if the profile being viewed belongs to the current user
  const isOwnProfile = user && profile.id && (profile.id === user.id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Determine which user's profile to fetch
        const id = userId || (user ? user.id : null);
        
        if (!id) {
          setLoading(false);
          return;
        }

        const headers = {};
        if (user) {
          headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        }

        const response = await fetch(`http://localhost:5000/api/users/${id}`, { headers });
        
        if (response.ok) {
          const data = await response.json();
          const userProfile = data.data.user;
          
          // Initialize profile with user data from database
          const avatarUrl = userProfile.profile?.avatar || '';
          const avatarFullUrl = userProfile.profile?.avatarFullUrl || '';
          console.log('Fetched avatar URL:', avatarUrl);
          console.log('Fetched full avatar URL:', avatarFullUrl);
          
          setProfile({
            id: userProfile._id || userProfile.id,
            name: userProfile.name || '',
            profession: userProfile.userType === 'worker' ? 'Service Provider' : 'Client',
            location: userProfile.profile?.location || 'No location provided',
            phone: userProfile.phone || '',
            email: userProfile.email || '',
            experience: userProfile.profile?.experience || (userProfile.userType === 'worker' ? 'New Professional' : 'N/A'),
            rating: userProfile.profile?.rating || 0,
            reviews: userProfile.profile?.reviewCount || 0,
            bio: userProfile.profile?.bio || (userProfile.userType === 'worker'
              ? 'Professional service provider ready to help with your needs.'
              : 'Looking for quality services in my area.'),
            skills: userProfile.profile?.skills || (userProfile.userType === 'worker' ? ['General Services'] : []),
            userType: userProfile.userType || 'client',
            avatar: avatarUrl,
            avatarFullUrl: avatarFullUrl, // Store the full URL
            isVerified: userProfile.isVerified || false
          });
          
          setEditForm({
            id: userProfile._id || userProfile.id,
            name: userProfile.name || '',
            profession: userProfile.userType === 'worker' ? 'Service Provider' : 'Client',
            location: userProfile.profile?.location || 'No location provided',
            phone: userProfile.phone || '',
            email: userProfile.email || '',
            experience: userProfile.profile?.experience || (userProfile.userType === 'worker' ? 'New Professional' : 'N/A'),
            rating: userProfile.profile?.rating || 0,
            reviews: userProfile.profile?.reviewCount || 0,
            bio: userProfile.profile?.bio || (userProfile.userType === 'worker'
              ? 'Professional service provider ready to help with your needs.'
              : 'Looking for quality services in my area.'),
            skills: userProfile.profile?.skills || (userProfile.userType === 'worker' ? ['General Services'] : []),
            userType: userProfile.userType || 'client',
            avatar: avatarUrl,
            avatarFullUrl: avatarFullUrl, // Store the full URL
            isVerified: userProfile.isVerified || false
          });
        } else {
          toast.error('Failed to load profile');
          if (response.status === 404) {
            navigate('/skills');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userId, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(profile);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const token = user.token || localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      setUploading(true);
      
      // First, upload the profile picture if a new one was selected
      let avatarUrl = editForm.avatar; // Start with the current avatar URL
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        const uploadResponse = await fetch('http://localhost:5000/api/users/upload-profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          avatarUrl = uploadData.data.profilePictureUrl; // Use the relative path for database storage
          console.log('Profile picture uploaded successfully:', avatarUrl);
        } else {
          toast.error(uploadData.message || 'Failed to upload profile picture');
          setUploading(false);
          return;
        }
      }

      // Then update the profile with the new avatar URL and other data
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          'profile.bio': editForm.bio,
          'profile.location': editForm.location,
          'profile.experience': editForm.experience,
          'profile.skills': editForm.skills.filter(skill => skill.trim() !== ''),
          'profile.avatar': avatarUrl,
        }),
      });

      const data = await response.json();
      console.log('Profile update response:', data);

      if (data.success) {
        // Get the updated avatar URL from the response
        const updatedAvatar = data.data.user.profile.avatar || avatarUrl;
        const updatedAvatarFullUrl = data.data.user.profile.avatarFullUrl || '';
        console.log('Updated avatar from server:', updatedAvatar);
        console.log('Updated full avatar URL from server:', updatedAvatarFullUrl);

        // Update local state with the new avatar URL
        const updatedProfile = { 
          ...editForm, 
          avatar: updatedAvatar,
          avatarFullUrl: updatedAvatarFullUrl // Store the full URL
        };
        console.log('Updated profile state:', updatedProfile);
        setProfile(updatedProfile);
        setIsEditing(false);

        // Update user profile in context
        if (isOwnProfile) {
          const profileData = {
            name: data.data.user.name,
            phone: data.data.user.phone,
            email: data.data.user.email,
            profile: data.data.user.profile,
            userType: user.userType
          };

          updateProfile(profileData);
        }
        
        setSelectedFile(null);
        setPreviewUrl('');
        toast.success('Profile updated successfully!');
      } else {
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => error.msg).join(', ');
          toast.error(`Validation failed: ${errorMessages}`);
        } else {
          toast.error(data.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (index, value) => {
    const newSkills = [...editForm.skills];
    newSkills[index] = value;
    setEditForm(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setEditForm(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleMessage = () => {
    // If user is not logged in, redirect to login page
    if (!user) {
      toast.info('Please login to send a message');
      navigate('/auth?mode=login&redirect=/messages');
      return;
    }
    
    navigate('/messages', { 
      state: { 
        recipientId: profile.id, 
        recipientName: profile.name,
        startConversation: true,
        suggestions: [
          "Hi, I'm interested in your services.",
          "Hello, I'd like to know more about your skills.",
          "Hi, can you tell me about your availability?",
          "Hello, I have a project that might be a good fit for your skills."
        ]
      } 
    });
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show the "Please Login" message if there's no userId parameter
  // This means the user is trying to access their own profile without being logged in
  if (!user && !userId) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {textContent.profile.title}
            </h1>
            <p className="text-xl text-gray-600">
              {textContent.profile.description}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <FaUser size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h3>
            <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
            <button 
              onClick={() => navigate('/auth?mode=login')}
              className="bg-[#0A66C2] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#004182] transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isOwnProfile ? 'Your Profile' : `${profile.name}'s Profile`}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          {/* Profile Header */}
          <ProfileHeader 
            profile={profile}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
            isOwnProfile={isOwnProfile}
            uploading={uploading}
          />

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <BasicInfo 
                  profile={profile}
                  isEditing={isEditing && isOwnProfile}
                  editForm={editForm}
                  onInputChange={handleInputChange}
                  isOwnProfile={isOwnProfile}
                />

                {/* Bio and Skills */}
                <BioSkills 
                  profile={profile}
                  isEditing={isEditing && isOwnProfile}
                  editForm={editForm}
                  onInputChange={handleInputChange}
                  onSkillsChange={handleSkillsChange}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                  isOwnProfile={isOwnProfile}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Action Buttons */}
                {!isOwnProfile && (
                  <ActionButtons 
                    profile={profile}
                    onMessage={handleMessage}
                    isLoggedIn={!!user}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;