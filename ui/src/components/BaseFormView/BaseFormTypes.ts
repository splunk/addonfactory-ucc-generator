import { z } from 'zod';
import { Mode } from '../../constants/modes';
import {
    AcceptableFormValueOrNull,
    AcceptableFormValueOrNullish,
    StandardPages,
} from '../../types/components/shareableTypes';
import { MarkdownMessageProps } from '../MarkdownMessage/MarkdownMessage';
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
} from '../../types/globalConfig/entities';
import { GlobalConfig } from '../../types/globalConfig/globalConfig';

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
    setState: (callback: (prevState: BaseFormState) => void) => void;
    setErrorFieldMsg: (field: string, msg: string) => void;
    clearAllErrorMsg: (State: BaseFormState) => unknown;
    setErrorMsg: (msg: string) => void;
}

export interface UtilControlWrapper {
    handleChange: (field: string, targetValue: AcceptableFormValueOrNullish) => void;
    addCustomValidator: (
        field: string,
        validatorFunc: (submittedField: string, submittedValue: string) => void
    ) => void;
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

export interface CustomHook {
    onCreate?: () => void;
    onRender?: () => void;
    onEditLoad?: () => void;
    onSaveSuccess?: () => void;
    onSaveFail?: () => void;
    onChange?: (
        field: string,
        targetValue: AcceptableFormValueOrNullish,
        tempState: BaseFormState
    ) => void;
    onSave?: (datadict?: Record<string, AcceptableFormValueOrNullish>) => boolean;
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
    dependencyValues?: { $set: Record<string, AcceptableFormValueOrNullish> };
}

export interface CustomHookClass {
    new (
        config: GlobalConfig,
        serviceName: string,
        state: BaseFormState,
        mode: string,
        util: {
            setState: (callback: (prevState: BaseFormState) => void) => void;
            setErrorFieldMsg: (field: string, msg: string) => void;
            clearAllErrorMsg: (State: BaseFormState) => unknown;
            setErrorMsg: (msg: string) => void;
        }
    ): {
        onCreate?: () => void;
        onRender?: () => void;
        onEditLoad?: () => void;
        onSaveSuccess?: () => void;
        onSaveFail?: () => void;
        onChange?: (
            field: string,
            targetValue: AcceptableFormValueOrNullish,
            tempState: BaseFormState
        ) => void;
        onSave?: (datadict?: Record<string, AcceptableFormValueOrNullish>) => boolean;
    };
}
