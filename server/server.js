import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(error => console.error('Connection error', error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Uploads directory created');
}

// ========== SCHEMAS ==========

// Define schema for inquiries
const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  program: { type: String, required: true },
  grade: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

// Define schema for announcements
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

// Define schema for schools gallery
const schoolSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const School = mongoose.model('School', schoolSchema);

// ========== MONGODB CHANGE STREAMS FOR REAL-TIME UPDATES ==========

async function setupChangeStreams() {
  try {
    console.log('🔍 Setting up MongoDB Change Streams...');

    // Watch announcements collection
    const announcementsChangeStream = Announcement.watch();
    announcementsChangeStream.on('change', (change) => {
      console.log('📢 MongoDB Change detected in announcements:', change.operationType);
      
      switch (change.operationType) {
        case 'insert':
          const newAnnouncement = change.fullDocument;
          // Convert to full URL for client
          newAnnouncement.image = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${newAnnouncement.image}`;
          io.emit('announcement_created', newAnnouncement);
          break;
        
        case 'update':
          // For updates, we need to fetch the full document
          Announcement.findById(change.documentKey._id)
            .then(updatedAnnouncement => {
              if (updatedAnnouncement) {
                updatedAnnouncement.image = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${updatedAnnouncement.image}`;
                io.emit('announcement_updated', updatedAnnouncement);
              }
            });
          break;
        
        case 'delete':
          io.emit('announcement_deleted', { id: change.documentKey._id });
          break;
      }
    });

    // Watch schools collection
    const schoolsChangeStream = School.watch();
    schoolsChangeStream.on('change', (change) => {
      console.log('🏫 MongoDB Change detected in schools:', change.operationType);
      
      switch (change.operationType) {
        case 'insert':
          const newSchool = change.fullDocument;
          newSchool.imageUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${newSchool.imageUrl}`;
          io.emit('school_created', newSchool);
          break;
        
        case 'update':
          School.findById(change.documentKey._id)
            .then(updatedSchool => {
              if (updatedSchool) {
                updatedSchool.imageUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${updatedSchool.imageUrl}`;
                io.emit('school_updated', updatedSchool);
              }
            });
          break;
        
        case 'delete':
          io.emit('school_deleted', { id: change.documentKey._id });
          break;
      }
    });

    // Watch inquiries collection
    const inquiriesChangeStream = Inquiry.watch();
    inquiriesChangeStream.on('change', (change) => {
      console.log('📧 MongoDB Change detected in inquiries:', change.operationType);
      
      if (change.operationType === 'insert') {
        io.emit('inquiry_created', change.fullDocument);
      }
    });

    console.log('✅ MongoDB Change Streams activated - watching for database changes');
  } catch (error) {
    console.error('❌ Error setting up Change Streams:', error);
  }
}

// Start change streams after MongoDB connection is established
db.once('open', () => {
  console.log('Connected to MongoDB');
  setupChangeStreams();
});

// ========== WEBSOCKET SETUP ==========

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Send initial connection confirmation
  socket.emit('connected', { 
    message: 'Connected to real-time server', 
    timestamp: new Date() 
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Function to broadcast events to all clients
function broadcastToClients(event, data) {
  io.emit(event, data);
  console.log(`📢 Broadcasted ${event} to ${io.engine.clientsCount} clients`);
}

// ========== INQUIRIES ROUTES ==========

// API endpoint to handle form submissions
app.post('/api/inquiries', async (req, res) => {
  try {
    console.log('Received inquiry:', req.body);
    
    const inquiry = new Inquiry({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      program: req.body.program,
      grade: req.body.grade,
      message: req.body.message,
      timestamp: req.body.timestamp || new Date()
    });
    
    await inquiry.save();
    console.log('Inquiry saved successfully');

    // Broadcast new inquiry to all connected clients (for admin dashboards)
    broadcastToClients('inquiry_created', inquiry);
    
    res.status(201).json({ 
      success: true, 
      message: 'Inquiry saved successfully!',
      id: inquiry._id 
    });
  } catch (error) {
    console.error('Error saving inquiry:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving inquiry: ' + error.message 
    });
  }
});
// ========== ANNOUNCEMENTS ROUTES ==========

// Get all announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
});

// Get single announcement
app.get('/api/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcement' });
  }
});

// Create new announcement
app.post('/api/announcements', upload.single('image'), async (req, res) => {
  try {
    const { title, date, description } = req.body;
    
    if (!title || !date || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, date, and description are required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image file is required' 
      });
    }

    const announcement = new Announcement({
      title,
      date,
      description,
      image: req.file.filename
    });

    const savedAnnouncement = await announcement.save();
    console.log('Announcement created successfully:', savedAnnouncement._id);

    // Prepare announcement data with full image URL
    const announcementWithFullUrl = {
      ...savedAnnouncement.toObject(),
      image: `${req.protocol}://${req.get('host')}/uploads/${savedAnnouncement.image}`
    };

    // Broadcast new announcement to all clients
    broadcastToClients('announcement_created', announcementWithFullUrl);
    
    res.status(201).json({ 
      success: true, 
      message: 'Announcement created successfully!',
      data: savedAnnouncement 
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating announcement: ' + error.message 
    });
  }
});

// Update announcement
app.put('/api/announcements/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const updateData = { 
      title, 
      date, 
      description,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    console.log('Announcement updated successfully:', updatedAnnouncement._id);

    // Prepare updated announcement data with full image URL
    const announcementWithFullUrl = {
      ...updatedAnnouncement.toObject(),
      image: `${req.protocol}://${req.get('host')}/uploads/${updatedAnnouncement.image}`
    };

    // Broadcast updated announcement to all clients
    broadcastToClients('announcement_updated', announcementWithFullUrl);

    res.json({ 
      success: true, 
      message: 'Announcement updated successfully!',
      data: updatedAnnouncement 
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating announcement: ' + error.message 
    });
  }
});

// Delete announcement
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!deletedAnnouncement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    console.log('Announcement deleted successfully:', deletedAnnouncement._id);

    // Broadcast deleted announcement ID to all clients
    broadcastToClients('announcement_deleted', { id: deletedAnnouncement._id });

    res.json({ 
      success: true, 
      message: 'Announcement deleted successfully',
      data: { id: deletedAnnouncement._id }
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting announcement: ' + error.message 
    });
  }
});

// ========== SCHOOLS GALLERY ROUTES ==========

// Get all schools for gallery
app.get('/api/schools', async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    // Convert image filenames to full URLs
    const schoolsWithFullUrls = schools.map(school => ({
      _id: school._id,
      name: school.name,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${school.imageUrl}`,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt
    }));
    
    res.json({ success: true, data: schoolsWithFullUrls });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ success: false, message: 'Error fetching schools' });
  }
});

// Get single school
app.get('/api/schools/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }
    
    // Convert to full URL
    const schoolWithFullUrl = {
      _id: school._id,
      name: school.name,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${school.imageUrl}`,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt
    };
    
    res.json({ success: true, data: schoolWithFullUrl });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ success: false, message: 'Error fetching school' });
  }
});

// Create new school (for admin)
app.post('/api/schools', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'School name is required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image file is required' 
      });
    }

    const school = new School({
      name: name.trim(),
      imageUrl: req.file.filename
    });

    const savedSchool = await school.save();
    console.log('School created successfully:', savedSchool._id);
    
    // Return with full URL
    const schoolWithFullUrl = {
      _id: savedSchool._id,
      name: savedSchool.name,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${savedSchool.imageUrl}`,
      createdAt: savedSchool.createdAt,
      updatedAt: savedSchool.updatedAt
    };

    // Broadcast new school to all clients
    broadcastToClients('school_created', schoolWithFullUrl);
    
    res.status(201).json({ 
      success: true, 
      message: 'School added successfully!',
      data: schoolWithFullUrl 
    });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating school: ' + error.message 
    });
  }
});

// Update school
app.put('/api/schools/:id', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = { 
      name: name.trim(),
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.imageUrl = req.file.filename;
    }

    const updatedSchool = await School.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSchool) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    console.log('School updated successfully:', updatedSchool._id);
    
    // Return with full URL
    const schoolWithFullUrl = {
      _id: updatedSchool._id,
      name: updatedSchool.name,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${updatedSchool.imageUrl}`,
      createdAt: updatedSchool.createdAt,
      updatedAt: updatedSchool.updatedAt
    };

    // Broadcast updated school to all clients
    broadcastToClients('school_updated', schoolWithFullUrl);
    
    res.json({ 
      success: true, 
      message: 'School updated successfully!',
      data: schoolWithFullUrl 
    });
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating school: ' + error.message 
    });
  }
});

// Delete school
app.delete('/api/schools/:id', async (req, res) => {
  try {
    const deletedSchool = await School.findByIdAndDelete(req.params.id);
    
    if (!deletedSchool) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    console.log('School deleted successfully:', deletedSchool._id);

    // Broadcast deleted school ID to all clients
    broadcastToClients('school_deleted', { id: deletedSchool._id });

    res.json({ 
      success: true, 
      message: 'School deleted successfully',
      data: { id: deletedSchool._id }
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting school: ' + error.message 
    });
  }
});

// ========== GENERAL ROUTES ==========

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!', 
    timestamp: new Date(),
    services: {
      database: 'MongoDB Atlas',
      uploads: 'Active',
      features: ['Inquiries', 'Announcements', 'Schools Gallery']
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'JBMMSI Server API', 
    version: '1.0.0',
    endpoints: {
      'POST /api/inquiries': 'Submit new inquiry',
      'GET /api/inquiries': 'Get all inquiries',
      'GET /api/announcements': 'Get all announcements',
      'POST /api/announcements': 'Create new announcement (with image upload)',
      'PUT /api/announcements/:id': 'Update announcement',
      'DELETE /api/announcements/:id': 'Delete announcement',
      'GET /api/schools': 'Get all schools for gallery',
      'POST /api/schools': 'Create new school (with image upload)',
      'PUT /api/schools/:id': 'Update school',
      'DELETE /api/schools/:id': 'Delete school',
      'GET /api/health': 'Server health check'
    }
  });
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  res.status(500).json({ 
    success: false, 
    message: error.message 
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Start server with Socket.IO support
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server active on ws://localhost:${PORT}`);
  console.log(`📧 Inquiry API available at http://localhost:${PORT}/api/inquiries`);
  console.log(`📢 Announcements API available at http://localhost:${PORT}/api/announcements`);
  console.log(`🏫 Schools Gallery API available at http://localhost:${PORT}/api/schools`);
  console.log(`🖼️ Uploads served from http://localhost:${PORT}/uploads/`);
});