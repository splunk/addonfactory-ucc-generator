import React from 'react';
import TextArea from '@splunk/react-ui/TextArea';
import styled from 'styled-components';

const TextWrapper = styled(TextArea)`
    width: 320px !important;
`;

interface TextAreaComponentProps {
    id?: string;
    value: string | number;
    handleChange: (field: string, value: string) => void;
    field: string;
    error?: boolean;
    controlOptions?: { rowsMax?: number; rowsMin?: number };
    disabled?: boolean;
}

function TextAreaComponent(props: TextAreaComponentProps) {
    const handleChange = (e: unknown, { value }: { value: string }) => {
        props.handleChange(props.field, value);
    };

    return (
        <TextWrapper
            inputId={props.id}
            inline
            canClear
            error={props.error}
            className={props.field}
            disabled={props.disabled}
            value={props.value?.toString() || ''}
            onChange={handleChange}
            rowsMax={props?.controlOptions?.rowsMax ? props?.controlOptions?.rowsMax : 12}
            rowsMin={props?.controlOptions?.rowsMin ? props?.controlOptions?.rowsMin : 8}
        />
    );
}

export default TextAreaComponent;
