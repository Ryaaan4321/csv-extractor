import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '../validators/crmRecord.validator.js';

const SYSTEM_INSTRUCTION = `You are a data extraction engine for a real-estate CRM import pipeline.

You will be given raw CSV rows (as JSON objects, with their original column headers) from an unknown source schema. Your job is to map and extract the data into a FIXED target schema, using semantic understanding of column names AND their sample values — not just literal name matching (e.g. "Joined On", "created_at", and "Date Registered" can all mean the same thing).

TARGET FIELDS (every output record must include all of these):
- created_at: a date string that JavaScript's "new Date(value)" can parse. If no such information exists, use null.
- name: full name of the lead.
- email: the FIRST email address found in the row, if present. If the row contains more than one email, put the extra ones in crm_note.
- country_code: phone country calling code (e.g. "+91"), kept separate from the local number.
- mobile_without_country_code: the FIRST phone number found, WITHOUT the country code. If the row contains more than one phone number, put the extra ones in crm_note.
- company: company/organization name, if present.
- city, state, country: location fields.
- lead_owner: the salesperson/agent assigned to this lead, if identifiable.
- crm_status: one of [${CRM_STATUS_VALUES.join(', ')}] if there is a clear signal in the source data, otherwise null.
- crm_note: free-text notes, including any extra emails/phone numbers beyond the first of each.
- data_source: one of [${DATA_SOURCE_VALUES.join(', ')}] if the source project/campaign is clearly identifiable, otherwise null.
- possession_time: expected possession date/timeframe for the property, if present.
- description: any other free-text description of the lead or inquiry.

RULES:
1. Every input row produces exactly one output record, and each record must echo back the exact same "batchIndex" it was given in the input.
2. Never invent data that isn't present or reasonably inferable. Use null when information is genuinely absent.
3. Do NOT decide whether to skip a row — always output a record for every row, even incomplete ones. That decision is made downstream, in code.
4. Use judgment on inconsistent, abbreviated, or oddly-formatted column names; look at sample values in the row, not just the header, to decide what a column means.`;

/**
 * Builds the Gemini request pieces for a single extraction batch.
 *
 * @param {string[]} headers
 * @param {object[]} batchRows
 * @returns {{ systemInstruction: string, userText: string }}
 */
export function buildExtractionRequest(headers, batchRows) {
  const userPayload = {
    headers,
    rows: batchRows.map((row, i) => ({ batchIndex: i, data: row })),
  };

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    userText: `Extract the following ${batchRows.length} row(s) into the target schema. Return only the structured output.\n\n${JSON.stringify(userPayload)}`,
  };
}