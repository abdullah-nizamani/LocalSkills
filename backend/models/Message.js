const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  conversationId: {
    type: String,
    required: [true, 'Conversation ID is required'],
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isSeen: {
    type: Boolean,
    default: false
  },
  seenAt: {
    type: Date
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String
  }],
  relatedSkill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.sender, this.receiver];
});

// Pre-save middleware to generate conversation ID
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    // Create a consistent conversation ID from sender and receiver IDs
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = ids.join('_');
  }
  next();
});

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  const conversationId = ids.join('_');

  return this.find({ conversationId })
    .populate('sender', 'name profile.avatar')
    .populate('receiver', 'name profile.avatar')
    .sort({ createdAt: 1 });
};

// Static method to get user's conversations - simplified version
messageSchema.statics.getUserConversations = async function(userId) {
  try {
    // Find all messages involving the user
    const messages = await this.find({
      $or: [
        { sender: new mongoose.Types.ObjectId(userId) },
        { receiver: new mongoose.Types.ObjectId(userId) }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name profile.avatar')
    .populate('receiver', 'name profile.avatar');

    // Group by conversationId manually
    const conversationsMap = {};
    messages.forEach(message => {
      if (!conversationsMap[message.conversationId]) {
        conversationsMap[message.conversationId] = {
          conversationId: message.conversationId,
          lastMessage: message,
          unreadCount: 0
        };
      }
      // Count unread messages
      if (message.receiver._id.toString() === userId.toString() && !message.isRead) {
        conversationsMap[message.conversationId].unreadCount += 1;
      }
    });

    // Convert to array and sort by last message time
    const conversations = Object.values(conversationsMap).sort((a, b) => 
      b.lastMessage.createdAt - a.lastMessage.createdAt
    );

    // Format the response
    return conversations.map(conv => {
      const otherUser = conv.lastMessage.sender._id.toString() === userId.toString() 
        ? conv.lastMessage.receiver 
        : conv.lastMessage.sender;

      return {
        conversationId: conv.conversationId,
        lastMessage: {
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          isRead: conv.lastMessage.isRead
        },
        unreadCount: conv.unreadCount,
        otherUser: {
          id: otherUser._id,
          name: otherUser.name,
          avatar: otherUser.profile?.avatar || '',
          isVerified: otherUser.isVerified,
          userType: otherUser.userType
        }
      };
    });
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    throw error;
  }
};

// Instance method to mark as seen
messageSchema.methods.markAsSeen = function() {
  this.isSeen = true;
  this.seenAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Message', messageSchema);