exports.renderHomepage = (req, res) => {
  res.render('homepage', {
    title: 'ANUGYA',
    appName: 'ANUGYA',
    tagline: 'YOUR HEALTH SCANNER',
    description: 'Building a web application to scan packaged food products to know the ingredients and suitability to consume according to user health conditions and many more features.',
    workflowSteps: [
      {
        image: '/assets/Frame.png',
        title: 'UPLOAD',
        description: 'Upload an image of a packaged food product to analyze its ingredients.'
      },
      {
        image: '/assets/IMAGE (2).png',
        title: 'GET RESULT',
        description: 'AI scans and detects the ingredients, highlighting potential health risks.'
      },
      {
        image: '/assets/IMAGE (3).png',
        title: 'PERSONAL ADVICE',
        description: 'Receive a health rating, consumption recommendations, and better alternatives.'
      }
    ],
    ctaText: 'GET STARTED'
  });
};

exports.renderUpload = (req, res) => res.render('index');

exports.renderFinal = (req, res) => {
  try {
    if (!req.query.analysis || !req.query.detailedAnalysis || !req.query.imagePath) {
      throw new Error('Missing required parameters');
    }

    const analysis = JSON.parse(decodeURIComponent(req.query.analysis));
    const detailedAnalysis = JSON.parse(decodeURIComponent(req.query.detailedAnalysis));
    
    res.render('final', {
      imagePath: req.query.imagePath,
      analysis: analysis,
      detailedAnalysis: detailedAnalysis
    });
  } catch (err) {
    console.error('Error in final route:', err);
    res.status(500).render('error', { 
      message: 'Error displaying results. Please try again.'
    });
  }
};

exports.renderMood = (req, res) => {
  res.render('mood');
};

exports.renderChemical = (req, res) => {
  res.render('chemical');
};

const db = require('../db');
const axios = require('axios');

exports.renderDashboard = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.redirect('/#sign-in');
    }

    // Query SQLite for preferences
    db.get(`SELECT cuisine, diet FROM users_preferences WHERE user_id = ?`, [userId], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.render('dashboard', { data: { error: 'Database error occurred' } });
      }

      const cuisine = row?.cuisine || 'American';
      const diet = row?.diet || 'balanced';

      // Call external API (Placeholder Spoonacular API using process.env.FOOD_API_KEY)
      try {
        // Using a mock external API call since Spoonacular might require a real key
        const apiUrl = `https://api.spoonacular.com/recipes/complexSearch`;
        const response = await axios.get(apiUrl, {
          params: {
            apiKey: process.env.FOOD_API_KEY,
            cuisine: cuisine,
            diet: diet,
            number: 3
          },
          validateStatus: () => true // Prevent crashing if API key is invalid dummy
        });

        const apiData = response.status === 200 ? response.data : { error: 'Failed to fetch external data (Invalid API Key?)', details: response.data };
        
        // Add user preferences to data payload
        const finalData = {
          preferences: { cuisine, diet },
          externalData: apiData
        };

        res.render('dashboard', { data: finalData });
      } catch (apiErr) {
        console.error('External API error:', apiErr.message);
        res.render('dashboard', { data: { error: 'External API call failed' } });
      }
    });
  } catch (err) {
    console.error('Dashboard rendering error:', err);
    res.render('dashboard', { data: { error: 'Server error' } });
  }
};

const { clerkClient } = require('@clerk/clerk-sdk-node');

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { allergies, diet, conditions } = req.body;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        allergies,
        diet,
        conditions
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};
// DO NOT MODIFY EXISTING CODE
