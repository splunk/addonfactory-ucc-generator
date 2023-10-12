import { NumberValidator, RegexValidator, StringValidator } from '../../types/ValidatorsTypes';
import { Mode } from '../../constants/modes';

type Field = string;
type Value = {
    checkbox: boolean;
    inputValue?: number;
    error?: string;
};

export type ValueByField = Map<Field, Value>;
/**
 *
 * @param collection string like collect_collaboration/1200,collect_file/1,collect_task/1
 */
export function parseValue(collection?: string): ValueByField {
    const resultMap = new Map<Field, Value>();

    if (!collection) {
        return resultMap;
    }

    const splitValues = collection.split(',');
    splitValues.forEach((rawValue) => {
        const [field, inputValue] = rawValue.split('/');
        const parsedInputValue = Number(inputValue);
        if (!field || Number.isNaN(parsedInputValue)) {
            throw new Error(`Value is not parsable: ${collection}`);
        }

        resultMap.set(field, {
            checkbox: true,
            inputValue: parsedInputValue,
        });
    });

    return resultMap;
}

export function packValue(map: ValueByField) {
    return Array.from(map.entries())
        .filter(([, value]) => value.checkbox)
        .map(([field, value]) => `${field}/${value.inputValue}`)
        .join(',');
}

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
    input?: {
        defaultValue?: number;
        validators?: NumberValidator[];
        required?: boolean;
    };
}

export type GroupWithRows = Group & { rows: Row[] };

export interface CheckboxGroupProps {
    field: string;
    value?: string;
    controlOptions: {
        groups?: Group[];
        rows: Row[];
    };
    mode: Mode;
    addCustomValidator?: (
        field: string,
        validator: (submittedField: string, submittedValue: string) => void
    ) => void;
    handleChange: (field: string, value: string, componentType?: 'checkboxGroup') => void;
}

export function isGroupWithRows(item: GroupWithRows | Row): item is GroupWithRows {
    return 'label' in item;
}

export function getFlattenRowsWithGroups({ groups, rows }: CheckboxGroupProps['controlOptions']) {
    const flattenRowsMixedWithGroups: Array<GroupWithRows | Row> = [];

    rows.forEach((row) => {
        const groupForThisRow = groups?.find((group) => group.fields.includes(row.field));
        if (groupForThisRow) {
            const addedGroup = flattenRowsMixedWithGroups.find(
                (item): item is GroupWithRows =>
                    isGroupWithRows(item) && item.label === groupForThisRow.label
            );
            const groupToAdd = addedGroup || {
                ...groupForThisRow,
                rows: [],
            };
            groupToAdd.rows.push(row);
            if (!addedGroup) {
                flattenRowsMixedWithGroups.push(groupToAdd);
            }
            return;
        }
        flattenRowsMixedWithGroups.push(row);
    });

    return flattenRowsMixedWithGroups;
}

export function getNewCheckboxValues(
    values: ValueByField,
    newValue: {
        field: string;
        checkbox: boolean;
        inputValue?: number;
    }
) {
    const newValues = new Map(values);
    newValues.set(newValue.field, {
        checkbox: newValue.checkbox,
        inputValue: newValue.inputValue,
    });

    return newValues;
}

export function getCheckedCheckboxesCount(group: GroupWithRows, values: ValueByField) {
    let checkedCheckboxesCount = 0;
    group.rows.forEach((row) => {
        if (values.get(row.field)?.checkbox) {
            checkedCheckboxesCount += 1;
        }
    });
    return checkedCheckboxesCount;
}

export function getDefaultValues(rows: Row[]): ValueByField {
    const resultMap = new Map<Field, Value>();

    rows.forEach((row) => {
        if (!isGroupWithRows(row)) {
            const checkboxDefaultValue = row.checkbox?.defaultValue;
            if (typeof checkboxDefaultValue === 'boolean') {
                resultMap.set(row.field, {
                    checkbox: checkboxDefaultValue,
                    inputValue: row.input?.defaultValue,
                });
            }
        }
    });

    return resultMap;
}
