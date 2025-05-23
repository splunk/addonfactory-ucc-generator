import React, { useEffect, useState } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import styled from 'styled-components';
import {
    CheckboxGroupProps,
    getDefaultValues,
    getFlattenRowsWithGroups,
    getNewCheckboxValues,
    isGroupWithRows,
    packValue,
    parseValue,
} from './checkboxGroup.utils';
import CheckboxSubGroup from './CheckboxSubGroup';
import CheckboxRowWrapper from './CheckboxRowWrapper';
import { useValidation } from './checkboxGroupValidation';
import { MODE_CREATE } from '../../constants/modes';

const FullWidth = styled.div`
    width: 100%;
`;

function CheckboxGroup(props: CheckboxGroupProps) {
    const { field, handleChange, controlOptions, addCustomValidator, disabled } = props;
    const flattenedRowsWithGroups = getFlattenRowsWithGroups(controlOptions);
    const shouldUseDefaultValue =
        props.mode === MODE_CREATE && (props.value === null || props.value === undefined);
    const value = shouldUseDefaultValue
        ? getDefaultValues(controlOptions.rows)
        : parseValue(props.value, controlOptions?.delimiter);

    // propagate defaults up if the component is not touched
    useEffect(() => {
        if (shouldUseDefaultValue) {
            handleChange(field, packValue(value, controlOptions?.delimiter), 'checkboxGroup');
        }
    }, [controlOptions?.delimiter, field, handleChange, shouldUseDefaultValue, value]);

    const [values, setValues] = useState(value);

    useValidation(addCustomValidator, field, controlOptions);
    const handleRowChange = (newValue: { field: string; checkbox: boolean; text?: string }) => {
        const newValues = getNewCheckboxValues(values, newValue);

        setValues(newValues);
        handleChange(field, packValue(newValues, controlOptions?.delimiter), 'checkboxGroup');
    };

    const handleCheckboxToggleAll = (newCheckboxValue: boolean) => {
        if (disabled === true) {
            return;
        }
        const newValues = new Map(values);
        controlOptions.rows.forEach((row) => {
            const oldValue = values.get(row.field);
            if (!!oldValue?.checkbox === newCheckboxValue) {
                return;
            }
            newValues.set(row.field, {
                checkbox: newCheckboxValue,
                inputValue: oldValue?.inputValue || row.input?.defaultValue,
            });
        });
        setValues(newValues);
        handleChange(field, packValue(newValues, controlOptions?.delimiter), 'checkboxGroup');
    };

    return (
        <FullWidth>
            <ColumnLayout gutter={5}>
                {flattenedRowsWithGroups.map((row) => {
                    if (isGroupWithRows(row)) {
                        // labels are unique across groups
                        return (
                            <ColumnLayout.Row key={`group_${row.label}`}>
                                <CheckboxSubGroup
                                    group={row}
                                    values={values}
                                    handleRowChange={handleRowChange}
                                    disabled={disabled}
                                />
                            </ColumnLayout.Row>
                        );
                    }
                    return (
                        <ColumnLayout.Row key={`row_${row.field}`}>
                            <CheckboxRowWrapper
                                row={row}
                                values={values}
                                handleRowChange={handleRowChange}
                                disabled={disabled}
                            />
                        </ColumnLayout.Row>
                    );
                })}
                <ColumnLayout.Row />
            </ColumnLayout>
            <div>
                <Button
                    label="Select All"
                    appearance="subtle"
                    onClick={() => handleCheckboxToggleAll(true)}
                />
                <Button
                    label="Clear All"
                    appearance="subtle"
                    onClick={() => handleCheckboxToggleAll(false)}
                />
            </div>
        </FullWidth>
    );
}

export default CheckboxGroup;
