import z from 'zod'
import AppError from '../utils/AppError.js';
const uploadFileSchema = z.object({
  originalname: z.string().min(1, 'File name is missing.'),
  mimetype: z.string().min(1),
  size: z.number().positive('Uploaded file is empty.'),
  path: z.string().min(1),
});

const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file was uploaded. Please attach a CSV file.', 400));
  }

  const result = uploadFileSchema.safeParse(req.file);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    return next(new AppError(`Invalid file upload: ${message}`, 400));
  }

  next();
};

export default validateUploadedFile;