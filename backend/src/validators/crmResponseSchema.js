import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from './crmRecord.validator.js';

const nullableString = { type: 'string', nullable: true };

export const crmExtractionResponseSchema = {
  type: 'object',
  properties: {
    records: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          batchIndex: { type: 'integer' },
          created_at: nullableString,
          name: nullableString,
          email: nullableString,
          country_code: nullableString,
          mobile_without_country_code: nullableString,
          company: nullableString,
          city: nullableString,
          state: nullableString,
          country: nullableString,
          lead_owner: nullableString,
          crm_status: { type: 'string', enum: CRM_STATUS_VALUES, nullable: true },
          crm_note: nullableString,
          // No '' here — Gemini rejects empty-string enum members.
          // "Unsure" is represented as null instead; normalized to '' downstream.
          data_source: { type: 'string', enum: DATA_SOURCE_VALUES, nullable: true },
          possession_time: nullableString,
          description: nullableString,
        },
        required: [
          'batchIndex', 'created_at', 'name', 'email', 'country_code',
          'mobile_without_country_code', 'company', 'city', 'state',
          'country', 'lead_owner', 'crm_status', 'crm_note', 'data_source',
          'possession_time', 'description',
        ],
      },
    },
  },
  required: ['records'],
};