import { CheckboxTreeProps, Field, GroupWithRows, Row, Value, ValueByField } from './types';

export function isGroupWithRows(item: GroupWithRows | Row): item is GroupWithRows {
    return 'label' in item;
}

export function getFlattenRowsWithGroups({ groups, rows }: CheckboxTreeProps['controlOptions']) {
    const groupMap = new Map<string, GroupWithRows>();

    return rows.reduce<Array<GroupWithRows | Row>>((flattenRowsMixedWithGroups, row) => {
        const groupForThisRow = groups?.find((group) => group.fields.includes(row.field));
        if (!groupForThisRow) {
            // no group needed for this row, simply push the row
            flattenRowsMixedWithGroups.push(row);
            return flattenRowsMixedWithGroups;
        }

        // Check if the group already exists in the map, otherwise create a new group
        let existingGroup = groupMap.get(groupForThisRow.label);
        if (!existingGroup) {
            existingGroup = { ...groupForThisRow, rows: [row] };
            groupMap.set(groupForThisRow.label, existingGroup);
            flattenRowsMixedWithGroups.push(existingGroup);
        } else {
            // Add row to the existing group
            existingGroup.rows.push(row);
        }

        return flattenRowsMixedWithGroups;
    }, []);
}

export function getNewCheckboxValues(
    values: ValueByField,
    newValue: {
        field: string;
        checkbox: boolean;
    }
) {
    const newValues = new Map(values);
    newValues.set(newValue.field, {
        checkbox: newValue.checkbox,
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
        const checkboxDefaultValue = row.checkbox?.defaultValue;
        if (typeof checkboxDefaultValue !== 'boolean') {
            return;
        }
        resultMap.set(row.field, {
            checkbox: checkboxDefaultValue,
        });
    });

    return resultMap;
}
