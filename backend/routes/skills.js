const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Skill = require('../models/Skill');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all skills with filtering and search
// @route   GET /api/skills
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().trim(),
  query('location').optional().trim(),
  query('minRate').optional().isFloat({ min: 0 }).toFloat(),
  query('maxRate').optional().isFloat({ min: 0 }).toFloat(),
  query('search').optional().trim(),
  query('sort').optional().isIn(['newest', 'oldest', 'rating', 'price_low', 'price_high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      category,
      location,
      minRate,
      maxRate,
      search,
      sort = 'newest'
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (location) {
      query.location = new RegExp(location, 'i');
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = minRate;
      if (maxRate) query.hourlyRate.$lte = maxRate;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'price_low':
        sortOption = { hourlyRate: 1 };
        break;
      case 'price_high':
        sortOption = { hourlyRate: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const skills = await Skill.find(query)
      .populate('provider', 'name profile.avatar profile.rating isVerified')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Skill.countDocuments(query);

    res.json({
      success: true,
      data: {
        skills,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('provider', 'name email phone profile isVerified')
      .lean();

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Increment view count if not viewed by provider
    if (!req.user || req.user._id.toString() !== skill.provider._id.toString()) {
      await Skill.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    }

    res.json({
      success: true,
      data: { skill }
    });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private (Workers only)
router.post('/', protect, authorize('worker'), [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('category')
    .isIn(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tailoring', 'Cleaning', 'Gardening', 'Tutoring', 'Photography', 'Catering', 'Other'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('hourlyRate')
    .isFloat({ min: 1 })
    .withMessage('Hourly rate must be at least $1'),
  // Contact info is now handled by user profile, not required in request
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const skillData = {
      ...req.body,
      provider: req.user._id
    };

    const skill = await Skill.create(skillData);

    await skill.populate('provider', 'name profile.avatar isVerified');

    res.status(201).json({
      success: true,
      message: 'Skill posted successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Owner only)
router.put('/:id', protect, authorize('worker'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Hourly rate must be at least $1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check ownership
    if (skill.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this skill'
      });
    }

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('provider', 'name profile.avatar isVerified');

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Owner only)
router.delete('/:id', protect, authorize('worker'), async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check ownership
    if (skill.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this skill'
      });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get skills by provider
// @route   GET /api/skills/provider/:userId
// @access  Public
router.get('/provider/:userId', async (req, res) => {
  try {
    const skills = await Skill.find({
      provider: req.params.userId,
      isActive: true
    })
    .populate('provider', 'name profile.avatar isVerified')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { skills }
    });
  } catch (error) {
    console.error('Get provider skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;