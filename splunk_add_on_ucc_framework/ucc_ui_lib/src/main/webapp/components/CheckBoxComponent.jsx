import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';
import { isFalse } from '../util/util';

class CheckBoxComponent extends Component {
    handleChange = () => {
        if (isFalse(this.props.value)) {
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
                selected={!isFalse(this.props.value)}
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
