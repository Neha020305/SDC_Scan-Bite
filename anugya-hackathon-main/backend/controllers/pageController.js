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

    db.all(`SELECT * FROM scans WHERE user_id = ? ORDER BY scanned_at DESC`, [userId], (err, rows) => {
      if (err) {
        console.error('Database error fetching scans:', err);
        return res.render('dashboard', { data: { error: 'Database error occurred' }, stats: null });
      }

      let totalScans = 0;
      let totalScore = 0;
      let totalChemicals = 0;
      let validScoreCount = 0;

      const recentScans = [];

      if (rows && rows.length > 0) {
        totalScans = rows.length;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.safety_score) {
            totalScore += row.safety_score;
            validScoreCount++;
          }
          if (row.chemicals_count) {
            totalChemicals += row.chemicals_count;
          }
          if (i < 5) {
            recentScans.push({
              productName: row.product_name,
              scannedAt: row.scanned_at,
              isSafe: row.is_safe
            });
          }
        }
      }

      const avgSafetyScore = validScoreCount > 0 ? (totalScore / validScoreCount).toFixed(1) : 0;

      const stats = {
        totalScans,
        avgSafetyScore,
        totalChemicals,
        recentScans
      };

      res.render('dashboard', { data: {}, stats });
    });
  } catch (err) {
    console.error('Dashboard rendering error:', err);
    res.render('dashboard', { data: { error: 'Server error' }, stats: null });
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
