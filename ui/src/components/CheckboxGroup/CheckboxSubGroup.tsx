import React from 'react';
import styled from 'styled-components';
import Group from '../Group';
import { getCheckedCheckboxesCount, GroupWithRows, ValueByField } from './checkboxGroup.utils';
import CheckboxRowWrapper from './CheckboxRowWrapper';

const StyledCheckboxRowWrapper = styled.div`
    & > *:not(:last-child) {
        margin-bottom: 10px;
    }
`;

interface CheckboxSubGroupProps {
    group: GroupWithRows;
    values: ValueByField;
    handleRowChange: (newValue: { field: string; checkbox: boolean; text?: string }) => void;
}

function CheckboxSubGroup({ group, values, handleRowChange }: CheckboxSubGroupProps) {
    const checkedCheckboxesCount = getCheckedCheckboxesCount(group, values);
    return (
        <Group
            title={group.label}
            description={`${checkedCheckboxesCount} of ${group.fields.length}`}
            isExpandable={group.options?.isExpandable}
            defaultOpen={group.options?.expand}
        >
            <StyledCheckboxRowWrapper>
                {group.rows.map((rowInsideGroup) => (
                    <CheckboxRowWrapper
                        row={rowInsideGroup}
                        values={values}
                        handleRowChange={handleRowChange}
                        key={`row_${rowInsideGroup.field}`}
                    />
                ))}
            </StyledCheckboxRowWrapper>
        </Group>
    );
}

export default CheckboxSubGroup;
