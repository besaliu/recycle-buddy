import { openRouter } from '../config/openRouter.js';
import { imageToBase64, processImage } from '../utils/imageUtils.js';
import { buildRecyclingPrompt } from './promptService.js';

/**
 * Makes a request to Gemini via OpenRouter
 * Supports both text-only and image+text requests
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Optional parameters
 * @param {number} options.temperature - Temperature for the response (default: 0.7)
 * @param {string} options.imagePath - Path to an image file to include (local file path)
 * @param {string} options.imageUrl - URL to an image to include (public URL)
 * @param {string} options.imageBase64 - Base64-encoded image data (data:image/...;base64,...)
 * @returns {Promise<string>} - The response from the model
 */
async function requestGemini(prompt, options = {}) {
  try {
    const { temperature = 0.7, imagePath, imageUrl, imageBase64 } = options;

    // Build the content array - can include text and/or image
    const content = [];

    // Add text prompt if provided
    if (prompt) {
      content.push({ type: 'text', text: prompt });
    }

    // Handle image input - prioritize imagePath, then imageUrl, then imageBase64
    let imageDataUrl = null;

    if (imagePath) {
      // Convert local file to base64
      imageDataUrl = await imageToBase64(imagePath);
      console.log(`✓ Image loaded from file: ${imagePath}`);
    } else if (imageUrl) {
      // Use public URL directly
      imageDataUrl = imageUrl;
      console.log(`✓ Using image URL: ${imageUrl}`);
    } else if (imageBase64) {
      // Use provided base64 data
      imageDataUrl = imageBase64;
      console.log('✓ Using provided base64 image data');
    }

    // Add image to content if provided
    if (imageDataUrl) {
      content.push({
        type: 'image_url',
        imageUrl: {
          url: imageDataUrl,
        },
      });
    }

    // If no content at all, throw error
    if (content.length === 0) {
      throw new Error('Either prompt or image must be provided');
    }

    console.log('Sending request to Gemini 2.0 Flash...');
    if (imageDataUrl) {
      console.log('  (with image)');
      console.log(`  Image Payload Length: ${imageDataUrl.length} chars`);
    }

    console.time('Gemini API Call');
    const response = await openRouter.chat.send({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
      temperature: temperature,
    });
    console.timeEnd('Gemini API Call');

    // Extract the response text
    const responseText = response.choices?.[0]?.message?.content || '';

    if (!responseText) {
      throw new Error('No content in response from Gemini');
    }

    console.log('Response received successfully');
    return responseText;
  } catch (error) {
    console.error('Error making request to Gemini:', error);
    throw error;
  }
}

/**
 * Processes an image and optional description through the LLM
 * @param {Object} file - Multer file object
 * @param {string|null} description - Optional description
 * @returns {Promise<string>} - LLM response text
 */
export async function analyzeImageWithLLM(file, description = null) {
  const prompt = buildRecyclingPrompt(description);

  // Process and optimize image
  // This handles resizing and converting to JPEG, which solves:
  // 1. HEIC compatibility
  // 2. Large payload sizes
  console.log(`Original MIME type: ${file.mimetype}`);
  const base64Image = await processImage(file.buffer);

  const response = await requestGemini(prompt, {
    imageBase64: base64Image,
  });

  return response;
}

// Export requestGemini for direct use if needed
export { requestGemini };
