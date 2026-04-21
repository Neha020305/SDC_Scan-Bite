const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const analysisController = require('../controllers/analysisController');

const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

// ADD THIS CODE ONLY
let clerkAuth;
// For demonstration, we use a mock middleware to prevent crashes with invalid keys.
// TO ENABLE REAL CLERK AUTH: Replace the mock with ClerkExpressWithAuth() and provide valid keys in .env
const useRealClerk = true; 

if (useRealClerk) {
  try {
    clerkAuth = ClerkExpressWithAuth();
  } catch (e) {
    clerkAuth = (req, res, next) => next();
  }
} else {
  clerkAuth = (req, res, next) => {
    req.auth = { userId: null }; 
    next();
  };
}

const safeClerkAuth = (req, res, next) => {
  clerkAuth(req, res, next);
};
// DO NOT MODIFY EXISTING CODE

const requireAuth = (req, res, next) => {
  safeClerkAuth(req, res, () => {
    if (!req.auth || !req.auth.userId) {
      // Redirect to sign-in if not authenticated
      return res.redirect('/#sign-in'); 
    }
    next();
  });
};
// DO NOT MODIFY EXISTING CODE

module.exports = (upload) => {
  // Page Routes
  router.get('/', safeClerkAuth, pageController.renderHomepage);
  router.get('/upload', pageController.renderUpload);
  router.get('/final', pageController.renderFinal);
  router.get('/mood', pageController.renderMood);
  router.get('/chemical', pageController.renderChemical);
  // ADD THIS CODE ONLY
  router.get('/dashboard', requireAuth, pageController.renderDashboard);
  // DO NOT MODIFY EXISTING CODE

  // API Routes
  // ADD THIS CODE ONLY
  router.post('/detail', safeClerkAuth, upload.single('image'), analysisController.analyzeImage);
  // DO NOT MODIFY EXISTING CODE
  router.post('/analyze-chemical', analysisController.analyzeChemical);
  router.post('/get-mood-food-recommendations', analysisController.getMoodRecommendations);
  // ADD THIS CODE ONLY
  router.post('/api/user/preferences', safeClerkAuth, pageController.updatePreferences);
  // DO NOT MODIFY EXISTING CODE

  return router;
};
