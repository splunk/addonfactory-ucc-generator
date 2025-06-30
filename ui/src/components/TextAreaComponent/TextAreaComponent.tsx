import React from 'react';
import TextArea, { TextAreaChangeHandler, TextAreaPropsBase } from '@splunk/react-ui/TextArea';
import styled from 'styled-components';

import { excludeControlWrapperProps } from '../ControlWrapper/utils';

export interface TextAreaComponentProps extends Omit<Partial<TextAreaPropsBase>, 'defaultValue'> {
    id?: string;
    value?: string;
    handleChange: (field: string, value: string) => void;
    field: string;
    controlOptions?: { rowsMax?: number; rowsMin?: number };
    encrypted?: boolean;
}

const MaskedTextArea = styled(TextArea)`
    textarea {
        -webkit-text-security: disc;
    }
`;

function TextAreaComponent({
    id,
    value,
    handleChange,
    field,
    controlOptions,
    encrypted,
    ...restProps
}: TextAreaComponentProps) {
    const onChange: TextAreaChangeHandler = (_e, data) => {
        handleChange(field, data.value);
    };

    const restSuiProps = excludeControlWrapperProps(restProps);

    const sharedProps = {
        ...restSuiProps,
        inputId: id,
        className: field,
        value: value?.toString() || '',
        onChange,
        rowsMax: controlOptions?.rowsMax ?? 12,
        rowsMin: controlOptions?.rowsMin ?? 8,
    };

    const TextAreaComp = encrypted ? MaskedTextArea : TextArea;

    return <TextAreaComp {...sharedProps} />;
}

export default TextAreaComponent;
