import multer from 'multer'
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: `Upload error: ${err.message}`,
    });
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message: isOperational ? err.message : 'Something went wrong. Please try again later.',
  });
};

export default errorHandler