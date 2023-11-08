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

const CommonEntityFields = z.object({
    type: z.string(),
    field: z.string(),
    label: z.string(),
    options: z.object({ text: z.string(), link: z.string() }),
    help: z.string().optional(),
    tooltip: z.string().optional(),
});

const CommonEditableEntityFields = CommonEntityFields.extend({
    required: z.boolean().default(false),
    encrypted: z.boolean().default(false),
});

const CommonEditableEntityOptions = z.object({});

export const LinkEntity = CommonEntityFields.extend({
    type: z.literal('helpLink'),
    label: z.string().optional(),
    options: z.object({ text: z.string(), link: z.string() }),
});

export type LinkEntity = z.infer<typeof LinkEntity>;

const AllValidators = z.array(
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
export const TextEntity = z.object({
    type: z.literal('text'),
    field: z.string(),
    label: z.string(),
    validators: AllValidators,
    options: CommonEditableEntityOptions.extend({}),
    help: z.string().optional(),
    tooltip: z.string().optional(),
});
