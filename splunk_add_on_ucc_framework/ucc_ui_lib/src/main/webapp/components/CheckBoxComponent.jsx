import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';

class CheckBoxComponent extends Component {
    falseValues = ['0', 'FALSE', 'F', 'N', 'NO', 'NONE', ''];

    isFalse = () => {
        return this.falseValues.includes(this.props.value.toString().toUpperCase());
    };

    handleChange = () => {
        if (this.isFalse()) {
            this.props.handleChange(this.props.field, 1);
        } else {
            this.props.handleChange(this.props.field, 0);
        }
    };

    render() {
        return (
            <Switch
                key={this.props.field}
                value={this.props.field}
                onClick={this.handleChange}
                disabled={this.props.disabled}
                selected={!this.isFalse()}
                appearance="checkbox"
            />
        );
    }
}

CheckBoxComponent.propTypes = {
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    disabled: PropTypes.bool,
};

export default CheckBoxComponent;
