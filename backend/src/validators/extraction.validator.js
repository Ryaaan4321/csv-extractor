import { z } from 'zod';
import AppError from '../utils/appError.js';
const ExtractionRequestSchema = z.object({
  uploadId: z.string().uuid({ message: 'uploadId must be a valid UUID' }),
});
export default function validateExtractionRequest(req, res, next) {
  const result = ExtractionRequestSchema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    return next(new AppError(`Invalid extraction request: ${message}`, 400));
  }
  req.body = result.data;
  next();
}