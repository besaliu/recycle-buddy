import multer from 'multer';

export const errorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image file must be less than 10MB',
      });
    }
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
};
