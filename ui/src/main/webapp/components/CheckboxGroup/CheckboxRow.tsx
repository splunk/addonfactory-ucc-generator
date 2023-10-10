import React, { useState, useEffect } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Text from '@splunk/react-ui/Text';
import { TextChangeHandler } from '@splunk/react-ui/types/src/Text/Text';
import styled from 'styled-components';
import Switch from '@splunk/react-ui/Switch';
import { StyledColumnLayout } from './StyledComponent';

const StyledSwitch = styled(Switch)`
    padding-left: 3px;
`;
const StyledText = styled(Text)`
    padding-right: 3px;
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

    const handleChangeTextBox: TextChangeHandler = (event) => {
        if (event?.target && 'value' in event.target) {
            handleChange({ field, inputValue: Number(event.target.value), checkbox });
        }
    };

    const handleChangeCheckbox = (event: unknown, data: { selected: boolean; value?: unknown }) => {
        const previousValue = data.selected;
        handleChange({ field, inputValue: input, checkbox: !previousValue });
    };

    return (
        <StyledColumnLayout>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={5}>
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
                <ColumnLayout.Column span={2}>
                    <StyledText
                        inline
                        disabled={isTextDisabled}
                        value={input?.toString()}
                        onChange={handleChangeTextBox}
                        type="number"
                        required
                    />
                </ColumnLayout.Column>
            </ColumnLayout.Row>
        </StyledColumnLayout>
    );
}
export default CheckboxRow;
