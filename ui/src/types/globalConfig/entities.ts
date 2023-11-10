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

const ValueLabelPair = z
    .object({
        value: z.union([z.number(), z.string(), z.boolean()]),
        label: z.string(),
    })
    .strict(); // strict() ensures no additional properties

const CommonEntityFields = z.object({
    type: z.string(),
    field: z.string(),
    label: z.string(),
    help: z.string().optional(),
    tooltip: z.string().optional(),
});

const CommonEditableEntityFields = CommonEntityFields.extend({
    required: z.boolean().default(false),
    encrypted: z.boolean().default(false),
});

const CommonEditableEntityOptions = z.object({
    placeholder: z.string().optional(),
    display: z.boolean().default(true),
    disableonEdit: z.boolean().default(false),
    enable: z.boolean().default(true),
});

const AllValidators = z
    .array(
        z.union([
            NumberValidator,
            StringValidator,
            RegexValidator,
            EmailValidator,
            Ipv4Validator,
            UrlValidator,
            DateValidator,
        ])
    )
    .nonempty();

export const LinkEntity = CommonEntityFields.extend({
    type: z.literal('helpLink'),
    label: z.string().optional(),
    options: z.object({ text: z.string(), link: z.string() }),
});

export type LinkEntity = z.infer<typeof LinkEntity>;

export const TextEntity = CommonEditableEntityFields.extend({
    type: z.literal('text'),
    validators: AllValidators.optional(),
    defaultValue: z.union([z.string(), z.number()]).optional(),
    options: CommonEditableEntityOptions.optional(),
});

export const TextAreaEntity = CommonEditableEntityFields.extend({
    type: z.literal('textarea'),
    validators: AllValidators.optional(),
    defaultValue: z.string().optional(),
    options: CommonEditableEntityOptions.extend({
        rowsMin: z.number().optional(),
        rowsMax: z.number().optional(),
    }).optional(),
});

const AutoCompleteFields = z.array(
    z.union([
        ValueLabelPair,
        z.object({
            label: z.string(),
            children: z.array(ValueLabelPair),
        }),
    ])
);

const SelectCommonOptions = CommonEditableEntityOptions.extend({
    createSearchChoice: z.boolean().optional(),
    referenceName: z.string().optional(),
    endpointUrl: z.string().optional(),
    allowList: z.string().optional(),
    denyList: z.string().optional(),
    labelField: z.string().optional(),
    autoCompleteFields: AutoCompleteFields,
    dependencies: z.set(z.string()).optional(),
    items: ValueLabelPair.array().optional(),
});
export const SingleSelectEntity = CommonEditableEntityFields.extend({
    type: z.literal('singleSelect'),
    validators: AllValidators.optional(),
    defaultValue: z.union([z.string(), z.number()]).optional(),
    options: SelectCommonOptions,
});

export const MultipleSelectEntity = CommonEditableEntityFields.extend({
    type: z.literal('multipleSelect'),
    validators: AllValidators.optional(),
    defaultValue: z.string(),
    options: SelectCommonOptions.extend({
        delimiter: z.string().length(1),
    }),
});

export const CheckboxEntity = CommonEditableEntityFields.extend({
    type: z.literal('checkbox'),
    defaultValue: z.union([z.number(), z.boolean()]),
    options: CommonEditableEntityOptions.omit({ placeholder: true }),
});

export const CheckboxGroupEntity = CommonEditableEntityFields.extend({
    type: z.literal('checkboxGroup'),
    validators: z.tuple([RegexValidator]).optional(),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.omit({ placeholder: true }).extend({
        groups: z
            .array(
                z.object({
                    label: z.string(),
                    fields: z.set(z.string()),
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
});

export const RadioEntity = CommonEditableEntityFields.extend({
    type: z.literal('radio'),
    defaultValue: z.string().optional(),
    options: CommonEditableEntityOptions.extend({
        items: z.array(ValueLabelPair),
    }),
});

export const FileEntity = CommonEditableEntityFields.extend({
    type: z.literal('file'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.omit({ placeholder: true }).extend({
        maxFileSize: z.number().optional(),
        fileSupportMessage: z.string().optional(),
        supportedFileTypes: z.set(z.string()),
    }),
});

const OAuthFields = z
    .object({
        oauth_field: z.string(),
        label: z.string(),
        field: z.string(),
        help: z.string(),
        encrypted: z.boolean(),
        required: z.boolean(),
        options: z.object({
            placeholder: z.string().optional(),
        }),
    })
    .partial();
export const OAuthEntity = CommonEditableEntityFields.extend({
    type: z.literal('oauth'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.omit({ placeholder: true }).extend({
        auth_type: z.set(z.union([z.literal('basic'), z.literal('oauth')])),
        basic: z.array(OAuthFields).optional(),
        oauth: z.array(OAuthFields).optional(),
        auth_label: z.string(),
        oauth_popup_width: z.number(),
        oauth_popup_height: z.number(),
    }),
});
