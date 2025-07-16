import { MarkdownMessageProps } from '../../components/MarkdownMessage/MarkdownMessage';
import { Mode } from '../../constants/modes';
import { AcceptableFormValueOrNullish, StandardPages } from './shareableTypes';

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

export interface UtilBaseForm {
    setState: (callback: (prevState: BaseFormState) => BaseFormState) => void;
    setErrorFieldMsg: (field: string, msg: string) => void;
    clearAllErrorMsg: (state: BaseFormState) => BaseFormState;
    setErrorMsg: (msg: string) => void;
}
