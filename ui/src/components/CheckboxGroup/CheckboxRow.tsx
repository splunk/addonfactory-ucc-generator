import React, { useEffect, useState } from 'react';
import NumberComponent, { NumberChangeHandler } from '@splunk/react-ui/Number';
import styled from 'styled-components';
import Switch from '@splunk/react-ui/Switch';
import { FixedCheckboxRowWidth } from './StyledComponent';

const StyledSwitch = styled(Switch)`
    padding: 0 3px;
    flex: min-content;
    align-items: baseline;
`;
const StyledNumber = styled.div`
    width: 80px;
`;
const StyledRow = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    ${FixedCheckboxRowWidth}
`;

interface CheckboxRowProps {
    field: string;
    label: string;
    checkbox: boolean;
    input?: number;
    disabled?: boolean;
    handleChange: (value: { field: string; checkbox: boolean; inputValue?: number }) => void;
}

function CheckboxRow(props: CheckboxRowProps) {
    const { field, label, checkbox, input, disabled, handleChange } = props;

    const [isTextDisabled, setIsTextDisabled] = useState(!checkbox || disabled);

    useEffect(() => {
        setIsTextDisabled(!checkbox || disabled);
    }, [checkbox, disabled]);

    const handleChangeInput: NumberChangeHandler = (event: unknown, { value }) => {
        handleChange({ field, inputValue: value, checkbox });
    };

    const handleChangeCheckbox = (event: unknown, data: { selected: boolean; value?: unknown }) => {
        const previousValue = data.selected;
        handleChange({ field, inputValue: input, checkbox: !previousValue });
    };

    const numberA11yLabel = `${label} value`;
    const checkboxA11yLabel = `${label} checkbox`;
    return (
        <StyledRow>
            <StyledSwitch
                aria-label={checkboxA11yLabel}
                data-test-field={field}
                selected={checkbox}
                onClick={handleChangeCheckbox}
                appearance="checkbox"
                disabled={disabled}
            >
                {label}
            </StyledSwitch>

            <StyledNumber>
                <NumberComponent
                    aria-label={numberA11yLabel}
                    data-test-field={field}
                    title={numberA11yLabel}
                    inline
                    disabled={isTextDisabled}
                    defaultValue={input}
                    onChange={handleChangeInput}
                />
            </StyledNumber>
        </StyledRow>
    );
}

export default CheckboxRow;
