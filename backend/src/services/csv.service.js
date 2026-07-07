import fs from 'fs'
import csvParser from 'csv-parser'
import AppError from '../utils/AppError.js';

const parseCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = null;
    const stream = fs.createReadStream(filePath).pipe(csvParser());
    stream.on('headers', (parsedHeaders) => {
      if (!parsedHeaders || parsedHeaders.length === 0) {
        stream.destroy();
        return reject(new AppError('CSV file has no headers.', 422));
      }
      headers = parsedHeaders;
    });
    stream.on('data', (row) => {
      rows.push(row);
    });
    stream.on('end', () => {
      if (rows.length === 0) {
        return reject(new AppError('CSV file has headers but no data rows.', 422));
      }
      resolve({ headers, rows, rowCount: rows.length });
    });
    stream.on('error', (err) => {
      reject(new AppError(`Failed to parse CSV file: ${err.message}`, 422));
    });
  });
};
export default parseCsvFile;