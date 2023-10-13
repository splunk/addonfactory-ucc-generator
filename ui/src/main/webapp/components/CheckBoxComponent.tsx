import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';
import { isFalse } from '../util/util';

interface CheckBoxComponentProps {
    value: boolean;
    handleChange: (field: string, value: boolean) => void;
    field: string;
    disabled: boolean;
}

class CheckBoxComponent extends React.Component<CheckBoxComponentProps> {
    handleChange = () => {
        if (this.props.value && !isFalse(this.props.value)) {
            this.props.handleChange(this.props.field, false);
        } else {
            this.props.handleChange(this.props.field, true);
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

export default CheckBoxComponent;
