import { BaseCheckboxProps } from '../CheckboxGroup/checkboxGroup.utils';

export type Field = string;
export type Value = {
    checkbox: boolean;
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

export interface CheckboxTreeProps extends BaseCheckboxProps {
    label: string;
    handleChange: (field: string, value: string, componentType: 'checkboxTree') => void;
}
