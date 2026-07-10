import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { getUpload } from '../services/uploadStore.service.js'; 
import { extractCrmRecords } from '../services/aiExtraction.service.js';
const extractCrmData = catchAsync(async (req, res) => {
  const { uploadId } = req.body;
  const upload = getUpload(uploadId);
  if (!upload) {
    throw new AppError(
      'Upload not found or has expired. Please re-upload your CSV.',
      404
    );
  }
  const { headers, rows } = upload;
  console.log("headers and rows from the upload store == ",headers)
  // console.log("rows from the upload store == ",rows)
  const result = await extractCrmRecords(headers, rows);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});
export default extractCrmData;