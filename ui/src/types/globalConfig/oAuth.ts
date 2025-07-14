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
        oauth_field: z.string(), // Optional field to indicate this is an OAuth field
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

export const OAuthOptionsBaseSchema = z.object({
    enable: z.boolean().optional(),
    display: z.boolean().optional(),
    disableonEdit: z.boolean().optional(),
    hideForPlatform: PlatformEnum.optional(),
    auth_type: z.array(
        z.union([z.enum(['basic', 'oauth', 'oauth_client_credentials']), z.string()])
    ),
    oauth_type_labels: z
        .object({
            basic: z.string().optional(),
            oauth: z.string().optional(),
            oauth_client_credentials: z.string().optional(),
        })
        .catchall(z.string())
        .optional(),
    auth_label: z.string().optional(),
    oauth_popup_width: z.number().optional(),
    oauth_popup_height: z.number().optional(),
    oauth_timeout: z.number().optional(),
    auth_code_endpoint: z.string().optional(),
    access_token_endpoint: z.string().optional(),
    oauth_state_enabled: z.boolean().optional(),
    auth_endpoint_token_access_type: z.string().optional(),
});
