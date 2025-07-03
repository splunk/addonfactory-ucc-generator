import { z } from 'zod';
import {
    AllValidators,
    CommonEditableEntityOptions,
    ModifyFieldsOnValue,
    PlatformEnum,
    StringOrTextWithLinks,
} from './baseSchemas';

export const oAuthFieldSchema = z
    .object({
        oauth_field: z.string().optional(), // Optional field to indicate this is an OAuth field
        label: z.string(),
        field: z.string(),
        type: z.literal('text').default('text').optional(),
        help: StringOrTextWithLinks.optional(),
        encrypted: z.boolean().default(false).optional(),
        required: z.boolean().default(false).optional(),
        defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
        options: CommonEditableEntityOptions.optional(),
        modifyFieldsOnValue: ModifyFieldsOnValue,
        validators: AllValidators.optional(),
    })
    .strict();

const OAuthOptionsBaseSchema = z.object({
    enable: z.boolean().optional(),
    display: z.boolean().optional(),
    disableonEdit: z.boolean().optional(),
    hideForPlatform: PlatformEnum.optional(),
    auth_type: z.array(
        z.union([
            z.enum(['basic', 'oauth', 'oauth_client_credentials']),
            z.object({
                value: z.string(),
                label: z.string(),
            }),
        ])
    ),
    basic: z.array(oAuthFieldSchema).optional(),
    oauth: z.array(oAuthFieldSchema).optional(),
    oauth_client_credentials: z.array(oAuthFieldSchema).optional(),
    auth_label: z.string().optional(),
    oauth_popup_width: z.number().optional(),
    oauth_popup_height: z.number().optional(),
    oauth_timeout: z.number().optional(),
    auth_code_endpoint: z.string().optional(),
    access_token_endpoint: z.string().optional(),
    oauth_state_enabled: z.boolean().optional(),
    auth_endpoint_token_access_type: z.string().optional(),
});

export const OAuthOptionsSchema = OAuthOptionsBaseSchema.and(
    z.record(z.string(), z.array(oAuthFieldSchema))
);
// .superRefine((data, ctx) => {
//     // Validate additional properties that are not in the base schema
//     const baseKeys = new Set(Object.keys(OAuthOptionsBaseSchema.shape));

//     Object.entries(data).forEach(([key, value]) => {
//         if (!baseKeys.has(key) && value !== undefined) {
//             // Check if the additional property is an array of oAuthFieldSchema
//             const result = z.array(oAuthFieldSchema).safeParse(value);
//             if (!result.success) {
//                 ctx.addIssue({
//                     code: z.ZodIssueCode.custom,
//                     message: `Additional property "${key}" must be an array of oAuthFieldSchema`,
//                     path: [key],
//                 });
//             }
//         }
//     });
// });

export const oAuthEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('oauth'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: OAuthOptionsSchema,
}).strict();

export type OAuthEntity = z.TypeOf<typeof oAuthFieldSchema>;
