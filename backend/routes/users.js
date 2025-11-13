const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Skill = require('../models/Skill');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Helper function to construct full avatar URL
const constructAvatarUrl = (avatar, req) => {
  if (!avatar) return '';
  
  // If it's already a full URL, return as is
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // If it starts with '/uploads/', construct the full URL
  if (avatar.startsWith('/uploads/')) {
    return `${req.protocol}://${req.get('host')}${avatar}`;
  }
  
  // If it starts with 'uploads/' (without leading slash), construct the full URL
  if (avatar.startsWith('uploads/')) {
    return `${req.protocol}://${req.get('host')}/${avatar}`;
  }
  
  // If it's just a filename, assume it's in the uploads directory
  return `${req.protocol}://${req.get('host')}/uploads/${avatar}`;
};

// @desc    Get user's dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    let stats = {};

    if (req.user.userType === 'worker') {
      // Worker stats
      const skills = await Skill.find({ provider: req.user._id });
      const activeSkills = skills.filter(skill => skill.isActive);
      const totalViews = skills.reduce((sum, skill) => sum + skill.viewCount, 0);

      stats = {
        totalSkills: skills.length,
        activeSkills: activeSkills.length,
        totalViews,
        averageRating: req.user.profile.rating || 0
      };
    } else {
      // Client stats
      stats = {
        // Placeholder for client stats
      };
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's skills
    const skills = await Skill.find({
      provider: req.params.id,
      isActive: true
    }).sort({ createdAt: -1 });

    // Convert profile to plain object and add full avatar URL
    const profileData = user.profile.toObject();
    const avatarFullUrl = constructAvatarUrl(profileData.avatar, req);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          profile: {
            ...profileData,
            avatarFullUrl // Include the full URL
          },
          isVerified: user.isVerified,
          createdAt: user.createdAt
        },
        skills
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get users by type and location
// @route   GET /api/users
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { userType, location, limit = 20 } = req.query;

    let query = {};

    if (userType) {
      query.userType = userType;
    }

    if (location) {
      query['profile.location'] = new RegExp(location, 'i');
    }

    const users = await User.find(query)
      .select('name userType profile isVerified createdAt')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Add full avatar URLs to each user
    const usersWithAvatarUrls = users.map(user => {
      const profileData = user.profile.toObject();
      const avatarFullUrl = constructAvatarUrl(profileData.avatar, req);
      
      return {
        ...user.toObject(),
        profile: {
          ...profileData,
          avatarFullUrl
        }
      };
    });

    res.json({
      success: true,
      data: { users: usersWithAvatarUrls }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-picture
// @access  Private
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file path and full URL
    const filePath = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${filePath}`;
    
    res.json({
      success: true,
      data: {
        profilePictureUrl: filePath, // Relative path for database storage
        profilePictureFullUrl: fullUrl // Full URL for immediate use
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'phone', 'profile.bio', 'profile.location',
      'profile.experience', 'profile.skills', 'profile.avatar'
    ];

    const updates = {};

    // Build updates object
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key.startsWith('profile.')) {
          const profileKey = key.split('.')[1];
          updates[`profile.${profileKey}`] = req.body[key];
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    // Convert profile to plain object and add full avatar URL
    const profileData = user.profile.toObject();
    const avatarFullUrl = constructAvatarUrl(profileData.avatar, req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          profile: {
            ...profileData,
            avatarFullUrl // Include the full URL
          }
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @desc    Update user status (admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update'
    });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's skills first
    await Skill.deleteMany({ provider: req.params.id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User and associated skills deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user deletion'
    });
  }
});

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const allowedFields = [
      'name', 'phone', 'userType', 'isVerified', 'isActive',
      'profile.bio', 'profile.location', 'profile.experience', 'profile.skills', 'profile.avatar'
    ];

    const updates = {};

    // Build updates object
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key.startsWith('profile.')) {
          const profileKey = key.split('.')[1];
          updates[`profile.${profileKey}`] = req.body[key];
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert profile to plain object and add full avatar URL
    const profileData = user.profile.toObject();
    const avatarFullUrl = constructAvatarUrl(profileData.avatar, req);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          isVerified: user.isVerified,
          isActive: user.isActive,
          profile: {
            ...profileData,
            avatarFullUrl // Include the full URL
          }
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user update'
    });
  }
});

module.exports = router;