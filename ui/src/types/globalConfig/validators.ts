import { z } from 'zod';

export const NumberValidator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('number'),
    range: z.array(z.number()),
});
export const StringValidator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('string'),
    minLength: z.number().gte(0),
    maxLength: z.number().gte(0),
});
export const RegexValidator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('regex'),
    pattern: z.string(),
});
export const EmailValidator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('email'),
});
export const Ipv4Validator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('ipv4'),
});
export const UrlValidator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('url'),
});
export const DateValidator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('date'),
});
