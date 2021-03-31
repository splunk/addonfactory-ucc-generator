import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RadioBar from '@splunk/react-ui/RadioBar';

class RadioComponent extends Component {

    handleChange = (e, { value }) => {
        this.props.handleChange(this.props.field, value);
    };

    render() {
        return (
            <RadioBar
                inline
                onChange={this.handleChange}
                value={this.props.value}
                key={this.props.field}
                style={{ width: `50% !important` }}
            >
                {this.props.controlOptions.items.map(item => (
                    <RadioBar.Option key={item.value} value={item.value} label={item.label} />
                ))}
            </RadioBar>
        );
    }
}

RadioComponent.propTypes = {
    value: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    controlOptions: PropTypes.object
};


export default RadioComponent;