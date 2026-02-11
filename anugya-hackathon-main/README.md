# ANUGYA (Scan-Bite) - Food Ingredient Scanner

ANUGYA is a powerful web application designed to help consumers make informed decisions about their food. By simply scanning the ingredients list on packaged food products, the app provides a comprehensive safety assessment, health rating, and detailed nutritional analysis using advanced AI.

## 🚀 Features

- **AI-Powered Ingredient Scanning**: Uses Google Gemini AI and Tesseract OCR to extract and analyze ingredients from product images.
- **Safety Assessment**: Identifies harmful chemicals, allergens, and provides a safety rating.
- **Detailed Nutritional Analysis**: Breaks down macronutrients, vitamins, and minerals.
- **Mood-Based Recommendations**: Provides personalized food suggestions based on your current mood.
- **Chemical Analysis**: Direct search for specific chemicals to understand their health impact and common uses.
- **Responsive Design**: Modern, glassmorphic UI that works across devices.

## 🛠️ Tech Stack

- **Frontend**: EJS (Embedded JavaScript), Vanilla CSS, JavaScript
- **Backend**: Node.js, Express.js
- **OCR**: Tesseract.js
- **Image Processing**: Sharp
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **File Uploads**: Multer

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd anugya-hackathon-main
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root directory and add your Gemini API Key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Start the server**:
    ```bash
    npm start
    ```
    The application will be running at `http://localhost:3000`.

## 📂 Project Structure

- `server.js`: Main application logic and API routes.
- `views/`: EJS templates for the frontend.
- `public/`: Static assets (images, CSS, client-side JS).
- `public/uploads/`: Temporary storage for uploaded and processed images.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
