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
    private wasMasked: boolean = false;

    handleChange = (e: unknown, { value }: { value: string | number }) => {
        this.props.handleChange(this.props.field, value);
    };

    handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (this.props.encrypted && e.target.value === '******') {
            this.wasMasked = true;
            this.props.handleChange(this.props.field, '');
        }
    };

    handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (this.props.encrypted && e.target.value === '' && this.wasMasked) {
            this.props.handleChange(this.props.field, '******');
            this.wasMasked = false;
        }
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
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                type={encrypted ? 'password' : 'text'}
            />
        );
    }
}

export default TextComponent;
