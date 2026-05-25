const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Initialize the core SDK client with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define your model target using a direct string parameter
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function analyzeIngredients(ingredients, userPrefs = null) {
  try {
    if (!ingredients || ingredients.trim().length === 0) {
      throw new Error('No ingredients text provided for analysis');
    }

    let prefsText = '';
    if (userPrefs) {
      prefsText = `
    CRITICAL USER CONTEXT:
    The user has the following preferences/health profile:
    - Diet: ${userPrefs.diet || 'None'}
    - Cuisine Preference: ${userPrefs.cuisine || 'None'}
    - Allergies: ${userPrefs.allergies || 'None'}
    - Health Conditions: ${userPrefs.conditions || 'None'}

    You MUST take these into account. If the product contains any ingredients that conflict with their allergies or health conditions, you MUST flag it as unsafe (isSafe: false) and put a severe warning in the "warnings" array. If it conflicts with their diet, mention it in the warnings.`;
    }

    const prompt = `Analyze these food ingredients and provide a safety assessment. Ingredients: ${ingredients.substring(0, 5000)}
${prefsText}

    Provide the analysis in this exact JSON format:
    {
      "productName": "string",
      "keyIngredients": ["list of main ingredients"],
      "safetyAssessment": {
        "isSafe": boolean,
        "reason": "string",
        "warnings": ["list of warnings if any"]
      },
      "safetyRating": {
        "score": number,
        "explanation": "string"
      },
      "harmfulChemicals": ["list of harmful chemicals if any"],
      "healthBenefits": ["list of health benefits if any"],
      "consumptionRecommendations": "string",
      "childSafety": "string explaining how the product ingredients specifically affect children",
      "alternativeProducts": ["list of safer alternatives if any"]
    }

    Focus on safety and health aspects. If any information is not available, use appropriate default values.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    try {
      const analysis = JSON.parse(cleanText);
      if (!analysis.productName || !analysis.safetyAssessment || !analysis.safetyRating) {
        throw new Error('Invalid analysis response format');
      }
      return analysis;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse analysis response');
    }
  } catch (err) {
    console.error('Gemini Analysis Error:', err);
    throw new Error('AI analysis failed. Please try again with clearer text.');
  }
}

async function getDetailedAnalysis(ingredients, productName, userPrefs = null) {
  try {
    if (!ingredients || !productName) {
      throw new Error('Missing required parameters for detailed analysis');
    }

    let prefsText = '';
    if (userPrefs) {
      prefsText = `
    CRITICAL USER CONTEXT:
    - Diet: ${userPrefs.diet || 'None'}
    - Allergies: ${userPrefs.allergies || 'None'}
    - Health Conditions: ${userPrefs.conditions || 'None'}
    
    Ensure the healthImpact and dietaryConsiderations sections specifically address these user conditions.`;
    }

    const prompt = `Analyze this food product "${productName}" with ingredients: ${ingredients.substring(0, 5000)}
${prefsText}

    Provide a detailed analysis in the following JSON format:
    {
      "nutritionalInfo": {
        "calories": "string",
        "macronutrients": {
          "protein": "string",
          "carbs": "string",
          "fats": "string"
        },
        "vitamins": ["list"],
        "minerals": ["list"]
      },
      "healthImpact": {
        "shortTerm": "string",
        "longTerm": "string",
        "risks": ["list"]
      },
      "dietaryConsiderations": {
        "suitableFor": ["list"],
        "restrictions": ["list"],
        "allergies": ["list"]
      },
      "storage": {
        "conditions": "string",
        "shelfLife": "string",
        "precautions": ["list"]
      },
      "environmentalImpact": {
        "packaging": "string",
        "sustainability": "string",
        "ecoFriendliness": "string"
      }
    }

    Focus on safety and health aspects. If any information is not available, use "Not specified" as the value.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    try {
      const analysis = JSON.parse(cleanText);
      if (!analysis.nutritionalInfo || !analysis.healthImpact) {
        throw new Error('Invalid response structure');
      }
      return analysis;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse analysis response');
    }
  } catch (err) {
    console.error('Detailed Analysis Error:', err);
    throw new Error('Detailed analysis failed. Please try again.');
  }
}

async function getMoodFoodRecommendations(mood, moodCategory, gender = 'not specified') {
  try {
    const prompt = `Provide 10-15 healthy food recommendations that help with ${mood} mood for a ${gender}. 
    Consider the following aspects:
    - Foods that naturally boost mood and energy
    - Foods rich in mood-regulating nutrients
    - Foods that help with stress reduction
    - Foods that promote better sleep (if relevant)
    - Foods that support mental clarity
    - Foods that help with emotional balance
    - Nutritional needs specific to ${gender}

    For each food, include:
    - A brief explanation of how it helps with this specific mood
    - Key nutrients that contribute to mood improvement
    - Simple preparation suggestions
    - Best time to consume

    Format the response as a JSON object with:
    {
      "moodCategory": "${moodCategory}",
      "foods": [
        {
          "name": "string",
          "benefits": "string",
          "nutrients": ["list of key nutrients"],
          "preparation": "string",
          "bestTime": "string"
        }
      ],
      "additionalTips": {
        "dietaryAdvice": "string",
        "lifestyleTips": ["list of tips"],
        "avoidFoods": ["list of foods to avoid"]
      }
    }

    Make the recommendations specific to ${mood} mood and ensure they are practical and easy to implement.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
   
    const cleanText = text.replace(/```json|```/g, '');
    return JSON.parse(cleanText);
  } catch (err) {
    console.error('Mood Food Recommendation Error:', err);
    throw new Error('Failed to generate food recommendations');
  }
}

module.exports = {
  analyzeIngredients,
  getDetailedAnalysis,
  getMoodFoodRecommendations
};
