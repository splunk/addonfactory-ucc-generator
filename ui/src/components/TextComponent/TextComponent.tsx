import React, { Component } from 'react';
import Text from '@splunk/react-ui/Text';

import { excludeControlWrapperProps } from '../ControlWrapper/utils';

export interface TextComponentProps {
    // Number is expected if provided number in globalConfig.json instead of a string.
    value: string | number;
    handleChange: (field: string, value: string | number) => void;
    field: string;
    error?: boolean;
    encrypted?: boolean;
    disabled?: boolean;
    id?: string;
}

class TextComponent extends Component<TextComponentProps> {
    handleChange = (e: unknown, { value }: { value: string | number }) => {
        this.props.handleChange(this.props.field, value);
    };

    render() {
        const { id, field, disabled, value, encrypted, ...restProps } = this.props;
        const restSuiProps = excludeControlWrapperProps(restProps);
        return (
            <Text
                {...restSuiProps}
                inputId={id}
                className={field}
                disabled={disabled && 'dimmed'}
                value={value === null || typeof value === 'undefined' ? '' : value.toString()}
                onChange={this.handleChange}
                type={encrypted ? 'password' : 'text'}
            />
        );
    }
}

export default TextComponent;
