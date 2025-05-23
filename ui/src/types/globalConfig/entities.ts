import { z } from 'zod';
import { NumberValidator, RegexValidator, StringValidator } from './validators';
import {
    CheckboxEntityInterface,
    CheckboxGroupEntityInterface,
    CheckboxTreeEntityInterface,
    CustomEntityInterface,
    FileEntityInterface,
    LinkEntityInterface,
    MultipleSelectEntityInterface,
    RadioEntityInterface,
    SingleSelectEntityInterface,
    SingleSelectSplunkSearchEntityInterface,
    TextAreaEntityInterface,
    TextEntityInterface,
} from './interface';
import { OAuthEntity, OAuthEntitySchema } from './oAuth';
import {
    AllValidators,
    CommonEditableEntityFields,
    CommonEditableEntityOptions,
    CommonEntityFields,
    ModifyFieldsOnValue,
    TextElementWithLinksSchema,
    ValueLabelPair,
} from './baseSchemas';

export const LinkEntitySchema = CommonEntityFields.extend({
    type: z.literal('helpLink'),
    label: z.string(),
    options: TextElementWithLinksSchema.extend({
        hideForPlatform: z.enum(['cloud', 'enterprise']).optional(),
    }).optional(),
    required: z.literal(false).default(false).optional(),
}).strict();

export const LinkEntity = LinkEntitySchema satisfies z.ZodType<LinkEntityInterface>;

export const TextEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('text'),
    validators: AllValidators.optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const TextEntity = TextEntitySchema satisfies z.ZodType<TextEntityInterface>;

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

export const TextAreaEntity = TextAreaEntitySchema satisfies z.ZodType<TextAreaEntityInterface>;

const AutoCompleteFields = z.array(
    z.union([
        ValueLabelPair,
        z.object({
            label: z.string(),
            children: z.array(ValueLabelPair),
        }),
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
});
export const SingleSelectEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('singleSelect'),
    validators: AllValidators.optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    options: SelectCommonOptions,
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const SingleSelectEntity =
    SingleSelectEntitySchema satisfies z.ZodType<SingleSelectEntityInterface>;

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

export const MultipleSelectEntity =
    MultipleSelectEntitySchema satisfies z.ZodType<MultipleSelectEntityInterface>;

export const CheckboxEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('checkbox'),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const CheckboxEntity = CheckboxEntitySchema satisfies z.ZodType<CheckboxEntityInterface>;

export const CheckboxGroupEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('checkboxGroup'),
    validators: z.tuple([RegexValidator]).optional(),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.extend({
        delimiter: z.string().length(20).optional(),
        groups: z
            .array(
                z.object({
                    label: z.string(),
                    fields: z.array(z.string()),
                    options: z
                        .object({
                            isExpandable: z.boolean().optional(),
                            expand: z.boolean().optional(),
                        })
                        .optional(),
                })
            )
            .optional(),
        rows: z.array(
            z.object({
                field: z.string(),
                checkbox: z
                    .object({
                        label: z.string().optional(),
                        defaultValue: z.boolean().optional(),
                    })
                    .optional(),
                input: z
                    .object({
                        defaultValue: z.number().optional(),
                        validators: z.tuple([NumberValidator]).optional(),
                        required: z.boolean().optional(),
                    })
                    .optional(),
            })
        ),
    }),
}).strict();

export const CheckboxGroupEntity =
    CheckboxGroupEntitySchema satisfies z.ZodType<CheckboxGroupEntityInterface>;

export const CheckboxTreeEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('checkboxTree'),
    validators: z.tuple([RegexValidator]).optional(),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.extend({
        delimiter: z.string().length(20).optional(),
        groups: z
            .array(
                z.object({
                    label: z.string(),
                    fields: z.array(z.string()),
                    options: z
                        .object({
                            isExpandable: z.boolean().optional(),
                            expand: z.boolean().optional(),
                        })
                        .optional(),
                })
            )
            .optional(),
        rows: z.array(
            z.object({
                field: z.string(),
                checkbox: z
                    .object({
                        label: z.string().optional(),
                        defaultValue: z.boolean().optional(),
                    })
                    .optional(),
            })
        ),
    }),
}).strict();

export const CheckboxTreeEntity =
    CheckboxTreeEntitySchema satisfies z.ZodType<CheckboxTreeEntityInterface>;

export const RadioEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('radio'),
    defaultValue: z.string().optional(),
    options: CommonEditableEntityOptions.extend({
        items: z.array(ValueLabelPair),
    }),
    modifyFieldsOnValue: ModifyFieldsOnValue,
}).strict();

export const RadioEntity = RadioEntitySchema satisfies z.ZodType<RadioEntityInterface>;

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

export const FileEntity = FileEntitySchema satisfies z.ZodType<FileEntityInterface>;

export const CustomEntitySchema = CommonEditableEntityFields.extend({
    type: z.literal('custom'),
    options: z.object({
        type: z.literal('external'),
        src: z.string(),
        hideForPlatform: z.enum(['cloud', 'enterprise']).optional(),
    }),
}).strict();

export const CustomEntity = CustomEntitySchema satisfies z.ZodType<CustomEntityInterface>;

// somewhat exceptional and used only in alerts
export const SingleSelectSplunkSearchEntitySchema = CommonEntityFields.extend({
    type: z.literal('singleSelectSplunkSearch'),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    search: z.string().optional(),
    valueField: z.string().optional(),
    labelField: z.string().optional(),
    options: z
        .object({
            items: z.array(ValueLabelPair),
        })
        .optional(),
});

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

export const SingleSelectSplunkSearchEntity =
    SingleSelectSplunkSearchEntitySchema satisfies z.ZodType<SingleSelectSplunkSearchEntityInterface>;

export interface LinkEntitySchema extends z.infer<typeof LinkEntity> {}
export interface TextEntitySchema extends z.infer<typeof TextEntity> {}
export interface TextAreaEntitySchema extends z.infer<typeof TextAreaEntity> {}
export interface SingleSelectEntitySchema extends z.infer<typeof SingleSelectEntity> {}
export interface MultipleSelectEntitySchema extends z.infer<typeof MultipleSelectEntity> {}
export interface CheckboxEntitySchema extends z.infer<typeof CheckboxEntity> {}
export interface CheckboxGroupEntitySchema extends z.infer<typeof CheckboxGroupEntity> {}
export interface CheckboxTreeEntitySchema extends z.infer<typeof CheckboxTreeEntity> {}
export interface RadioEntitySchema extends z.infer<typeof RadioEntity> {}
export interface FileEntitySchema extends z.infer<typeof FileEntity> {}

export interface CustomEntitySchema extends z.infer<typeof CustomEntity> {}

export type AnyOfEntity =
    | LinkEntitySchema
    | TextEntitySchema
    | TextAreaEntitySchema
    | SingleSelectEntitySchema
    | MultipleSelectEntitySchema
    | CheckboxEntitySchema
    | CheckboxGroupEntitySchema
    | CheckboxTreeEntitySchema
    | RadioEntitySchema
    | FileEntitySchema
    | OAuthEntitySchema
    | CustomEntitySchema;

export const AnyOfEntitySchema = z.discriminatedUnion('type', [
    LinkEntity,
    TextEntity,
    TextAreaEntity,
    SingleSelectEntity,
    MultipleSelectEntity,
    CheckboxEntity,
    CheckboxGroupEntity,
    CheckboxTreeEntity,
    RadioEntity,
    FileEntity,
    OAuthEntity,
    CustomEntity,
]);
