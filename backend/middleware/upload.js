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
    if (FILE_UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
    }
  },
});
