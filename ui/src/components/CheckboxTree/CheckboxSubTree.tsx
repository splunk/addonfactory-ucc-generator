import React, { useMemo, useState } from 'react';
import CheckboxRowWrapper from './CheckboxTreeRowWrapper';
import { getCheckedCheckboxesCount } from './CheckboxTree.utils';
import {
    CheckboxContainer,
    CheckboxWrapper,
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
    handleParentCheckboxTree: (groupLabel: string, newCheckboxValue: boolean) => void;
}

const CheckboxSubTree: React.FC<CheckboxSubTreeProps> = ({
    group,
    values,
    handleRowChange,
    disabled,
    handleParentCheckboxTree,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const isParentChecked = useMemo(
        () => group.rows.every((row) => values.get(row.field)?.checkbox),
        [group.rows, values]
    );

    const isIndeterminate = useMemo(
        () => group.rows.some((row) => values.get(row.field)?.checkbox) && !isParentChecked,
        [group.rows, values, isParentChecked]
    );

    const checkedCheckboxesCount = useMemo(
        () => getCheckedCheckboxesCount(group, values),
        [group, values]
    );

    const toggleCollapse = () => setIsExpanded((prev) => !prev);

    const ParentCheckbox = (
        <CheckboxWrapper>
            <input
                type="checkbox"
                checked={isParentChecked}
                ref={(el) => {
                    const inputElement = el as HTMLInputElement | null;
                    if (inputElement) {
                        inputElement.indeterminate = isIndeterminate;
                    }
                }}
                onChange={() => handleParentCheckboxTree(group.label, !isParentChecked)}
                disabled={disabled}
            />
            <span>{group.label}</span>
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
            {checkedCheckboxesCount} of {group.fields.length}
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
