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

const ValueLabelPair = z.object({
    value: z.union([z.number(), z.string(), z.boolean()]),
    label: z.string(),
});

const MarkdownMessageText = z.object({
    markdownType: z.literal('text'),
    text: z.string(),
    color: z.string().optional(),
});

const MarkdownMessageHybrid = z.object({
    markdownType: z.literal('hybrid'),
    text: z.string(),
    token: z.string(),
    linkText: z.string(),
    link: z.string(),
});

const MarkdownMessageLink = z.object({
    markdownType: z.literal('link'),
    text: z.string(),
    link: z.string(),
});

const MarkdownMessagePlaintext = z.object({
    markdownType: z.undefined().optional(),
    text: z.string(),
});

const CommonEntityFields = z.object({
    type: z.string(),
    field: z.string(),
    label: z.string(),
    help: z.string().optional(),
    tooltip: z.string().optional(),
});

const CommonEditableEntityFields = CommonEntityFields.extend({
    required: z.boolean().default(false).optional(),
    encrypted: z.boolean().default(false).optional(),
});

const CommonEditableEntityOptions = z.object({
    placeholder: z.string().optional(),
    display: z.boolean().default(true).optional(),
    disableonEdit: z.boolean().default(false).optional(),
    enable: z.boolean().default(true).optional(),
    requiredWhenVisible: z.boolean().default(false).optional(),
});

const FieldToModify = z.object({
    fieldValue: z.union([z.number(), z.string(), z.boolean()]),
    mode: z.enum(['create', 'edit', 'config', 'clone']).optional(),
    fieldsToModify: z.array(
        z.object({
            fieldId: z.string(),
            display: z.boolean().optional(),
            defaultValue: z.union([z.number(), z.string(), z.boolean()]).optional(),
            value: z.union([z.number(), z.string(), z.boolean()]).optional(),
            disabled: z.boolean().optional(),
            required: z.boolean().optional(),
            help: z.string().optional(),
            label: z.string().optional(),
            markdownMessage: z
                .union([
                    MarkdownMessageText,
                    MarkdownMessageHybrid,
                    MarkdownMessageLink,
                    MarkdownMessagePlaintext,
                ])
                .optional(),
        })
    ),
});

const ModifyFieldsOnValue = z.array(FieldToModify).optional();

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
    required: z.literal(false).default(false).optional(),
});

export type LinkEntity = z.infer<typeof LinkEntity>;

export const TextEntity = CommonEditableEntityFields.extend({
    type: z.literal('text'),
    validators: AllValidators.optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
});

export const TextAreaEntity = CommonEditableEntityFields.extend({
    type: z.literal('textarea'),
    validators: AllValidators.optional(),
    defaultValue: z.string().optional(),
    options: CommonEditableEntityOptions.extend({
        rowsMin: z.number().optional(),
        rowsMax: z.number().optional(),
    }).optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
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
    disableSearch: z.boolean().default(false).optional(),
    createSearchChoice: z.boolean().default(false).optional(),
    referenceName: z.string().optional(),
    endpointUrl: z.string().optional(),
    allowList: z.string().optional(),
    denyList: z.string().optional(),
    labelField: z.string().optional(),
    autoCompleteFields: AutoCompleteFields.optional(),
    dependencies: z.array(z.string()).optional(),
    items: ValueLabelPair.array().optional(),
});
export const SingleSelectEntity = CommonEditableEntityFields.extend({
    type: z.literal('singleSelect'),
    validators: AllValidators.optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    options: SelectCommonOptions,
    modifyFieldsOnValue: ModifyFieldsOnValue,
});

export const MultipleSelectEntity = CommonEditableEntityFields.extend({
    type: z.literal('multipleSelect'),
    validators: AllValidators.optional(),
    defaultValue: z.string().optional(),
    options: SelectCommonOptions.extend({
        delimiter: z.string().length(1).optional(),
    }),
    modifyFieldsOnValue: ModifyFieldsOnValue,
});

export const CheckboxEntity = CommonEditableEntityFields.extend({
    type: z.literal('checkbox'),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.omit({ placeholder: true }).optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
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
});

export const RadioEntity = CommonEditableEntityFields.extend({
    type: z.literal('radio'),
    defaultValue: z.string().optional(),
    options: CommonEditableEntityOptions.extend({
        items: z.array(ValueLabelPair),
    }),
    modifyFieldsOnValue: ModifyFieldsOnValue,
});

export const FileEntity = CommonEditableEntityFields.extend({
    type: z.literal('file'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.omit({ placeholder: true })
        .extend({
            maxFileSize: z.number().optional(),
            fileSupportMessage: z.string().optional(),
            supportedFileTypes: z.array(z.string()),
        })
        .optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
});

export const OAuthFields = z.object({
    oauth_field: z.string(),
    label: z.string(),
    field: z.string(),
    type: z.literal('text').default('text').optional(),
    help: z.string(),
    encrypted: z.boolean().default(false).optional(),
    required: z.boolean().default(false).optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    options: z
        .object({
            placeholder: z.string().optional(),
            disableonEdit: z.boolean().optional(),
            enable: z.boolean().default(true).optional(),
            display: z.literal(true).default(true).optional(),
            requiredWhenVisible: z.boolean().default(false).optional(),
        })
        .optional(),
    modifyFieldsOnValue: ModifyFieldsOnValue,
});

export const OAuthEntity = CommonEditableEntityFields.extend({
    type: z.literal('oauth'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.omit({
        placeholder: true,
        requiredWhenVisible: true,
    }).extend({
        auth_type: z.array(z.union([z.literal('basic'), z.literal('oauth')])),
        basic: z.array(OAuthFields).optional(),
        oauth: z.array(OAuthFields).optional(),
        auth_label: z.string().optional(),
        oauth_popup_width: z.number().optional(),
        oauth_popup_height: z.number().optional(),
        oauth_timeout: z.number().optional(),
        auth_code_endpoint: z.string().optional(),
        access_token_endpoint: z.string().optional(),
        oauth_state_enabled: z.boolean().optional(),
        auth_endpoint_token_access_type: z.string().optional(),
    }),
});

export const CustomEntity = CommonEditableEntityFields.extend({
    type: z.literal('custom'),
    options: z.object({
        type: z.literal('external'),
        src: z.string(),
    }),
});

// somewhat exceptional and used only in alerts
export const SingleSelectSplunkSearchEntity = CommonEntityFields.extend({
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

export const AnyOfEntity = z.discriminatedUnion('type', [
    LinkEntity,
    TextEntity,
    TextAreaEntity,
    SingleSelectEntity,
    MultipleSelectEntity,
    CheckboxEntity,
    CheckboxGroupEntity,
    RadioEntity,
    FileEntity,
    OAuthEntity,
    CustomEntity,
]);
