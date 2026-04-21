# ANUGYA - Food Ingredient Scanner

ANUGYA is a powerful food ingredient scanner that helps users understand what's in their packaged food. Using AI (Gemini), it provides safety assessments, health ratings, and personalized advice.

## Project Structure

The project has been reorganized into a clean full-stack structure:

### 📂 Backend (`/backend`)
Contains the server-side logic, API endpoints, and AI integrations.
- **server.js**: Main entry point.
- **routes/**: Defines all application routes.
- **controllers/**: Contains the logic for processing requests.
- **services/**: Handles external integrations (Gemini AI, Tesseract OCR, Sharp image processing).
- **eng.traineddata**: Local training data for Tesseract OCR.

### 📂 Frontend (`/frontend`)
Contains the UI-related code and static assets.
- **views/**: EJS templates for server-side rendering.
- **public/**: Static assets including CSS, images, and user uploads.

## Prerequisites

- [Node.js](https://nodejs.org/) installed.
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Surabhi-M-R/Scan-Bite.git
   cd Scan-Bite/anugya-hackathon-main
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the `backend/` directory and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Open your browser and navigate to:
   `http://localhost:3000`

## Features

- **Ingredient Scanning**: Upload an image of any food product to extract and analyze ingredients.
- **Safety Assessment**: Get instant feedback on whether a product is safe based on AI analysis.
- **Mood-Based Recommendations**: Get healthy food suggestions based on your current mood.
- **Chemical Analysis**: Analyze specific chemicals and their safety ratings.
- **Detailed Nutritional Info**: View detailed breakdown of calories, macros, and vitamins.
