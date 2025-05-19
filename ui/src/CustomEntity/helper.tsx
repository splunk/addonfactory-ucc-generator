import { StringOrTextWithLinks } from '../types/globalConfig/interface';
import { SingleSelectEntitySchema, TextEntitySchema } from '../types/globalConfig/entities';

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
    options: {
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
export const migrateIntervalTypeEntity = (input: IntervalEntity): MigratedIntervalTextEntity => {
    const validators: MigratedIntervalTextEntity['validators'] = [
        {
            type: 'regex',
            pattern: CRON_REGEX,
            errorMsg: `${input.label} must be either a non-negative number, CRON interval or -1.`,
        },
    ];

    // Add range validator if defined
    if (input.options?.range?.length === 2) {
        const [minRaw, maxRaw] = input.options.range;
        const min = Number(minRaw);
        const max = Number(maxRaw);

        validators.push({
            type: 'number',
            range: [min, max],
            errorMsg: `${input.label} must be between ${min} and ${max}`,
        });
    }

    // Build and return the migrated entity
    return {
        type: 'text',
        field: input.field,
        label: input.label,
        defaultValue: input.defaultValue,
        help: input.help,
        tooltip: input.tooltip,
        required: input.required,
        validators,
    };
};

/**
 * Converts an IndexEntity to a validated SingleSelectEntitySchema.
 * Includes regex and string length validation.
 */
export const migrateIndexTypeEntity = (input: IndexEntity): SingleSelectEntitySchema => {
    const validators: SingleSelectEntitySchema['validators'] = [
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
    ];

    // Build and return the migrated entity
    return {
        type: 'singleSelect',
        field: input.field,
        label: input.label,
        defaultValue: input.defaultValue ?? 'default',
        required: input.required,
        help: typeof input.help === 'string' ? { text: input.help } : input.help,
        options: {
            endpointUrl: 'data/indexes?search=isInternal=0+disabled=0',
            denyList: '^_.*$', // Exclude internal indexes
            createSearchChoice: true,
        },
        validators,
    };
};
