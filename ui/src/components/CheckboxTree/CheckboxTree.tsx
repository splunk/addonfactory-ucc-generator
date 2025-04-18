import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import styled from 'styled-components';
import {
    getDefaultValues,
    getFlattenRowsWithGroups,
    getNewCheckboxValues,
    isGroupWithRows,
} from './CheckboxTree.utils';
import CheckboxSubTree from './CheckboxSubTree';
import CheckboxRowWrapper from './CheckboxTreeRowWrapper';
import { MODE_CREATE } from '../../constants/modes';
import { CheckboxTreeProps } from './types';
import { packValue, parseValue } from './utils';

const FullWidth = styled.div`
    width: 100%;
`;

function CheckboxTree(props: CheckboxTreeProps) {
    const { field, handleChange, controlOptions, disabled } = props;

    const flattenedRowsWithGroups = useMemo(
        () => getFlattenRowsWithGroups(controlOptions),
        [controlOptions]
    );

    const shouldUseDefaultValue = useMemo(
        () => props.mode === MODE_CREATE && (props.value === null || props.value === undefined),
        [props.mode, props.value]
    );

    const initialValues = useMemo(
        () =>
            shouldUseDefaultValue
                ? getDefaultValues(controlOptions.rows)
                : parseValue(props.value, controlOptions?.delimiter),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [shouldUseDefaultValue, controlOptions.rows, props.value]
    );

    const [values, setValues] = useState(initialValues);

    // Propagate default values on mount if applicable
    useEffect(() => {
        if (shouldUseDefaultValue) {
            handleChange(
                field,
                packValue(initialValues, controlOptions?.delimiter),
                'checkboxTree'
            );
        }
    }, [field, handleChange, shouldUseDefaultValue, initialValues, controlOptions?.delimiter]);

    const handleRowChange = useCallback(
        (newValue: { field: string; checkbox: boolean; text?: string }) => {
            setValues((prevValues) => {
                const updatedValues = getNewCheckboxValues(prevValues, newValue);
                handleChange(
                    field,
                    packValue(updatedValues, controlOptions?.delimiter),
                    'checkboxTree'
                );
                return updatedValues;
            });
        },

        [controlOptions?.delimiter, field, handleChange]
    );

    const handleParentCheckboxForGroup = useCallback(
        (groupLabel: string, newCheckboxValue: boolean) => {
            if (!controlOptions?.groups) {
                return;
            }

            const group = controlOptions.groups.find((g) => g.label === groupLabel);
            if (!group) {
                return;
            }

            setValues((prevValues) => {
                const updatedValues = getNewCheckboxValues(prevValues, {
                    groupFields: group.fields,
                    checkbox: newCheckboxValue,
                });
                handleChange(
                    field,
                    packValue(updatedValues, controlOptions?.delimiter),
                    'checkboxTree'
                );
                return updatedValues;
            });
        },

        [controlOptions?.delimiter, controlOptions.groups, field, handleChange]
    );

    const handleCheckboxToggleAll = useCallback(
        (newCheckboxValue: boolean) => {
            if (disabled === true) {
                return;
            }

            setValues((prevValues) => {
                const updatedValues = getNewCheckboxValues(prevValues, {
                    allRows: controlOptions.rows.map((r) => r.field),
                    checkbox: newCheckboxValue,
                });
                handleChange(
                    field,
                    packValue(updatedValues, controlOptions?.delimiter),
                    'checkboxTree'
                );
                return updatedValues;
            });
        },

        [controlOptions?.delimiter, controlOptions.rows, disabled, field, handleChange]
    );

    return (
        <FullWidth>
            <ColumnLayout gutter={5}>
                {flattenedRowsWithGroups.map((row) =>
                    row && isGroupWithRows(row) ? (
                        <ColumnLayout.Row key={`group_${row.label}`}>
                            <CheckboxSubTree
                                group={row}
                                values={values}
                                handleRowChange={handleRowChange}
                                disabled={disabled}
                                handleParentCheckboxForGroup={handleParentCheckboxForGroup}
                            />
                        </ColumnLayout.Row>
                    ) : (
                        row && (
                            <ColumnLayout.Row key={`row_${row.field}`}>
                                <CheckboxRowWrapper
                                    row={row}
                                    values={values}
                                    handleRowChange={handleRowChange}
                                    disabled={disabled}
                                />
                            </ColumnLayout.Row>
                        )
                    )
                )}
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

export default CheckboxTree;
