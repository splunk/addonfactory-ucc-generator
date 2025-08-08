import { z } from 'zod';
import { NumberValidator, RegexValidator, StringValidator } from './validators';

import {
    AllValidators,
    CommonEditableEntityFields,
    CommonEditableEntityOptions,
    CommonEntityFields,
    CustomComponent,
    ModifyFieldsOnValue,
    PlatformEnum,
    StringOrTextWithLinks,
    TextElementWithLinksSchema,
    ValueLabelPair,
} from './baseSchemas';
import { oAuthFieldSchema, OAuthOptionsBaseSchema } from './oAuth';

const DefaultValueUnion = z.union([z.string(), z.number(), z.boolean()]);

// Reusable checkbox configuration schema
const CheckboxConfigSchema = z
    .object({
        label: z.string().optional(),
        defaultValue: z.boolean().optional(),
    })
    .strict();

// Reusable group options schema for checkbox components
const GroupOptionsSchema = z
    .object({
        isExpandable: z.boolean().optional(),
        expand: z.boolean().optional(),
    })
    .strict();

// Base schema for grouped components
const BaseGroupSchema = z
    .object({
        label: z.string(),
        fields: z.array(z.string()),
        options: GroupOptionsSchema.optional(),
    })
    .strict();

export const LinkEntitySchema = z
    .object({
        type: z.literal('helpLink'),
        field: z.string(),
        label: z.string().optional(),
        help: StringOrTextWithLinks.optional(),
        tooltip: z.string().optional(),
        required: z.literal(false).default(false).optional(),
        options: TextElementWithLinksSchema.extend({
            hideForPlatform: PlatformEnum.optional(),
            display: z.boolean().default(true).optional(),
        }),
    })
    .strict();

export const TextEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('text'),
    validators: AllValidators.optional(),
    defaultValue: DefaultValueUnion.optional(),
    options: CommonEditableEntityOptions.optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const TextAreaEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('textarea'),
    validators: AllValidators.optional(),
    defaultValue: z.string().optional(),
    options: CommonEditableEntityOptions.extend({
        rowsMin: z.number().optional(),
        rowsMax: z.number().optional(),
    }).optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const CheckboxEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('checkbox'),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const RadioEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('radio'),
    defaultValue: z.string().optional(),
    options: CommonEditableEntityOptions.extend({
        items: z.array(ValueLabelPair),
    }),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

const AutoCompleteFields = z.array(
    z.union([
        ValueLabelPair,
        z
            .object({
                label: z.string(),
                children: z.array(ValueLabelPair),
            })
            .strict(),
    ])
);

export const SelectCommonOptions = CommonEditableEntityOptions.extend({
    disableSearch: z.boolean().default(false).optional(),
    createSearchChoice: z.boolean().default(false).optional(),
    referenceName: z.string().optional(),
    endpointUrl: z.string().optional(),
    allowList: z.string().optional(),
    denyList: z.string().optional(),
    labelField: z.string().optional(),
    valueField: z.string().optional(),
    autoCompleteFields: AutoCompleteFields.optional(),
    dependencies: z.array(z.string()).optional(),
    items: ValueLabelPair.array().optional(),
    hideClearBtn: z.boolean().optional(),
});

export const SingleSelectEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('singleSelect'),
    validators: AllValidators.optional(),
    defaultValue: DefaultValueUnion.optional(),
    options: SelectCommonOptions,
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const MultipleSelectCommonOptions = SelectCommonOptions.extend({
    delimiter: z.string().length(1).optional(),
});

export const MultipleSelectEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('multipleSelect'),
    validators: AllValidators.optional(),
    defaultValue: z.string().optional(),
    options: MultipleSelectCommonOptions,
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

const CheckboxGroupRowSchema = z
    .object({
        field: z.string(),
        checkbox: CheckboxConfigSchema.optional(),
        input: z
            .object({
                defaultValue: z.number().optional(),
                validators: z.tuple([NumberValidator]).optional(),
                required: z.boolean().optional(),
            })
            .strict()
            .optional(),
    })
    .strict();

const CheckboxGroupOptionsSchema = CommonEditableEntityOptions.extend({
    delimiter: z.string().max(20).optional(),
    groups: z.array(BaseGroupSchema).optional(),
    rows: z.array(CheckboxGroupRowSchema),
}).strict();

export const CheckboxGroupEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('checkboxGroup'),
    validators: z.tuple([RegexValidator]).optional(),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CheckboxGroupOptionsSchema,
}).strict();

const CheckboxTreeRowSchema = z
    .object({
        field: z.string(),
        checkbox: CheckboxConfigSchema.optional(),
    })
    .strict();

const CheckboxTreeOptionsSchema = CommonEditableEntityOptions.extend({
    delimiter: z.string().max(20).optional(),
    groups: z.array(BaseGroupSchema).optional(),
    rows: z.array(CheckboxTreeRowSchema),
}).strict();

export const CheckboxTreeEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('checkboxTree'),
    validators: z.tuple([RegexValidator]).optional(),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CheckboxTreeOptionsSchema,
}).strict();

export const FileEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('file'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.extend({
        maxFileSize: z.number().optional(),
        fileSupportMessage: z.string().optional(),
        supportedFileTypes: z.array(z.string()),
        useBase64Encoding: z.boolean().default(false).optional(),
    }).optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const CustomEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('custom'),
    options: CustomComponent.extend({
        hideForPlatform: PlatformEnum.optional(),
    }).strict(),
}).strict();

export const SingleSelectSplunkSearchEntitySchema = CommonEntityFields.extend({
    type: z.literal('singleSelectSplunkSearch'),
    defaultValue: DefaultValueUnion.optional(),
    search: z.string().optional(),
    valueField: z.string().optional(),
    labelField: z.string().optional(),
    options: z
        .object({
            items: z.array(ValueLabelPair),
        })
        .optional(),
    required: z.boolean().default(false).optional(),
}).strict();

export const StrictIndexEntitySchema = z
    .object({
        type: z.literal('index'),
        field: z.string(),
        label: z.string(),
        defaultValue: z.string().optional(),
        help: z.any().optional(),
        required: z.boolean().optional(),
    })
    .strict();

export const StrictIntervalEntitySchema = z
    .object({
        type: z.literal('interval'),
        field: z.string(),
        label: z.string(),
        defaultValue: z.union([z.number(), z.string()]).optional(),
        options: z
            .object({
                range: z.array(z.union([z.string(), z.number()])),
            })
            .optional(),
        help: z.string().optional(),
        tooltip: z.string().optional(),
        required: z.boolean().optional(),
    })
    .strict();

export const OAuthAcceptableTypes = z.union([
    oAuthFieldSchema,
    LinkEntitySchema,
    TextEntitySchema,
    TextAreaEntitySchema,
    SingleSelectEntitySchema,
    MultipleSelectEntitySchema,
    CheckboxEntitySchema,
    CheckboxGroupEntitySchema,
    CheckboxTreeEntitySchema,
    RadioEntitySchema,
    FileEntitySchema,
]);

const OAuthOptionsSchemaWithEntities = OAuthOptionsBaseSchema.extend({
    basic: z.array(OAuthAcceptableTypes).optional(),
    oauth: z.array(OAuthAcceptableTypes).optional(),
    oauth_client_credentials: z.array(OAuthAcceptableTypes).optional(),
}).passthrough();

export const oAuthEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('oauth'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: OAuthOptionsSchemaWithEntities,
}).strict();

export const AnyOfEntitySchema = z.discriminatedUnion('type', [
    LinkEntitySchema.strict(),
    TextEntitySchema.strict(),
    TextAreaEntitySchema.strict(),
    SingleSelectEntitySchema.strict(),
    MultipleSelectEntitySchema.strict(),
    CheckboxEntitySchema.strict(),
    CheckboxGroupEntitySchema.strict(),
    CheckboxTreeEntitySchema.strict(),
    RadioEntitySchema.strict(),
    FileEntitySchema.strict(),
    oAuthEntitySchema.strict(),
    CustomEntitySchema.strict(),
]);

export type OAuthEntity = z.TypeOf<typeof OAuthAcceptableTypes>;
