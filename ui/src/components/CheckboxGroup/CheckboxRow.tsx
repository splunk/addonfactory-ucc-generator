import React, { useState, useEffect } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import NumberComponent, { NumberChangeHandler } from '@splunk/react-ui/Number';
import styled from 'styled-components';
import Switch from '@splunk/react-ui/Switch';
import { StyledColumnLayout } from './StyledComponent';

const StyledSwitch = styled(Switch)`
    padding-left: 3px;
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

    return (
        <StyledColumnLayout>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={7}>
                    <StyledSwitch
                        key={field}
                        value={field}
                        selected={checkbox}
                        onClick={handleChangeCheckbox}
                        appearance="checkbox"
                        disabled={disabled}
                    >
                        {label}
                    </StyledSwitch>
                </ColumnLayout.Column>
                <ColumnLayout.Column span={3}>
                    <NumberComponent
                        inline
                        disabled={isTextDisabled}
                        defaultValue={input}
                        onChange={handleChangeInput}
                    />
                </ColumnLayout.Column>
            </ColumnLayout.Row>
        </StyledColumnLayout>
    );
}
export default CheckboxRow;
