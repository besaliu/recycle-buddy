import express from 'express';
import { APP_CONFIG } from '../config/constants.js';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Recycle Buddy API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /
 * Root endpoint with API info
 */
router.get('/', (req, res) => {
  res.json({
    ...APP_CONFIG,
    endpoints: {
      health: 'GET /api/health',
      callLLM: 'POST /api/callLLM',
      incrementGlobalTreeCount: 'POST /api/incrementGlobalTreeCount',
      getGlobalTreeCount: 'GET /api/getGlobalTreeCount',
    },
    callLLM: {
      method: 'POST',
      path: '/api/callLLM',
      contentType: 'multipart/form-data',
      required: ['image'],
      optional: ['description'],
      description: 'Send image and optional description to LLM for Santa Cruz recycling analysis',
    },
  });
});

export default router;
