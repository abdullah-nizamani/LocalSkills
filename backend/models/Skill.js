const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Skill title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tailoring',
      'Cleaning', 'Gardening', 'Tutoring', 'Photography', 'Catering',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [1, 'Hourly rate must be at least $1']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  }],
  // Contact info is now handled through user profile reference
  // No longer stored in skill document
  experience: {
    type: String,
    trim: true,
    default: ''
  },
  availability: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Weekends', 'Flexible'],
    default: 'Flexible'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
skillSchema.index({ category: 1, isActive: 1 });
skillSchema.index({ provider: 1 });
skillSchema.index({ location: 1 });
skillSchema.index({ title: 'text', description: 'text' });
skillSchema.index({ tags: 1 });
skillSchema.index({ createdAt: -1 });
skillSchema.index({ rating: -1, reviewCount: -1 });

// Virtual for average rating calculation
skillSchema.virtual('averageRating').get(function() {
  return this.rating;
});

// Pre-save middleware to generate tags from title and description
skillSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description')) {
    const text = `${this.title} ${this.description}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    this.tags = [...new Set(words)].slice(0, 10); // Limit to 10 unique tags
  }
  next();
});

// Static method to get skills by category
skillSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).populate('provider', 'name profile');
};

// Static method to search skills
skillSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    $text: { $search: query }
  };

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.location) {
    searchQuery.location = new RegExp(filters.location, 'i');
  }

  if (filters.minRate || filters.maxRate) {
    searchQuery.hourlyRate = {};
    if (filters.minRate) searchQuery.hourlyRate.$gte = filters.minRate;
    if (filters.maxRate) searchQuery.hourlyRate.$lte = filters.maxRate;
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('provider', 'name profile');
};

// Instance method to increment view count
skillSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Skill', skillSchema);