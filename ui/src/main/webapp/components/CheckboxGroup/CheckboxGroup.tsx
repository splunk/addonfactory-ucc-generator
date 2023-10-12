import React, { useEffect, useState } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import { StyledColumnLayout } from './StyledComponent';
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

function CheckboxGroup(props: CheckboxGroupProps) {
    const { field, handleChange, controlOptions, addCustomValidator } = props;

    const flattenedRowsWithGroups = getFlattenRowsWithGroups(controlOptions);
    const value =
        props.mode === MODE_CREATE
            ? getDefaultValues(controlOptions.rows)
            : parseValue(props.value);

    // propagate defaults up if the component is not touched
    useEffect(() => {
        if (props.mode === MODE_CREATE) {
            handleChange(field, packValue(value), 'checkboxGroup');
        }
    }, [field, handleChange, props.mode, value]);

    const [values, setValues] = useState(value);

    useValidation(addCustomValidator, field, controlOptions);
    const handleRowChange = (newValue: { field: string; checkbox: boolean; text?: string }) => {
        const newValues = getNewCheckboxValues(values, newValue);

        setValues(newValues);
        handleChange(field, packValue(newValues), 'checkboxGroup');
    };

    const handleCheckboxToggleAll = (newCheckboxValue: boolean) => {
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
        handleChange(field, packValue(newValues), 'checkboxGroup');
    };

    return (
        <>
            <StyledColumnLayout gutter={5}>
                {flattenedRowsWithGroups.map((row) => {
                    if (isGroupWithRows(row)) {
                        // labels are unique across groups
                        return (
                            <ColumnLayout.Row key={`group_${row.label}`}>
                                <CheckboxSubGroup
                                    group={row}
                                    values={values}
                                    handleRowChange={handleRowChange}
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
                            />
                        </ColumnLayout.Row>
                    );
                })}
                <ColumnLayout.Row />
            </StyledColumnLayout>
            <div>
                <Button
                    label="Select All"
                    appearance="pill"
                    onClick={() => handleCheckboxToggleAll(true)}
                />
                <Button
                    label="Clear All"
                    appearance="pill"
                    onClick={() => handleCheckboxToggleAll(false)}
                />
            </div>
        </>
    );
}

export default CheckboxGroup;
