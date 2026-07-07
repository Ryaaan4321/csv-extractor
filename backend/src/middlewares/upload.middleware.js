import multer from 'multer'
import path from 'path';
import crypto from 'crypto'
import AppError from '../utils/AppError.js';
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'tmp');
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv'];
  const hasValidExtension = path.extname(file.originalname).toLowerCase() === '.csv';
  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
  if (!hasValidExtension) {
    return cb(new AppError('Only .csv files are allowed.', 400));
  }
  if (!hasValidMimeType) {
    console.warn(
      `Unexpected MIME type "${file.mimetype}" for file ${file.originalname}; proceeding on extension check.`
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

export default upload