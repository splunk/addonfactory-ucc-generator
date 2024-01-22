import { z } from 'zod';
import { Mode } from '../constants/modes';
import {
    AcceptableFormValueOrNull,
    AcceptableFormValueOrNullish,
} from '../types/components/shareableTypes';
import { AnyOfEntity, OAuthFields } from '../types/globalConfig/entities';
import { MarkdownMessageProps } from './MarkdownMessage';

export type CurrentBaseFormInput =
    | Record<string, AcceptableFormValueOrNull>
    | Record<string, Record<string, AcceptableFormValueOrNull>>;

export interface CustomHookError {
    name: string;
    message: string;
}

export interface BaseFormStateData {
    [x: string]: {
        disabled: boolean;
        error: boolean;
        fileNameToDisplay?: string;
        value?: AcceptableFormValueOrNullish;
        display: boolean;
        markdownMessage?: MarkdownMessageProps;
        dependencyValues?: string;
    };
}

export interface BaseFormProps {
    currentServiceState?: Record<string, AcceptableFormValueOrNull>;
    serviceName: string;
    mode: Mode;
    page: string;
    stanzaName: string;
    groupName?: string;
    handleFormSubmit: (isSubmitting: boolean, closeEntity: boolean) => void;
}

export interface BaseFormState {
    serviceName?: string;
    mode?: Mode;
    page?: string;
    stanzaName?: string;
    data?: BaseFormStateData;
    errorMsg?: string;
    warningMsg?: string;
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
}

export interface UtilBaseForm {
    setState: (callback: (prevState: BaseFormState) => void) => void;
    setErrorFieldMsg: (field: string, msg: string) => void;
    clearAllErrorMsg: (State: BaseFormState) => unknown;
    setErrorMsg: (msg: string) => void;
}

export interface UtilControlWrapper {
    handleChange: (field: string, targetValue: string) => void;
    addCustomValidator: (
        field: string,
        validatorFunc: (submittedField: string, submittedValue: string) => void
    ) => void;
    utilCustomFunctions: {
        setState: (callback: (prevState: BaseFormState) => void) => void;
        setErrorFieldMsg: (field: string, msg: string) => void;
        clearAllErrorMsg: (State: BaseFormState) => unknown;
        setErrorMsg: (msg: string) => void;
    };
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
    onChange?: (field: string, targetValue: string, tempState: BaseFormState) => void;
    onSave?: (datadict?: Record<string, AcceptableFormValueOrNullish>) => boolean;
}

export type AnyEntity = z.TypeOf<typeof AnyOfEntity> | z.TypeOf<typeof OAuthFields>;

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
    value?: { $set: string | null };
    dependencyValues?: { $set: Record<string, AcceptableFormValueOrNullish> };
}

export interface CustomHookClass {
    new (
        config: unknown,
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
        onChange?: (field: string, targetValue: string, tempState: BaseFormState) => void;
        onSave?: (datadict?: Record<string, AcceptableFormValueOrNullish>) => boolean;
    };
}
