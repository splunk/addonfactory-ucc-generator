import { z } from 'zod';
import {
    SingleSelectEntitySchema,
    StrictIndexEntitySchema,
    StrictIntervalEntitySchema,
    TextEntitySchema,
} from '../types/globalConfig/entities';

export type TextEntityType = z.TypeOf<typeof TextEntitySchema>;

// Regex for CRON expressions or numeric values including -1 (disabled interval)
const CRON_REGEX =
    '^(\\-?\\d+|(@\\w+)|((\\d+|\\*)\\s+(\\d+|\\*)\\s+(\\d+|\\*)\\s+(\\d+|\\*)\\s+(\\d+|\\*)))$';

/**
 * Text entity schema extended with required validators.
 * Used as the result of interval-to-text migration.
 */
export interface MigratedIntervalTextEntity extends Omit<TextEntityType, 'validators'> {
    validators: NonNullable<TextEntityType['validators']>;
}

/**
 * Converts an IntervalEntity to a validated TextEntitySchema.
 * Adds regex validation for CRON and optional range validation.
 */
export const migrateIntervalTypeEntity = (
    input: z.infer<typeof StrictIntervalEntitySchema>,
    index: number
): MigratedIntervalTextEntity => {
    const result = StrictIntervalEntitySchema.safeParse(input);
    if (!result.success) {
        const entityName = `type: ${input?.type} (Entity #${index + 1})`;
        const errors = result.error.issues
            .map((issue) => {
                const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
                return `• ${path}: ${issue.message}`;
            })
            .join('\n');

        throw new Error(`"${entityName}" validation failed:\n${errors}`);
    }

    const validatedInput = result.data;

    const validators: NonNullable<TextEntityType['validators']> = [
        {
            type: 'regex',
            pattern: CRON_REGEX,
            errorMsg: `${validatedInput.label} must be either a non-negative number, CRON interval or -1.`,
        },
    ];

    if (validatedInput.options?.range?.length === 2) {
        const [minRaw, maxRaw] = validatedInput.options.range;
        const min = Number(minRaw);
        const max = Number(maxRaw);
        validators.push({
            type: 'number',
            range: [min, max],
            errorMsg: `${validatedInput.label} must be between ${min} and ${max}`,
        });
    }

    return {
        type: 'text',
        field: validatedInput.field,
        label: validatedInput.label,
        defaultValue: validatedInput.defaultValue,
        help: validatedInput.help,
        tooltip: validatedInput.tooltip,
        required: validatedInput.required,
        validators,
    };
};

/**
 * Converts an IndexEntity to a validated SingleSelectEntitySchema.
 * Includes regex and string length validation.
 */
export const migrateIndexTypeEntity = (
    input: z.TypeOf<typeof StrictIndexEntitySchema>,
    index: number
): z.TypeOf<typeof SingleSelectEntitySchema> => {
    const result = StrictIndexEntitySchema.safeParse(input);
    if (!result.success) {
        const entityName = `type: ${input?.type} (Entity #${index + 1})`;
        const errors = result.error.issues
            .map((issue) => {
                const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
                return `• ${path}: ${issue.message}`;
            })
            .join('\n');

        throw new Error(`"${entityName}" validation failed:\n${errors}`);
    }

    const validatedInput = result.data;

    return {
        type: 'singleSelect',
        field: validatedInput.field,
        label: validatedInput.label,
        defaultValue: validatedInput.defaultValue ?? 'default',
        required: validatedInput.required,
        help:
            typeof validatedInput.help === 'string'
                ? { text: validatedInput.help }
                : validatedInput.help,
        options: {
            endpointUrl: 'data/indexes?search=isInternal=0+disabled=0',
            denyList: '^_.*$',
            createSearchChoice: true,
        },
        validators: [
            {
                type: 'regex',
                pattern: '^[a-zA-Z0-9][a-zA-Z0-9\\_\\-]*$',
                errorMsg:
                    'Index names must begin with a letter or a number and must contain only letters, numbers, underscores or hyphens.',
            },
            {
                type: 'string',
                minLength: 1,
                maxLength: 80,
                errorMsg: 'Length of index name should be between 1 and 80.',
            },
        ],
    };
};
