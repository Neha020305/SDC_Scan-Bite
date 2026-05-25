require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const imageService = require('./services/imageService');

// Initialize Database
require('./db');

const app = express();

// APP CONFIGURATION
app.set('view engine', 'ejs');
// Point to frontend/views
app.set('views', path.join(__dirname, '../frontend/views'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Point to frontend/public
app.use(express.static(path.join(__dirname, '../frontend/public')));

// FILE UPLOAD SETUP
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, imageService.uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  }),
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
    cb(null, true);
  },
  limits: { 
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

// ROUTES
const routes = require('./routes/index')(upload);
app.use('/', routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).render('error', {
    message: 'An unexpected error occurred. Please try again.'
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0' , () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
