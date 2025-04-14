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
    options:
        | {
              checkbox: boolean;
              field: string; // single row
          }
        | {
              checkbox: boolean;
              groupFields: string[]; // group
          }
        | {
              checkbox: boolean;
              allRows: string[]; // select all
          }
) {
    const newValues = new Map(values);

    const fieldsToUpdate =
        ('allRows' in options && options.allRows) ||
        ('groupFields' in options && options.groupFields) ||
        ('field' in options && [options.field]) ||
        [];
    let hasChanged = false; // avoid re-renders

    fieldsToUpdate.forEach((field) => {
        const oldValue = values.get(field);
        if (oldValue?.checkbox !== options.checkbox) {
            hasChanged = true;
            newValues.set(field, {
                checkbox: options.checkbox,
            });
        }
    });

    // Avoid unnecessary re-renders:
    // Only return a new Map if any value actually changed,
    // otherwise return the original reference.
    return hasChanged ? newValues : values;
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
