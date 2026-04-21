const imageService = require('../services/imageService');
const geminiService = require('../services/geminiService');
const fs = require('fs');
const db = require('../db');
const { clerkClient } = require('@clerk/clerk-sdk-node');

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No image file received. Please try again.');
    }

    const imagePath = req.file.path;
    const filename = req.file.filename;

    console.log('Processing image:', imagePath);

    // Fetch user preferences if authenticated
    const userId = req.auth?.userId;
    let userPrefs = { cuisine: 'None', diet: 'None', allergies: 'None', conditions: 'None' };
    
    if (userId) {
      // Fetch from Clerk metadata
      try {
        const user = await clerkClient.users.getUser(userId);
        const metadata = user.publicMetadata || {};
        if (metadata.allergies) userPrefs.allergies = metadata.allergies;
        if (metadata.diet) userPrefs.diet = metadata.diet;
        if (metadata.conditions) userPrefs.conditions = metadata.conditions;
      } catch (err) {
        console.error('Failed to fetch Clerk metadata:', err);
      }

      // Fetch from SQLite (overrides Clerk diet if present)
      try {
        const row = await new Promise((resolve, reject) => {
          db.get(`SELECT cuisine, diet FROM users_preferences WHERE user_id = ?`, [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        if (row) {
          if (row.cuisine) userPrefs.cuisine = row.cuisine;
          if (row.diet) userPrefs.diet = row.diet; // SQLite diet takes precedence
        }
      } catch (err) {
        console.error('Failed to fetch SQLite preferences:', err);
      }
    }

    // Preprocess the image
    const processedPath = await imageService.preprocessImage(imagePath);
    console.log('Image preprocessed:', processedPath);

    // Extract text from the image
    const text = await imageService.extractText(processedPath);
    console.log('Text extracted:', text.substring(0, 100) + '...');

    if (!text || text.trim().length === 0) {
      throw new Error('Could not read text from the image. Please try again with a clearer image.');
    }

    // Analyze the ingredients with user preferences
    const analysis = await geminiService.analyzeIngredients(text, userPrefs);
    console.log('Basic analysis completed');

    // Get detailed analysis with user preferences
    const detailedAnalysis = await geminiService.getDetailedAnalysis(text, analysis.productName, userPrefs);
    console.log('Detailed analysis completed');

    // Cleanup processed image
    try {
      fs.unlinkSync(processedPath);
      console.log('Processed image cleaned up');
    } catch (err) {
      console.error('Error cleaning up processed image:', err);
    }


    // Render the results
    res.render('detail', {
      imagePath: `/uploads/${filename}`,
      analysis: analysis,
      detailedAnalysis: detailedAnalysis
    });
    
  } catch (err) {
    console.error('Upload Error:', err);
    
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('Error cleaning up uploaded file:', cleanupErr);
      }
    }

    res.status(500).render('error', { 
      message: err.message || 'An error occurred while processing your image. Please try again.'
    });
  }
};

exports.analyzeChemical = async (req, res) => {
    try {
        const { chemicalName, percentage } = req.body;
        
        const mockResponse = {
            isSafe: Math.random() > 0.3,
            safetyRating: Math.floor(Math.random() * 10) + 1,
            commonUses: ["Food additive", "Preservative", "Flavor enhancer"],
            healthBenefits: ["May help preserve food", "Can enhance flavor", "Generally recognized as safe by FDA"],
            recommendation: "Based on our analysis, this chemical is generally safe for consumption in moderate amounts."
        };

        if (percentage && !isNaN(percentage)) {
            const percentageNum = parseFloat(percentage);
            let percentageAnalysis = "";
            if (percentageNum > 5) {
                percentageAnalysis = `Warning: The concentration of ${percentageNum}% is relatively high.`;
                mockResponse.safetyRating = Math.min(mockResponse.safetyRating, 6);
                mockResponse.isSafe = false;
            } else if (percentageNum > 1) {
                percentageAnalysis = `The concentration of ${percentageNum}% is within moderate range.`;
                mockResponse.safetyRating = Math.min(mockResponse.safetyRating, 8);
            } else {
                percentageAnalysis = `The concentration of ${percentageNum}% is relatively low.`;
            }
            mockResponse.percentageAnalysis = percentageAnalysis;
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        res.json(mockResponse);
    } catch (error) {
        console.error('Error analyzing chemical:', error);
        res.status(500).json({ error: 'Failed to analyze chemical' });
    }
};

exports.getMoodRecommendations = async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const moodCategories = {
      positive: ['happy', 'joyful', 'excited', 'energetic', 'motivated', 'peaceful', 'grateful', 'optimistic', 'confident', 'inspired', 'relaxed', 'content'],
      negative: ['sad', 'anxious', 'stressed', 'tired', 'depressed', 'angry', 'frustrated', 'overwhelmed', 'lonely', 'worried', 'irritable', 'exhausted'],
      neutral: ['focused', 'calm', 'balanced', 'mindful', 'centered', 'reflective', 'contemplative', 'curious', 'thoughtful', 'present', 'aware', 'grounded']
    };

    let moodCategory = 'neutral';
    for (const [category, moods] of Object.entries(moodCategories)) {
      if (moods.includes(mood.toLowerCase())) {
        moodCategory = category;
        break;
      }
    }

    const recommendations = await geminiService.getMoodFoodRecommendations(mood, moodCategory);
    res.json(recommendations);
  } catch (err) {
    console.error('Mood Food Recommendation Error:', err);
    res.status(500).json({ error: 'Failed to generate food recommendations' });
  }
};
