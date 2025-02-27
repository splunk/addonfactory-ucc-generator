import { z } from 'zod';
import { Mode } from '../../constants/modes';
import {
    AcceptableFormValueOrNull,
    AcceptableFormValueOrNullish,
    NullishFormRecord,
    StandardPages,
} from './shareableTypes';
import { MarkdownMessageProps } from '../../components/MarkdownMessage/MarkdownMessage';
import {
    AnyOfEntity,
    CheckboxEntity,
    FileEntity,
    MultipleSelectEntity,
    OAuthFields,
    RadioEntity,
    SingleSelectEntity,
    TextAreaEntity,
    TextEntity,
} from '../globalConfig/entities';
import { PageContextProviderType } from '../../context/PageContext';

export type CurrentBaseFormInput =
    | Record<string, AcceptableFormValueOrNull>
    | Record<string, Record<string, AcceptableFormValueOrNull>>;

export interface CustomHookError {
    name: string;
    message: string;
}

type SingleFieldToModify = {
    fieldId: string;
    display?: boolean;
    value?: string | number | boolean;
    disabled?: boolean;
    help?: string;
    label?: string;
    markdownMessage?: MarkdownMessageProps;
};

export type ModificationCriteria = {
    fieldValue: string | number | boolean;
    mode?: 'create' | 'edit' | 'config' | 'clone';
    fieldsToModify: Array<SingleFieldToModify>;
};

export type ModifyFieldsOnValue = Array<ModificationCriteria>;

export interface BaseFormStateData {
    [x: string]: {
        disabled: boolean;
        error: boolean;
        fileNameToDisplay?: string;
        value?: AcceptableFormValueOrNullish;
        display: boolean;
        markdownMessage?: MarkdownMessageProps;
        dependencyValues?: string;
        modifiedEntitiesData?: {
            help?: string;
            label?: string;
            required?: boolean;
        };
    };
}

export interface BaseFormProps {
    currentServiceState?: Record<string, AcceptableFormValueOrNull>;
    serviceName: string;
    mode: Mode;
    page: StandardPages;
    stanzaName: string;
    groupName?: string;
    handleFormSubmit: (isSubmitting: boolean, closeEntity: boolean) => void;
    pageContext?: PageContextProviderType;
}

export interface BaseFormState {
    serviceName?: string;
    mode?: Mode;
    page?: StandardPages;
    stanzaName?: string;
    data: BaseFormStateData;
    errorMsg?: string;
    warningMsg?: string;
    stateModified?: boolean;
}

export interface SingleSelectEntityType {
    field: string;
    type: 'singleSelect';
    label: string;
    options: {
        hideClearBtn: boolean;
        autoCompleteFields: {
            label: string;
            value: 'oauth' | 'basic';
        }[];
    };
    modifyFieldsOnValue?: ModifyFieldsOnValue;
}

export interface UtilBaseForm {
    setState: (callback: (prevState: BaseFormState) => BaseFormState) => void;
    setErrorFieldMsg: (field: string, msg: string) => void;
    clearAllErrorMsg: (state: BaseFormState) => BaseFormState;
    setErrorMsg: (msg: string) => void;
}

export interface UtilControlWrapper {
    handleChange: (field: string, targetValue: AcceptableFormValueOrNullish) => void;
    addCustomValidator: (field: string, validatorFunc: CustomValidatorFunc) => void;
    utilCustomFunctions: UtilBaseForm;
}

export interface ServiceGroup {
    label: string;
    fields: string[];
    options?: { isExpandable?: boolean; expand?: boolean };
}

export interface OauthConfiguration {
    popupWidth: number;
    popupHeight: number;
    authTimeout: number;
    authCodeEndpoint: string | null;
    accessTokenEndpoint: string | null;
    authEndpointAccessTokenType: string | null;
}

export type AnyEntity = z.TypeOf<typeof AnyOfEntity> | z.TypeOf<typeof OAuthFields>;

export type EntitiesAllowingModifications =
    | z.TypeOf<typeof TextEntity>
    | z.TypeOf<typeof TextAreaEntity>
    | z.TypeOf<typeof SingleSelectEntity>
    | z.TypeOf<typeof MultipleSelectEntity>
    | z.TypeOf<typeof CheckboxEntity>
    | z.TypeOf<typeof RadioEntity>
    | z.TypeOf<typeof FileEntity>
    | z.TypeOf<typeof OAuthFields>;

export type OAuthEntity = z.TypeOf<typeof OAuthFields>;

export interface BasicEntity {
    disabled: boolean;
    error: boolean;
    display: boolean;
    value?: AcceptableFormValueOrNullish;
    fileNameToDisplay?: string;
}

export interface ChangeRecord {
    display?: { $set: boolean };
    value?: { $set: AcceptableFormValueOrNullish };
    dependencyValues?: { $set: NullishFormRecord };
}

/**
 * Custom validator function.
 * @param submittedField  the field name of the form field.
 * @param submittedValue  the value of the form field.
 * @returns  a string if the validation fails, otherwise undefined.
 */
export type CustomValidatorFunc = (
    submittedField: string,
    submittedValue: AcceptableFormValueOrNullish
) => string | undefined;
