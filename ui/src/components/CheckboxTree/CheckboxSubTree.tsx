import React, { useEffect, useMemo, useState } from 'react';
import CheckboxRowWrapper from './CheckboxTreeRowWrapper';
import { getCheckedCheckboxesCount } from './CheckboxTree.utils';
import {
    CheckboxContainer,
    CheckboxWrapper,
    CustomCheckbox,
    Description,
    GroupLabel,
    RowContainer,
    StyledCollapsiblePanel,
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

    const isIndeterminate = useMemo(
        () => !isParentChecked && group.rows.some((row) => values.get(row.field)?.checkbox),
        [group.rows, values, isParentChecked]
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
        <CheckboxWrapper>
            <CustomCheckbox
                type="checkbox"
                checked={isParentChecked}
                data-indeterminate={isIndeterminate}
                onChange={() => handleParentCheckboxForGroup(group.label, !isParentChecked)}
                disabled={disabled}
                aria-label="custom checkbox to manage select/deselect/indeterminate state"
            />
            {group.label}
        </CheckboxWrapper>
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

    const description = (
        <Description>
            {checkedCheckboxesCount} of {group.rows.length}
        </Description>
    );

    return (
        <CheckboxContainer>
            {group.options?.isExpandable ? (
                <StyledCollapsiblePanel
                    open={isExpanded}
                    onChange={toggleCollapse}
                    title={ParentCheckbox}
                    actions={description}
                >
                    {childRows}
                </StyledCollapsiblePanel>
            ) : (
                <>
                    <GroupLabel>
                        {ParentCheckbox}
                        {description}
                    </GroupLabel>
                    {childRows}
                </>
            )}
        </CheckboxContainer>
    );
};

export default CheckboxSubTree;
