import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';
import { isFalse } from '../util/util';

class CheckBoxComponent extends Component {
    handleChange = () => {
        if (this.props.value && !isFalse(this.props.value)) {
            this.props.handleChange(this.props.field, 0);
        } else {
            this.props.handleChange(this.props.field, 1);
        }
    };

    render() {
        return (
            <Switch
                key={this.props.field}
                value={this.props.field}
                onClick={this.handleChange}
                disabled={this.props.disabled}
                selected={!(this.props.value ? isFalse(this.props.value) : true)}
                appearance="checkbox"
            />
        );
    }
}

CheckBoxComponent.propTypes = {
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    disabled: PropTypes.bool,
};

export default CheckBoxComponent;
