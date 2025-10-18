const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predictions');
const advisorRoute = require('./routes/advisor');
const cropRoutes = require('./routes/cropRoutes');
const batchRoutes = require('./routes/batch');
const importExportRoutes = require('./routes/importexport');

dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Simple request logger middleware
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictRoutes);
app.use('/api/advisor', advisorRoute);
app.use('/api/crop', cropRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/importexport', importExportRoutes);

// Optional: Additional API endpoint example
app.post('/api/saveRequest', (req, res) => {
  console.log('Saving prediction data:', req.body);
  res.json({ success: true });
});

// MongoDB connection with fallback
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-spoilage', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
