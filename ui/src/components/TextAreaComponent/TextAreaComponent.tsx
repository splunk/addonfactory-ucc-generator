import React from 'react';
import TextArea, { TextAreaChangeHandler, TextAreaPropsBase } from '@splunk/react-ui/TextArea';

import { excludeControlWrapperProps } from '../ControlWrapper/utils';

export interface TextAreaComponentProps extends Omit<Partial<TextAreaPropsBase>, 'defaultValue'> {
    id?: string;
    value?: string;
    handleChange: (field: string, value: string) => void;
    field: string;
    controlOptions?: { rowsMax?: number; rowsMin?: number };
}

function TextAreaComponent({
    id,
    value,
    handleChange,
    field,
    controlOptions,
    ...restProps
}: TextAreaComponentProps) {
    const onChange: TextAreaChangeHandler = (_e, data) => {
        handleChange(field, data.value);
    };

    const restSuiProps = excludeControlWrapperProps(restProps);
    return (
        <TextArea
            {...restSuiProps}
            inputId={id}
            className={field}
            value={value?.toString() || ''}
            onChange={onChange}
            rowsMax={controlOptions?.rowsMax ? controlOptions?.rowsMax : 12}
            rowsMin={controlOptions?.rowsMin ? controlOptions?.rowsMin : 8}
        />
    );
}

export default TextAreaComponent;
