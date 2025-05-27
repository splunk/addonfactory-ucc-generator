import {
    DateValidatorType,
    EmailValidatorType,
    Ipv4ValidatorType,
    NumberValidatorType,
    RegexValidatorType,
    StringValidatorType,
    UrlValidatorType,
} from './validators';

export interface ValueLabelPairInterface {
    value: string | number | boolean;
    label: string;
}

export interface TextElementWithLinksInterface {
    text: string;
    links?: { slug: string; link: string; linkText: string }[];
    link?: string;
}

export type StringOrTextWithLinksType = string | TextElementWithLinksInterface;

export interface MarkdownMessageTextInterface {
    markdownType: 'text';
    text: string;
    color?: string;
}

export interface MarkdownMessageHybridInterface {
    markdownType: 'hybrid';
    text: string;
    token: string;
    linkText: string;
    link: string;
}

export interface MarkdownMessageLinkInterface {
    markdownType: 'link';
    text: string;
    link: string;
}

export interface MarkdownMessagePlaintextInterface {
    markdownType?: undefined;
    text: string;
}

export type MarkdownMessageType =
    | MarkdownMessageTextInterface
    | MarkdownMessageHybridInterface
    | MarkdownMessageLinkInterface
    | MarkdownMessagePlaintextInterface;

export interface FieldToModifyInterface {
    fieldValue: string | number | boolean;
    mode?: 'create' | 'edit' | 'config' | 'clone';
    fieldsToModify: {
        fieldId: string;
        display?: boolean;
        value?: string | number | boolean;
        disabled?: boolean;
        required?: boolean;
        help?: StringOrTextWithLinksType;
        label?: string;
        markdownMessage?: MarkdownMessageType;
    }[];
}

export type ModifyFieldsOnValue = FieldToModifyInterface[] | undefined;

export type Validator =
    | NumberValidatorType
    | StringValidatorType
    | RegexValidatorType
    | EmailValidatorType
    | Ipv4ValidatorType
    | UrlValidatorType
    | DateValidatorType;

export type Validators = Validator[];

export interface CommonEntityFieldsInterface {
    type: string;
    field: string;
    label: string;
    help?: StringOrTextWithLinksType;
    tooltip?: string;
}

export interface CommonEditableEntityFieldsInterface extends CommonEntityFieldsInterface {
    required?: boolean;
    encrypted?: boolean;
}

export interface CommonEditableEntityOptionsInterface {
    display?: boolean;
    disableonEdit?: boolean;
    enable?: boolean;
    requiredWhenVisible?: boolean;
    hideForPlatform?: 'cloud' | 'enterprise';
}

export interface LinkEntityInterface {
    type: 'helpLink';
    field: string;
    label?: string;
    help?: StringOrTextWithLinksType;
    tooltip?: string;
    options: TextElementWithLinksInterface & {
        hideForPlatform?: 'cloud' | 'enterprise';
        display?: boolean;
    };
}

export interface TextEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'text';
    validators?: Validators;
    defaultValue?: string | number | boolean;
    options?: CommonEditableEntityOptionsInterface;
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface TextAreaEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'textarea';
    validators?: Validators;
    defaultValue?: string;
    options?: CommonEditableEntityOptionsInterface & {
        rowsMin?: number;
        rowsMax?: number;
    };
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface SelectCommonOptionsInterface extends CommonEditableEntityOptionsInterface {
    disableSearch?: boolean;
    createSearchChoice?: boolean;
    referenceName?: string;
    endpointUrl?: string;
    allowList?: string;
    denyList?: string;
    labelField?: string;
    valueField?: string;
    autoCompleteFields?: (
        | ValueLabelPairInterface
        | { label: string; children: ValueLabelPairInterface[] }
    )[];
    dependencies?: string[];
    items?: ValueLabelPairInterface[];
}

export interface SingleSelectEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'singleSelect';
    validators?: Validators;
    defaultValue?: string | number | boolean;
    options: SelectCommonOptionsInterface;
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface MultipleSelectCommonOptionsInterface extends SelectCommonOptionsInterface {
    delimiter?: string;
}

export interface MultipleSelectEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'multipleSelect';
    validators?: Validators;
    defaultValue?: string;
    options: MultipleSelectCommonOptionsInterface;
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface CheckboxEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'checkbox';
    defaultValue?: number | boolean;
    options?: CommonEditableEntityOptionsInterface;
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface CheckboxGroupEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'checkboxGroup';
    validators?: RegexValidatorType[];
    defaultValue?: number | boolean;
    options: CommonEditableEntityOptionsInterface & {
        delimiter?: string;
        groups?: {
            label: string;
            fields: string[];
            options?: {
                isExpandable?: boolean;
                expand?: boolean;
            };
        }[];
        rows: {
            field: string;
            checkbox?: {
                label?: string;
                defaultValue?: boolean;
            };
            input?: {
                defaultValue?: number;
                validators?: NumberValidatorType[];
                required?: boolean;
            };
        }[];
    };
}

export interface CheckboxTreeEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'checkboxTree';
    validators?: RegexValidatorType[];
    defaultValue?: number | boolean;
    options: CommonEditableEntityOptionsInterface & {
        delimiter?: string;
        groups?: {
            label: string;
            fields: string[];
            options?: {
                isExpandable?: boolean;
                expand?: boolean;
            };
        }[];
        rows: {
            field: string;
            checkbox?: {
                label?: string;
                defaultValue?: boolean;
            };
        }[];
    };
}

export interface RadioEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'radio';
    defaultValue?: string;
    options: CommonEditableEntityOptionsInterface & {
        items: ValueLabelPairInterface[];
    };
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface FileEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'file';
    defaultValue?: string;
    validators?: (RegexValidatorType | StringValidatorType)[];
    options?: CommonEditableEntityOptionsInterface & {
        maxFileSize?: number;
        fileSupportMessage?: string;
        supportedFileTypes: string[];
        useBase64Encoding?: boolean;
    };
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface OAuthFieldInterface {
    oauth_field: string;
    label: string;
    field: string;
    type?: 'text';
    help?: StringOrTextWithLinksType;
    encrypted?: boolean;
    required?: boolean;
    defaultValue?: string | number | boolean;
    options?: CommonEditableEntityOptionsInterface;
    modifyFieldsOnValue?: ModifyFieldsOnValue;
    validators?: Validators;
}

export interface OAuthEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'oauth';
    defaultValue?: string;
    validators?: (RegexValidatorType | StringValidatorType)[];
    options: Omit<CommonEditableEntityOptionsInterface, 'requiredWhenVisible'> & {
        auth_type: ('basic' | 'oauth' | 'oauth_client_credentials')[];
        basic?: OAuthFieldInterface[];
        oauth?: OAuthFieldInterface[];
        oauth_client_credentials?: OAuthFieldInterface[];
        auth_label?: string;
        oauth_popup_width?: number;
        oauth_popup_height?: number;
        oauth_timeout?: number;
        auth_code_endpoint?: string;
        access_token_endpoint?: string;
        oauth_state_enabled?: boolean;
        auth_endpoint_token_access_type?: string;
    };
}

export interface CustomEntityInterface extends CommonEditableEntityFieldsInterface {
    type: 'custom';
    options: {
        type: 'external';
        src: string;
        hideForPlatform?: 'cloud' | 'enterprise';
    };
}

export interface SingleSelectSplunkSearchEntityInterface extends CommonEntityFieldsInterface {
    type: 'singleSelectSplunkSearch';
    defaultValue?: string | number | boolean;
    search?: string;
    valueField?: string;
    labelField?: string;
    options?: {
        items: ValueLabelPairInterface[];
    };
}
