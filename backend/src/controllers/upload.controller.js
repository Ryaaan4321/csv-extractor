import deleteFile from '../utils/fileCleanup.js';
import { saveUpload } from '../services/uploadStore.service.js';
import parseCsvFile from '../services/csv.service.js';
import catchAsync from '../utils/catchAsync.js';
const PREVIEW_ROW_COUNT = 5;

const uploadCsv = catchAsync(async (req, res, next) => {
  console.log("from the controller of the uploaddddd")
  
  const filePath = req.file.path;

  try {
    const { headers, rows, rowCount } = await parseCsvFile(filePath);
    const uploadId = saveUpload({ headers, rows, rowCount });

    res.status(201).json({
      status: 'success',
      data: {
        uploadId,
        headers,
        rowCount,
        preview: rows.slice(0, PREVIEW_ROW_COUNT),
      },
    });
  } finally {
    await deleteFile(filePath);
  }
});
export default uploadCsv;