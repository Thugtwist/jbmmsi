import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(error => console.error('Connection error', error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for inquiries
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

// API endpoint to handle form submissions
app.post('/api/inquiries', async (req, res) => {
  try {
    console.log('Received inquiry:', req.body);
    
    const inquiry = new Inquiry({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      program: req.body.program,
      grade: req.body.grade, // Use the grade from request body
      message: req.body.message,
      timestamp: req.body.timestamp || new Date()
    });
    
    await inquiry.save();
    console.log('Inquiry saved successfully');
    
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

// Get all inquiries (for admin purposes)
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ timestamp: -1 });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ success: false, message: 'Error fetching inquiries' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!', 
    timestamp: new Date() 
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
      'GET /api/health': 'Server health check'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Inquiry API available at http://localhost:${PORT}/api/inquiries`);
});