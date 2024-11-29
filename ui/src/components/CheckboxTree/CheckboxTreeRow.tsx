import React from 'react';
import { StyledRow, StyledSwitch } from './StyledComponent';

interface CheckboxRowProps {
    field: string;
    label: string;
    checkbox: boolean;
    disabled?: boolean;
    handleChange: (value: { field: string; checkbox: boolean }) => void;
}

function CheckboxRow(props: CheckboxRowProps) {
    const { field, label, checkbox, disabled, handleChange } = props;
    const handleChangeCheckbox = (
        event: React.MouseEvent<HTMLElement>,
        data: { selected: boolean }
    ) => {
        handleChange({ field, checkbox: !data.selected });
    };

    return (
        <StyledRow>
            <StyledSwitch
                aria-label={`${label} checkbox`}
                data-test-field={field}
                selected={checkbox}
                onClick={handleChangeCheckbox}
                appearance="checkbox"
                disabled={disabled}
            >
                {label}
            </StyledSwitch>
        </StyledRow>
    );
}

export default CheckboxRow;
