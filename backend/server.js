// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { getContests } = require('./services/contestService');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const roadmapRoutes = require('./routes/roadmap');

// Initialize Express app
const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Automatic Contest Fetching Scheduler
// Runs every 12 hours to fetch latest contests from CodeForces, LeetCode, CodeChef, AtCoder
cron.schedule('0 */12 * * *', async () => {
  console.log('\n� [CRON] Auto-fetching contests...');
  try {
    await getContests(true); // Force refresh
    console.log('✅ [CRON] Contests updated successfully');
  } catch (error) {
    console.error('❌ [CRON] Error fetching contests:', error.message);
  }
});

// Fetch contests immediately on server start
(async () => {
  console.log('\n🚀 Fetching initial contest data...');
  try {
    await getContests(true);
    console.log('✅ Initial contest data loaded');
  } catch (error) {
    console.error('❌ Error loading initial contests:', error.message);
  }
})();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API ready at http://localhost:${PORT}/api/test`);
  console.log(`⏰ Auto-fetch enabled: Every 12 hours`);
  console.log(`📅 Platforms: CodeForces, LeetCode, CodeChef, AtCoder`);
});
