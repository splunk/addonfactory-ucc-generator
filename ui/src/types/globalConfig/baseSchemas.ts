import { z } from 'zod';
import {
    DateValidator,
    EmailValidator,
    Ipv4Validator,
    NumberValidator,
    RegexValidator,
    StringValidator,
    UrlValidator,
} from './validators';

export const ValueLabelPair = z.object({
    value: z.union([z.number(), z.string(), z.boolean()]),
    label: z.string(),
});

/**
 *
 * @param text - Text to be used for convertion into link
 * @param links - Links object to be mapped into the text
 * @param link - Link to be used for the whole text
 */
export const TextElementWithLinksSchema = z.object({
    text: z.string(),
    links: z
        .array(
            z.object({
                slug: z.string(),
                link: z.string(),
                linkText: z.string(),
            })
        )
        .optional(),
    link: z.string().optional(),
});

export const StringOrTextWithLinks = z.union([z.string(), TextElementWithLinksSchema]);

export const MarkdownMessageText = z.object({
    markdownType: z.literal('text'),
    text: z.string(),
    color: z.string().optional(),
});

export const MarkdownMessageHybrid = z.object({
    markdownType: z.literal('hybrid'),
    text: z.string(),
    token: z.string(),
    linkText: z.string(),
    link: z.string(),
});

export const MarkdownMessageLink = z.object({
    markdownType: z.literal('link'),
    text: z.string(),
    link: z.string(),
});

export const MarkdownMessagePlaintext = z.object({
    markdownType: z.undefined().optional(),
    text: z.string(),
});

export const CommonEntityFields = z.object({
    type: z.string(),
    field: z.string(),
    label: z.string(),
    help: StringOrTextWithLinks.optional(),
    tooltip: z.string().optional(),
});

export const CommonEditableEntityFields = CommonEntityFields.extend({
    required: z.boolean().default(false).optional(),
    encrypted: z.boolean().default(false).optional(),
});

export const CommonEditableEntityOptions = z.object({
    display: z.boolean().default(true).optional(),
    disableonEdit: z.boolean().default(false).optional(),
    enable: z.boolean().default(true).optional(),
    requiredWhenVisible: z.boolean().default(false).optional(),
    hideForPlatform: z.enum(['cloud', 'enterprise']).optional(),
});

export const MarkdownMessageType = z.union([
    MarkdownMessageText,
    MarkdownMessageHybrid,
    MarkdownMessageLink,
    MarkdownMessagePlaintext,
]);

export const FieldToModify = z.object({
    fieldValue: z.union([z.number(), z.string(), z.boolean()]),
    mode: z.enum(['create', 'edit', 'config', 'clone']).optional(),
    fieldsToModify: z.array(
        z.object({
            fieldId: z.string(),
            display: z.boolean().optional(),
            value: z.union([z.number(), z.string(), z.boolean()]).optional(),
            disabled: z.boolean().optional(),
            required: z.boolean().optional(),
            help: StringOrTextWithLinks.optional(),
            label: z.string().optional(),
            markdownMessage: MarkdownMessageType.optional(),
        })
    ),
});

export const ModifyFieldsOnValue = z.array(FieldToModify).optional();

export const AllValidators = z.array(
    z.union([
        NumberValidator,
        StringValidator,
        RegexValidator,
        EmailValidator,
        Ipv4Validator,
        UrlValidator,
        DateValidator,
    ])
);
