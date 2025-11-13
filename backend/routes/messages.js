const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user._id);
    const conversations = await Message.getUserConversations(req.user._id);
    console.log('Conversations found:', conversations.length);

    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add a new route to mark messages as seen
router.put('/seen/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Mark all unseen messages in the conversation as seen
    const result = await Message.updateMany(
      {
        conversationId: conversationId,
        receiver: req.user._id,
        isSeen: false
      },
      { 
        isSeen: true, 
        seenAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as seen',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Mark as seen error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update the get conversations route to include seen status
router.get('/conversations', protect, async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user._id);
    const conversations = await Message.getUserConversations(req.user._id);
    console.log('Conversations found:', conversations.length);

    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    console.log('Fetching conversation between:', req.user._id, 'and', req.params.userId);
    
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const messages = await Message.getConversation(req.user._id, req.params.userId);
    console.log('Messages found:', messages.length);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: {
        messages,
        otherUser: {
          id: otherUser._id,
          name: otherUser.name,
          avatar: otherUser.profile?.avatar || '',
          isVerified: otherUser.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, [
  body('receiver')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and cannot exceed 1000 characters'),
  body('relatedSkill')
    .optional()
    .isMongoId()
    .withMessage('Invalid skill ID')
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

    const { receiver, content, relatedSkill } = req.body;

    console.log('Sending message from', req.user._id, 'to', receiver);

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Don't allow sending messages to self
    if (receiver === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    // Create a conversation ID
    const ids = [req.user._id.toString(), receiver].sort();
    const conversationId = ids.join('_');

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      conversationId, // Explicitly set the conversationId
      relatedSkill
    });

    // Populate the message with sender and receiver details
    await message.populate([
      { path: 'sender', select: 'name profile.avatar' },
      { path: 'receiver', select: 'name profile.avatar' },
      { path: 'relatedSkill', select: 'title category' }
    ]);

    console.log('Message created with ID:', message._id);

    // Emit socket event for real-time messaging
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${receiver}`).emit('newMessage', {
        message: {
          id: message._id,
          senderId: message.sender._id,
          sender: message.sender.name,
          content: message.content,
          timestamp: message.createdAt
        },
        conversationId: message.conversationId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (message.sender.toString() !== req.user._id.toString() &&
        message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;