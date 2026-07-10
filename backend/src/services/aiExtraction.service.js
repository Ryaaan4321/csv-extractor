import geminiClient from '../config/gemini.client.js';
import { EXTRACTION_CONFIG } from '../config/extraction.config.js';
import { crmExtractionResponseSchema } from '../validators/crmResponseSchema.js';
import { CrmRecordSchema } from '../validators/crmRecord.validator.js';
import { buildExtractionRequest } from '../prompts/crmExtraction.prompt.js';
import { createBatches } from './csvBatching.service.js';

import AppError from '../utils/AppError.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function callGeminiForBatch(headers, batchRows) {
  const { systemInstruction, userText } = buildExtractionRequest(headers, batchRows);

  const response = await geminiClient.models.generateContent({
    model: EXTRACTION_CONFIG.MODEL,
    contents: userText,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: crmExtractionResponseSchema,
      temperature: 0,
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty response for this batch');
  }

  try {
    return JSON.parse(response.text);
  } catch (error) {
    throw new Error(`Gemini response was not valid JSON: ${error.message}`);
  }
}

async function callGeminiWithRetry(headers, batchRows) {
  let lastError;

  for (let attempt = 1; attempt <= EXTRACTION_CONFIG.MAX_RETRIES; attempt += 1) {
    try {
      return await callGeminiForBatch(headers, batchRows);
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === EXTRACTION_CONFIG.MAX_RETRIES;
      if (isLastAttempt) break;

      const delay = EXTRACTION_CONFIG.RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError;
}

function validateBatchIntegrity(parsedResponse, expectedCount) {
  const records = parsedResponse.records;

  if (!Array.isArray(records) || records.length !== expectedCount) {
    return false;
  }

  const seenIndices = new Set(records.map((r) => r.batchIndex));
  if (seenIndices.size !== expectedCount) return false;

  for (let i = 0; i < expectedCount; i += 1) {
    if (!seenIndices.has(i)) return false;
  }

  return true;
}

async function processBatch(batch, headers) {
  const { startIndex, rows } = batch;
  const results = { validRecords: [], failed: [] };
  let parsed;
  try {
    parsed = await callGeminiWithRetry(headers, rows);
  } catch (error) {
    rows.forEach((row, i) => {
      results.failed.push({
        sourceRowIndex: startIndex + i,
        reason: `AI extraction failed: ${error.message}`,
      });
    });
    return results;
  }
  if (!validateBatchIntegrity(parsed, rows.length)) {
    rows.forEach((row, i) => {
      results.failed.push({
        sourceRowIndex: startIndex + i,
        reason: 'AI response did not match the expected row count/index structure',
      });
    });
    return results;
  }
  const byBatchIndex = new Map(parsed.records.map((record) => [record.batchIndex, record]));
  for (let i = 0; i < rows.length; i += 1) {
    const record = byBatchIndex.get(i);
    const validation = CrmRecordSchema.safeParse(record);
    if (!validation.success) {
      results.failed.push({
        sourceRowIndex: startIndex + i,
        reason: `Extracted record failed validation: ${validation.error.issues
          .map((issue) => issue.message)
          .join('; ')}`,
      });
      continue;
    }
    const { batchIndex, ...crmFields } = validation.data;
    if (crmFields.data_source === null) {
      crmFields.data_source = '';
    }
    results.validRecords.push({
      sourceRowIndex: startIndex + i,
      crmRecord: crmFields,
    });
  }
  return results;
}

function partitionBySkipRule(extractedRecords) {
  const imported = [];
  const skipped = [];

  for (const { sourceRowIndex, crmRecord } of extractedRecords) {
    const hasEmail = Boolean(crmRecord.email && crmRecord.email.trim() !== '');
    const hasMobile = Boolean(
      crmRecord.mobile_without_country_code &&
        crmRecord.mobile_without_country_code.trim() !== ''
    );

    if (!hasEmail && !hasMobile) {
      skipped.push({
        sourceRowIndex,
        reason: 'Row has neither an email nor a mobile number',
      });
      continue;
    }

    imported.push({ sourceRowIndex, ...crmRecord });
  }

  return { imported, skipped };
}

export async function extractCrmRecords(headers, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new AppError('No rows available to extract. The CSV appears to be empty.', 400);
  }

  const batches = createBatches(rows);

  const batchResults = [];
  for (const batch of batches) {
    // eslint-disable-next-line no-await-in-loop
    const result = await processBatch(batch, headers);
    batchResults.push(result);
  }

  const allValidRecords = batchResults.flatMap((r) => r.validRecords);
  const extractionFailures = batchResults.flatMap((r) => r.failed);

  const { imported, skipped } = partitionBySkipRule(allValidRecords);

  const allSkipped = [...skipped, ...extractionFailures].sort(
    (a, b) => a.sourceRowIndex - b.sourceRowIndex
  );

  return {
    records: imported,
    skippedRecords: allSkipped,
    totalImported: imported.length,
    totalSkipped: allSkipped.length,
  };
}