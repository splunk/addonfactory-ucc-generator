import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Text from '@splunk/react-ui/Text';
import styled from 'styled-components';

const TextWrapper = styled(Text)`
    width: 320px !important;
`;

class TextComponent extends Component {
    handleChange = (e, { value }) => {
        this.props.handleChange(this.props.field, value);
    };

    render() {
        return (
            <TextWrapper
                inline
                error={this.props.error}
                placeholder={this.props?.controlOptions?.placeholder}
                className={this.props.field}
                disabled={this.props.disabled}
                value={
                    this.props.value === null || typeof this.props.value === 'undefined'
                        ? ''
                        : this.props.value.toString()
                }
                onChange={this.handleChange}
                type={this.props.encrypted ? 'password' : 'text'}
            />
        );
    }
}

TextComponent.propTypes = {
    // Number is expected if provided number in globalConfig.json instead of a string.
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    error: PropTypes.bool,
    controlOptions: PropTypes.object,
    encrypted: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default TextComponent;
