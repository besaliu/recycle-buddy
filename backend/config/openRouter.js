import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OpenRouter } from '@openrouter/sdk';

// Get the directory of the current module (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Get the OpenRouter API key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY is not set in environment variables');
  console.error('Please create a .env file in the backend directory with:');
  console.error('OPENROUTER_API_KEY=your_api_key_here');
  console.error(`\nLooking for .env at: ${join(__dirname, '..', '.env')}`);
  process.exit(1);
}

// Log that the API key was loaded (without exposing the actual key)
console.log('✓ API key loaded from .env file');

// Initialize and export OpenRouter client
export const openRouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY,
});
