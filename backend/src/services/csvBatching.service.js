import { EXTRACTION_CONFIG } from '../config/extraction.config.js';

/**
 * Splits parsed CSV rows into fixed-size batches for AI extraction.
 *
 * Batching exists to:
 *  (a) stay within model context/token limits on large files,
 *  (b) isolate failures to a small slice of rows instead of the whole file,
 *  (c) keep individual prompts small enough that structured-output
 *      adherence stays reliable.
 *
 * @param {object[]} rows - parsed CSV rows (array of plain objects)
 * @param {number} [batchSize]
 * @returns {{ startIndex: number, rows: object[] }[]}
 */
export function createBatches(rows, batchSize = EXTRACTION_CONFIG.BATCH_SIZE) {
  if (!Array.isArray(rows)) {
    throw new TypeError('createBatches expects an array of rows');
  }

  const batches = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push({
      startIndex: i,
      rows: rows.slice(i, i + batchSize),
    });
  }
  return batches;
}