import { Mode } from '../../constants/modes';

export type Field = string;
export type Value = {
    checkbox: boolean;
    inputValue?: number;
    error?: string;
};

export type ValueByField = Map<Field, Value>;

export interface Group {
    label: string;
    fields: string[];
    options?: {
        isExpandable?: boolean;
        expand?: boolean;
    };
}

export interface Row {
    field: string;
    checkbox?: {
        label?: string;
        defaultValue?: boolean;
    };
}

export type GroupWithRows = Group & { rows: Row[] };

export interface CheckboxTreeProps {
    field: string;
    value?: string;
    required?: boolean;
    label: string;
    controlOptions: {
        groups?: Group[];
        rows: Row[];
    };
    mode: Mode;
    addCustomValidator?: (
        field: string,
        validator: (submittedField: string, submittedValue: string) => void
    ) => void;
    handleChange: (field: string, value: string, componentType?: 'CheckboxTree') => void;
    disabled?: boolean;
}

export type SearchChangeData = {
    value: string;
};
