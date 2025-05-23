import { z } from 'zod';
import {
    AllValidators,
    CommonEditableEntityFields,
    CommonEditableEntityOptions,
    ModifyFieldsOnValue,
    StringOrTextWithLinks,
} from './baseSchemas';

import { OAuthEntityInterface, OAuthFieldInterface } from './interface';
import { RegexValidator, StringValidator } from './validators';

export const OAuthFieldsSchema = z.object({
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

export const OAuthFields = OAuthFieldsSchema satisfies z.ZodType<OAuthFieldInterface>;

export const OAuthEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('oauth'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.omit({
        requiredWhenVisible: true,
    }).extend({
        auth_type: z.array(
            z.union([z.literal('basic'), z.literal('oauth'), z.literal('oauth_client_credentials')])
        ),
        basic: z.array(OAuthFields).optional(),
        oauth: z.array(OAuthFields).optional(),
        oauth_client_credentials: z.array(OAuthFields).optional(),
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

export interface OAuthEntitySchema extends z.infer<typeof OAuthEntity> {}
export const OAuthEntity = OAuthEntitySchema satisfies z.ZodType<OAuthEntityInterface>;
