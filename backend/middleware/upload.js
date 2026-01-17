import multer from 'multer';
import { FILE_UPLOAD_CONFIG } from '../config/constants.js';

// Store files temporarily in memory (buffer) for processing
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_UPLOAD_CONFIG.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimeTypes = FILE_UPLOAD_CONFIG.allowedMimeTypes;
    const fileMimeType = file.mimetype ? file.mimetype.toLowerCase() : '';
    
    // Also check file extension as fallback (HEIC files sometimes have inconsistent MIME types)
    // curl might send application/octet-stream or empty MIME type for HEIC
    const originalName = file.originalname.toLowerCase();
    const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(originalName);
    
    // Allow if MIME type matches OR if it has a valid image extension
    // Also allow if MIME type is empty/unknown but extension is valid (curl issue with HEIC)
    if (allowedMimeTypes.includes(fileMimeType) || 
        (hasImageExtension && (!fileMimeType || fileMimeType === 'application/octet-stream'))) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only JPEG, PNG, WebP, GIF, and HEIC images are allowed. Received: ${file.mimetype || 'unknown'}`), false);
    }
  },
});
