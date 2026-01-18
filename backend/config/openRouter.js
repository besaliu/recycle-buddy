import dotenv from 'dotenv';
import { join } from 'path';
import { OpenRouter } from '@openrouter/sdk';

// Load environment variables from .env file (for local development)
// In Netlify Functions, env vars are set directly
try {
  dotenv.config({ path: join(process.cwd(), 'backend', '.env') });
} catch (e) {
  // Ignore - env vars should be set by the platform in production
}

// Get the OpenRouter API key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY is not set in environment variables');
  // Don't exit in serverless - just warn (the error will surface when the API is called)
}

if (OPENROUTER_API_KEY) {
  console.log('✓ OpenRouter API key loaded');
}

// Initialize and export OpenRouter client
export const openRouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY,
});
