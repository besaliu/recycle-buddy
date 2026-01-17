import express from 'express';
import { upload } from '../middleware/upload.js';
import { analyzeImageWithLLM } from '../services/llmService.js';

const router = express.Router();

/**
 * POST /api/callLLM
 * Main endpoint for frontend to call LLM with image and optional description
 * 
 * Body (multipart/form-data):
 * - image: Image file (required)
 * - description: Optional text description of the image
 */
router.post('/callLLM', upload.single('image'), async (req, res) => {
  try {
    // Validate image was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please upload an image file with the field name "image"',
      });
    }

    const description = req.body.description ? req.body.description.trim() : null;

    // Log request details
    console.log(`\n📸 LLM Request received:`);
    console.log(`   - Filename: ${req.file.originalname}`);
    console.log(`   - Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    if (description) {
      console.log(`   - Description: ${description}`);
    }

    // Process image through LLM
    const response = await analyzeImageWithLLM(req.file, description);

    console.log('✅ LLM analysis complete\n');

    // Return the response
    res.json({
      success: true,
      response: response,
    });
  } catch (error) {
    console.error('❌ Error processing LLM request:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message,
    });
  }
});

export default router;
