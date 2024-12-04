import React, { useEffect, useState, useCallback } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import Search from '@splunk/react-ui/Search';
import { StyledColumnLayout } from './StyledComponent';
import {
    getDefaultValues,
    getFlattenRowsWithGroups,
    getNewCheckboxValues,
    isGroupWithRows,
} from './CheckboxTree.utils';
import CheckboxSubTree from './CheckboxSubTree';
import CheckboxRowWrapper from './CheckboxTreeRowWrapper';
import { MODE_CREATE } from '../../constants/modes';
import { CheckboxTreeProps, SearchChangeData, ValueByField } from './types';
import { packValue, parseValue } from './utils';
import { checkValidationForRequired } from './validation';

function CheckboxTree(props: CheckboxTreeProps) {
    const { field, handleChange, controlOptions, disabled, required } = props;
    const flattenedRowsWithGroups = getFlattenRowsWithGroups(controlOptions);
    const shouldUseDefaultValue =
        props.mode === MODE_CREATE && (props.value === null || props.value === undefined);
    const initialValues = shouldUseDefaultValue
        ? getDefaultValues(controlOptions.rows)
        : parseValue(props.value);

    const [values, setValues] = useState(initialValues);
    const [searchForCheckBoxValue, setSearchForCheckBoxValue] = useState('');
    if (required) {
        checkValidationForRequired(props.field, props.label, controlOptions.rows);
    }

    // Propagate default values on mount if applicable
    useEffect(() => {
        if (shouldUseDefaultValue) {
            handleChange(field, packValue(initialValues), 'CheckboxTree');
        }
    }, [field, handleChange, shouldUseDefaultValue, initialValues]);

    const handleRowChange = useCallback(
        (newValue: { field: string; checkbox: boolean; text?: string }) => {
            setValues((prevValues: ValueByField) => {
                const updatedValues = getNewCheckboxValues(prevValues, newValue);
                handleChange(field, packValue(updatedValues), 'CheckboxTree');
                return updatedValues;
            });
        },
        [field, handleChange]
    );

    const handleParentCheckboxTree = useCallback(
        (groupLabel: string, newCheckboxValue: boolean) => {
            if (!controlOptions?.groups) {
                return;
            }

            const group = controlOptions.groups.find((g) => g.label === groupLabel);
            if (!group) {
                return;
            }

            setValues((prevValues) => {
                const updatedValues = new Map(prevValues);
                group.fields.forEach((item) => {
                    updatedValues.set(item, { checkbox: newCheckboxValue });
                });
                handleChange(field, packValue(updatedValues), 'CheckboxTree');
                return updatedValues;
            });
        },
        [controlOptions, field, handleChange]
    );

    const handleCheckboxToggleAll = useCallback(
        (newCheckboxValue: boolean) => {
            setValues((prevValues) => {
                const updatedValues = new Map(prevValues);
                controlOptions.rows.forEach((row) => {
                    updatedValues.set(row.field, { checkbox: newCheckboxValue });
                });
                handleChange(field, packValue(updatedValues), 'CheckboxTree');
                return updatedValues;
            });
        },
        [controlOptions.rows, field, handleChange]
    );

    const handleSearchChange = useCallback(
        (e: React.SyntheticEvent, { value: searchValue }: SearchChangeData) => {
            setSearchForCheckBoxValue(searchValue);
        },
        []
    );

    const filterRows = useCallback(() => {
        const searchValueLower = searchForCheckBoxValue.toLowerCase();

        return flattenedRowsWithGroups
            .flatMap((row) => {
                if (isGroupWithRows(row)) {
                    const groupMatches = row.label.toLowerCase().includes(searchValueLower);
                    const filteredRows = groupMatches
                        ? row.rows
                        : row.rows.filter((childRow) =>
                              childRow.checkbox?.label?.toLowerCase().includes(searchValueLower)
                          );

                    return groupMatches || filteredRows.length > 0
                        ? { ...row, rows: filteredRows }
                        : [];
                }

                const rowMatches = row.checkbox?.label?.toLowerCase().includes(searchValueLower);
                return rowMatches ? row : null;
            })
            .filter(Boolean);
    }, [flattenedRowsWithGroups, searchForCheckBoxValue]);

    const filteredRows = filterRows();

    return (
        <>
            <Search
                style={{ width: '320px', marginBottom: '10px' }}
                inline
                onChange={handleSearchChange}
                value={searchForCheckBoxValue}
            />
            <StyledColumnLayout gutter={5}>
                {filteredRows.map((row) =>
                    row && isGroupWithRows(row) ? (
                        <ColumnLayout.Row key={`group_${row.label}`}>
                            <CheckboxSubTree
                                group={row}
                                values={values}
                                handleRowChange={handleRowChange}
                                disabled={disabled}
                                handleParentCheckboxTree={handleParentCheckboxTree}
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

export default CheckboxTree;
