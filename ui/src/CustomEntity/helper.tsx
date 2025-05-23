import { z } from 'zod';
import { StringOrTextWithLinks } from '../types/globalConfig/interface';
import {
    SingleSelectEntitySchema,
    StrictIndexEntitySchema,
    StrictIntervalEntitySchema,
    TextEntitySchema,
} from '../types/globalConfig/entities';

/**
 * Represents a special field that maps to an index selection component.
 */
export interface IndexEntity {
    type: 'index';
    field: string;
    label: string;
    defaultValue?: string;
    help?: StringOrTextWithLinks;
    required?: boolean;
}

/**
 * Represents an interval configuration field which accepts numeric or CRON values.
 */
export interface IntervalEntity {
    type: 'interval';
    field: string;
    label: string;
    defaultValue?: number | string;
    options?: {
        range: Array<number | string>;
    };
    help?: string;
    tooltip?: string;
    required?: boolean;
}

// Regex for CRON expressions or numeric values including -1 (disabled interval)
const CRON_REGEX =
    '^(\\-?\\d+|(@\\w+)|((\\d+|\\*)\\s+(\\d+|\\*)\\s+(\\d+|\\*)\\s+(\\d+|\\*)\\s+(\\d+|\\*)))$';

/**
 * Text entity schema extended with required validators.
 * Used as the result of interval-to-text migration.
 */
export interface MigratedIntervalTextEntity extends Omit<TextEntitySchema, 'validators'> {
    validators: NonNullable<TextEntitySchema['validators']>;
}

/**
 * Converts an IntervalEntity to a validated TextEntitySchema.
 * Adds regex validation for CRON and optional range validation.
 */
export const migrateIntervalTypeEntity = (
    input: IntervalEntity
): z.infer<typeof TextEntitySchema> => {
    const result = StrictIntervalEntitySchema.safeParse(input);
    if (!result.success) {
        throw new Error(
            `Strict validation failed in IntervalEntity:\n${JSON.stringify(
                result.error.format(),
                null,
                2
            )}`
        );
    }

    const validatedInput = result.data;

    const validators: NonNullable<TextEntitySchema['validators']> = [
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

    const migrated = {
        type: 'text',
        field: validatedInput.field,
        label: validatedInput.label,
        defaultValue: validatedInput.defaultValue,
        help: validatedInput.help,
        tooltip: validatedInput.tooltip,
        required: validatedInput.required,
        validators,
    };

    const finalResult = TextEntitySchema.safeParse(migrated);
    if (!finalResult.success) {
        throw new Error(
            `Strict validation failed on migrated TextEntity:\n${JSON.stringify(
                finalResult.error.format(),
                null,
                2
            )}`
        );
    }

    return finalResult.data;
};

/**
 * Converts an IndexEntity to a validated SingleSelectEntitySchema.
 * Includes regex and string length validation.
 */
export const migrateIndexTypeEntity = (input: IndexEntity): SingleSelectEntitySchema => {
    const result = StrictIndexEntitySchema.safeParse(input);
    if (!result.success) {
        throw new Error(
            `Strict validation failed in IndexEntity:\n${JSON.stringify(
                result.error.format(),
                null,
                2
            )}`
        );
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
