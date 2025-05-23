import { z } from 'zod';

export const NumberValidator = z.object({
    errorMsg: z.string().optional(),
    type: z.literal('number'),
    range: z.tuple([z.number(), z.number()]),
    isInteger: z.boolean().optional(),
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

// Infer types from Zod validators
export type NumberValidatorType = z.infer<typeof NumberValidator>;
export type StringValidatorType = z.infer<typeof StringValidator>;
export type RegexValidatorType = z.infer<typeof RegexValidator>;
export type EmailValidatorType = z.infer<typeof EmailValidator>;
export type Ipv4ValidatorType = z.infer<typeof Ipv4Validator>;
export type UrlValidatorType = z.infer<typeof UrlValidator>;
export type DateValidatorType = z.infer<typeof DateValidator>;

export const AnyOfValidators = z.discriminatedUnion('type', [
    NumberValidator,
    StringValidator,
    RegexValidator,
    EmailValidator,
    Ipv4Validator,
    UrlValidator,
    DateValidator,
]);
