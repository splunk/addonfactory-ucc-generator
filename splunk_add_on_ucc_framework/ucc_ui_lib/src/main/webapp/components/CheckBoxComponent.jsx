import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';

class CheckBoxComponent extends Component {
    handleChange = () => {
        this.props.handleChange(this.props.field, 1 - this.props.value);
    };

    render() {
        return (
            <Switch
                key={this.props.field}
                value={this.props.field}
                onClick={this.handleChange}
                disabled={this.props.disabled}
                selected={['1', 1, true].includes(this.props.value)}
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
