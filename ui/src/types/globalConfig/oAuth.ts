import { z } from 'zod';
import {
    AllValidators,
    CommonEditableEntityFields,
    CommonEditableEntityOptions,
    ModifyFieldsOnValue,
    StringOrTextWithLinks,
} from './baseSchemas';

import { RegexValidator, StringValidator } from './validators';
import { OAuthEntityInterface, OAuthFieldInterface } from './interface';

// ----------------------------
// Field Schema + Type
// ----------------------------
export const oAuthFieldSchema = z.object({
    oauth_field: z.string(),
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
});
export const OAuthField = oAuthFieldSchema satisfies z.ZodType<OAuthFieldInterface>;
export type OAuthFieldType = z.infer<typeof oAuthFieldSchema>;

// ----------------------------
// Entity Schema + Type
// ----------------------------
export const oAuthEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('oauth'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.omit({ requiredWhenVisible: true }).extend({
        auth_type: z.array(z.enum(['basic', 'oauth', 'oauth_client_credentials'])),
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
    }),
}).strict();

export const OAuthEntity = oAuthEntitySchema satisfies z.ZodType<OAuthEntityInterface>;
export type OAuthEntityType = z.infer<typeof oAuthEntitySchema>;
