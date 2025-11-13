const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const messageRoutes = require('./routes/messages');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // This is important for images
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Enhanced CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware to set CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Static file serving for uploads with explicit CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers specifically for static files
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Database connection (without deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'LocalSkills API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.io connection handling
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (data) => {
    const userId = data.userId || data; // Handle both object and string formats
    
    if (userId) {
      // Join user to their own room for targeted messaging
      socket.join(`user_${userId}`);
      
      // Store user connection
      connectedUsers.set(userId.toString(), socket.id);
      socket.userId = userId.toString();
      
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
      
      // Broadcast to all other users that this user is online
      socket.broadcast.emit('userOnline', { userId: userId.toString() });
      
      // Send list of currently online users to the newly connected user
      const onlineUserIds = Array.from(connectedUsers.keys()).filter(id => id !== userId.toString());
      socket.emit('onlineUsers', { userIds: onlineUserIds });
    }
  });

  // Handle mark as seen
  socket.on('mark_as_seen', async (data) => {
    try {
      const { conversationId } = data;
      
      if (!socket.userId) {
        socket.emit('message_error', { error: 'Not authenticated' });
        return;
      }

      // Mark all unseen messages in the conversation as seen
      const Message = require('./models/Message');
      const result = await Message.updateMany(
        {
          conversationId: conversationId,
          receiver: socket.userId,
          isSeen: false
        },
        { 
          isSeen: true, 
          seenAt: new Date() 
        }
      );

      // Get conversation participants
      const participants = conversationId.split('_');
      const otherUserId = participants.find(id => id !== socket.userId);
      
      if (otherUserId) {
        // Notify the other participant that messages were seen
        const otherUserSocketId = connectedUsers.get(otherUserId);
        if (otherUserSocketId) {
          io.to(`user_${otherUserId}`).emit('messages_seen', {
            conversationId,
            seenAt: new Date()
          });
        }
      }

      socket.emit('messages_seen_confirmation', {
        conversationId,
        seenCount: result.modifiedCount
      });
      
    } catch (error) {
      console.error('Mark as seen error:', error);
      socket.emit('message_error', { error: 'Failed to mark as seen' });
    }
  });

  // Handle private messages
  socket.on('private_message', async (data) => {
    try {
      const { receiverId, content } = data;
      
      if (!socket.userId) {
        socket.emit('message_error', { error: 'Not authenticated' });
        return;
      }

      // Create a conversation ID
      const ids = [socket.userId.toString(), receiverId.toString()].sort();
      const conversationId = ids.join('_');

      // Save message to database
      const Message = require('./models/Message');
      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content: content,
        conversationId: conversationId
      });

      await message.populate([
        { path: 'sender', select: 'name profile.avatar' },
        { path: 'receiver', select: 'name profile.avatar' }
      ]);

      // Send to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId.toString());
      if (receiverSocketId) {
        // Emit to the receiver's room
        io.to(`user_${receiverId}`).emit('new_message', {
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

      // Send confirmation to sender
      socket.emit('message_sent', {
        message: {
          id: message._id,
          senderId: message.sender._id,
          sender: message.sender.name,
          content: message.content,
          timestamp: message.createdAt
        }
      });

    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('mark_as_read', async (data) => {
    try {
      const { messageId } = data;
      
      if (!socket.userId) {
        socket.emit('message_error', { error: 'Not authenticated' });
        return;
      }

      const Message = require('./models/Message');
      const message = await Message.findById(messageId);
      
      if (!message) {
        socket.emit('message_error', { error: 'Message not found' });
        return;
      }
      
      if (message.receiver.toString() !== socket.userId) {
        socket.emit('message_error', { error: 'Not authorized' });
        return;
      }
      
      await message.markAsRead();
      
      // Notify sender that message was read
      const senderSocketId = connectedUsers.get(message.sender.toString());
      if (senderSocketId) {
        io.to(`user_${message.sender.toString()}`).emit('message_read', {
          messageId: message._id,
          readAt: message.readAt
        });
      }
      
    } catch (error) {
      console.error('Mark as read error:', error);
      socket.emit('message_error', { error: 'Failed to mark as read' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    
    if (socket.userId && receiverId) {
      // Send typing status to receiver
      io.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Broadcast to all that this user is offline
      socket.broadcast.emit('userOffline', { userId: socket.userId });
      
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Socket.io enabled for real-time messaging`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

module.exports = app;