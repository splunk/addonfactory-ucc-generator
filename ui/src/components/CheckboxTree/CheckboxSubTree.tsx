import React, { useEffect, useMemo, useState } from 'react';
import CheckboxRowWrapper from './CheckboxTreeRowWrapper';
import { getCheckedCheckboxesCount } from './CheckboxTree.utils';
import {
    CheckboxContainer,
    SelectionCounter,
    GroupLabel,
    RowContainer,
    StyledCollapsiblePanel,
    StyledSwitch,
} from './StyledComponent';
import { GroupWithRows, ValueByField } from './types';

interface CheckboxSubTreeProps {
    group: GroupWithRows;
    values: ValueByField;
    handleRowChange: (newValue: { field: string; checkbox: boolean; text?: string }) => void;
    disabled?: boolean;
    handleParentCheckboxForGroup: (groupLabel: string, newCheckboxValue: boolean) => void;
}

const CheckboxSubTree: React.FC<CheckboxSubTreeProps> = ({
    group,
    values,
    handleRowChange,
    disabled,
    handleParentCheckboxForGroup,
}) => {
    const [isExpanded, setIsExpanded] = useState(group.options?.expand);

    const isParentChecked = useMemo(
        () => group.rows.every((row) => values.get(row.field)?.checkbox),
        [group.rows, values]
    );

    const checkedCheckboxesCount = useMemo(
        () => getCheckedCheckboxesCount(group, values),
        [group, values]
    );

    useEffect(() => {
        setIsExpanded(group.options?.expand);
    }, [group.options?.expand, group.rows]);

    const toggleCollapse = () => setIsExpanded((prev) => !prev);

    const ParentCheckbox = (
        <StyledSwitch
            aria-label={`Toggle for ${group.label}`}
            selected={isParentChecked}
            onClick={() => handleParentCheckboxForGroup(group.label, !isParentChecked)}
            appearance="checkbox"
            disabled={disabled}
        >
            {group.label}
        </StyledSwitch>
    );

    const childRows = (
        <RowContainer>
            {group.rows.map((row) => (
                <CheckboxRowWrapper
                    key={`row_${row.field}`}
                    disabled={disabled}
                    row={row}
                    values={values}
                    handleRowChange={handleRowChange}
                />
            ))}
        </RowContainer>
    );

    const selectionCounter = (
        <SelectionCounter>
            {checkedCheckboxesCount} of {group.rows.length}
        </SelectionCounter>
    );

    return (
        <CheckboxContainer>
            {group.options?.isExpandable ? (
                <StyledCollapsiblePanel
                    open={isExpanded}
                    onChange={toggleCollapse}
                    title={ParentCheckbox}
                    actions={selectionCounter}
                    inset={false}
                >
                    {childRows}
                </StyledCollapsiblePanel>
            ) : (
                <>
                    <GroupLabel>
                        {ParentCheckbox}
                        {selectionCounter}
                    </GroupLabel>
                    {childRows}
                </>
            )}
        </CheckboxContainer>
    );
};

export default CheckboxSubTree;
