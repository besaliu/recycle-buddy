import { readFile } from 'fs/promises';
import { extname } from 'path';

/**
 * Converts a file buffer to base64 data URL
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - MIME type of the file
 * @returns {string} - Base64 data URL string
 */
export function bufferToBase64(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * Converts an image file to base64 data URL
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Base64 data URL string
 */
export async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await readFile(imagePath);
    const ext = extname(imagePath).toLowerCase();
    
    // Determine MIME type from file extension
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    const base64Image = imageBuffer.toString('base64');
    
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    throw new Error(`Failed to read image file: ${error.message}`);
  }
}
