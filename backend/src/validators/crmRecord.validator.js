import { z } from 'zod';

// Fixed target CRM schema — enum values as specified by the assignment.
export const CRM_STATUS_VALUES = [
    'GOOD_LEAD_FOLLOW_UP',
    'DID_NOT_CONNECT',
    'BAD_LEAD',
    'SALE_DONE',
];

export const DATA_SOURCE_VALUES = [
    'leads_on_demand',
    'meridian_tower',
    'eden_park',
    'varah_swamy',
    'sarjapur_plots',
];

const nullableTrimmedString = z.string().trim().nullable();

export const CrmRecordSchema = z.object({
    batchIndex: z.number().int().nonnegative(),
    created_at: z
        .string()
        .nullable()
        .refine(
            (value) => value === null || value === '' || !Number.isNaN(Date.parse(value)),
            { message: 'created_at must be a valid date parseable by JavaScript Date' }
        ),

    name: nullableTrimmedString,
    email: nullableTrimmedString,
    country_code: nullableTrimmedString,
    mobile_without_country_code: nullableTrimmedString,
    company: nullableTrimmedString,
    city: nullableTrimmedString,
    state: nullableTrimmedString,
    country: nullableTrimmedString,
    lead_owner: nullableTrimmedString,
    crm_status: z.enum(CRM_STATUS_VALUES).nullable(),
    crm_note: nullableTrimmedString,
    data_source: z.union([z.enum(DATA_SOURCE_VALUES), z.literal('')]).nullable(),
    possession_time: nullableTrimmedString,
    description: nullableTrimmedString,
});

export const ExtractionBatchResponseSchema = z.object({
    records: z.array(CrmRecordSchema),
});