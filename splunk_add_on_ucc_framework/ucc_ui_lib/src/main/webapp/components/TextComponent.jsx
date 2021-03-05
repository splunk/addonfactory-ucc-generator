import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Text from '@splunk/react-ui/Text';

class TextComponent extends Component {
    constructor(props) {
        super(props);
    }

    handleChange = (e, {value}) => {
        this.props.handleChange(this.props.id, value);
    };

    render() {
        return (
            <Text
                inline
                placeholder={this.props.controlOptions.placeholder}
                className={this.props.field}
                disabled={this.props.disabled}
                value={this.props.value}
                onChange={this.handleChange}
                type={this.props.encrypted === true ? 'password' : 'text'}
            />
        );
    }
}

TextComponent.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    controlOptions: PropTypes.object,
};

export default TextComponent;
