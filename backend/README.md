# Recycle Buddy Backend

Backend service using OpenRouter SDK to interact with Gemini 2.0 Flash model. Built for mobile-first web apps with image upload support.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Add your OpenRouter API key to the `.env` file:
```
OPENROUTER_API_KEY=your_actual_api_key_here
PORT=3000
```

**Note:** You can also create a `.env.example` file manually with the above content as a template.

## Usage

### Start the API Server

Run the Express server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

### API Endpoints

#### `POST /api/callLLM`

Main endpoint for the frontend to call the LLM with image and optional description. **Hardcoded for Santa Cruz, California.**

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image` (file, **required**): Image file (JPEG, PNG, WebP, or GIF, max 10MB)
  - `description` (string, optional): Optional text description of the image

**Response:**
```json
{
  "success": true,
  "response": "Based on the image, I can see...",
  "imageInfo": {
    "filename": "photo.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

**Example (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('image', imageFile); // File from <input type="file">
formData.append('description', 'Items on my kitchen counter'); // Optional

const response = await fetch('http://localhost:3000/api/callLLM', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data.response);
```

**Example (React/React Native):**
```javascript
const handleUpload = async (imageFile, description) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageFile.uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  if (description) {
    formData.append('description', description);
  }

  try {
    const response = await fetch('http://your-server:3000/api/callLLM', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

**Note:**
- This endpoint is hardcoded for **Santa Cruz, California** recycling guidelines
- The prompt includes Santa Cruz-specific recycling rules and disposal methods
- No location parameter needed - all responses are tailored to Santa Cruz

#### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Recycle Buddy API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Using the Functions Directly

You can also import and use the functions directly in your code:
```javascript
import { requestGemini } from './index.js';

const response = await requestGemini('Your prompt here');
console.log(response);
```

## API

### `requestGemini(prompt, options)`

Makes a request to Gemini 2.0 Flash via OpenRouter. Supports both text-only and image+text requests.

**Parameters:**
- `prompt` (string): The prompt to send to the model
- `options` (object, optional): Additional options
  - `temperature` (number, default: 0.7): Temperature for the response
  - `imagePath` (string): Path to a local image file to include
  - `imageUrl` (string): Public URL to an image to include
  - `imageBase64` (string): Base64-encoded image data (data:image/...;base64,...)

**Returns:**
- `Promise<string>`: The response text from the model

**Examples:**

Text-only request:
```javascript
const response = await requestGemini('What can be recycled?');
```

Image from local file:
```javascript
const response = await requestGemini('What items in this image can be recycled?', {
  imagePath: './uploads/recycling-items.jpg'
});
```

Image from URL:
```javascript
const response = await requestGemini('Describe this image', {
  imageUrl: 'https://example.com/image.jpg'
});
```

Image from base64:
```javascript
const response = await requestGemini('Analyze this image', {
  imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
});
```

### `imageToBase64(imagePath)`

Helper function to convert a local image file to base64 data URL.

**Parameters:**
- `imagePath` (string): Path to the image file

**Returns:**
- `Promise<string>`: Base64 data URL string

**Example:**
```javascript
import { imageToBase64 } from './index.js';

const base64 = await imageToBase64('./my-image.png');
```
