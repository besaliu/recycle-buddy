import { readFile } from 'fs/promises';
import { extname } from 'path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

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
      '.heic': 'image/heic',
      '.heif': 'image/heif',
    };

    const mimeType = mimeTypes[ext] || 'image/jpeg';
    const base64Image = imageBuffer.toString('base64');

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error(`Error reading image file: ${imagePath}`, error);
    throw new Error(`Failed to read image file: ${error.message}`);
  }
}

/**
 * Processes and optimizes an image buffer
 * @param {Buffer} buffer - Original image buffer
 * @returns {Promise<string>} - Base64 data URL of optimized JPEG
 */
export async function processImage(buffer) {
  try {
    console.time('Image Processing');
    let inputBuffer = buffer;

    // Check if HEIC by looking for ftyp
    // (Simple check, heic-convert might throw if invalid which is fine)
    // HEIC usually has 'ftyp' at offset 4
    if (buffer.length > 12 &&
      buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {

      const brand = buffer.toString('utf8', 8, 12);
      // Common HEIC brands
      if (['heic', 'heix', 'hevc', 'heim', 'msf1', 'mif1'].includes(brand)) {
        console.log('Detected HEIC image, converting to JPEG...');
        inputBuffer = await heicConvert({
          buffer: buffer,
          format: 'JPEG',
          quality: 1
        });
      }
    }

    const processedBuffer = await sharp(inputBuffer)
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    console.timeEnd('Image Processing');
    return `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}
