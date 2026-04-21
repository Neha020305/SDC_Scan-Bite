const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Path to the uploads directory in the frontend
const uploadDir = path.join(__dirname, '../../frontend/public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function preprocessImage(imagePath) {
  try {
    console.log('Starting image preprocessing...');
    const processedPath = path.join(uploadDir, 'processed_' + path.basename(imagePath));
    
    await sharp(imagePath)
      .greyscale()
      .normalize()
      .linear(1.1)
      .sharpen()
      .threshold(128)
      .modulate({
        brightness: 1.2,
        saturation: 0
      })
      .toFile(processedPath);

    console.log('Image preprocessing completed');
    return processedPath;
  } catch (err) {
    console.error('Image preprocessing error:', err);
    throw new Error('Failed to process image. Please try again with a different image.');
  }
}

async function extractText(imagePath) {
  try {
    console.log('Starting text extraction...');
    // Use the local traineddata file if available in backend root
    const workerOptions = {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log('Progress:', m.progress);
        } else {
          console.log(m.status);
        }
      },
      // Assuming eng.traineddata is in backend/
      langPath: path.join(__dirname, '..')
    };

    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { 
        ...workerOptions,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:()[]{}@#$%^&*!?-_=+<>/\\|"\' ',
        tessedit_pageseg_mode: '6'
      }
    );

    console.log('Text extraction completed');
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the image. Please try again with a clearer image.');
    }

    const cleanedText = text.replace(/\s+/g, ' ').trim();
    console.log('Extracted text sample:', cleanedText.substring(0, 100) + '...');
    return cleanedText;
  } catch (err) {
    console.error('Text extraction error:', err);
    throw new Error('Failed to extract text from image. Please try again with a clearer image.');
  }
}

module.exports = {
  preprocessImage,
  extractText,
  uploadDir
};
