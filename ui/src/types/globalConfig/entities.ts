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

const CommonEntityFields = z.object({
    type: z.string(),
    field: z.string(),
    label: z.string(),
    help: z.string().optional(),
    tooltip: z.string().optional(),
});

const CommonEditableEntityFields = CommonEntityFields.extend({
    required: z.boolean().optional().default(false),
    encrypted: z.boolean().optional().default(false),
});

const CommonEditableEntityOptions = z.object({
    placeholder: z.string().optional(),
    display: z.boolean().optional().default(true),
    disableonEdit: z.boolean().optional().default(false),
    enable: z.boolean().optional().default(true),
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
    disableSearch: z.boolean().optional().default(false),
    createSearchChoice: z.boolean().optional().default(false),
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
});

export const MultipleSelectEntity = CommonEditableEntityFields.extend({
    type: z.literal('multipleSelect'),
    validators: AllValidators.optional(),
    defaultValue: z.string().optional(),
    options: SelectCommonOptions.extend({
        delimiter: z.string().length(1).optional(),
    }),
});

export const CheckboxEntity = CommonEditableEntityFields.extend({
    type: z.literal('checkbox'),
    defaultValue: z.union([z.number(), z.boolean()]).optional(),
    options: CommonEditableEntityOptions.omit({ placeholder: true }).optional(),
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
});

const OAuthFields = z
    .object({
        oauth_field: z.string(),
        label: z.string(),
        field: z.string(),
        help: z.string(),
        encrypted: z.boolean().default(false),
        required: z.boolean().default(false),
        options: z.object({
            placeholder: z.string().optional(),
            disableonEdit: z.boolean().optional(),
            enable: z.boolean().optional().default(true),
        }),
    })
    .partial();
export const OAuthEntity = CommonEditableEntityFields.extend({
    type: z.literal('oauth'),
    defaultValue: z.string().optional(),
    validators: z.array(z.union([StringValidator, RegexValidator])).optional(),
    options: CommonEditableEntityOptions.omit({ placeholder: true }).extend({
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
