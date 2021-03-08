import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RadioBar from '@splunk/react-ui/RadioBar';

class RadioComponent extends Component {
    constructor(props) {
        super(props);
    }

    handleChange = (e, { value }) => {
        this.props.handleChange(this.props.id, value);
    };

    render() {
        return (
            <RadioBar
                inline
                onChange={this.handleChange}
                value={this.props.value}
                key={this.props.field}
            >
                {this.props.controlOptions.items.map(item => (
                    <RadioBar.Option key={item.value} value={item.value} label={item.label} />
                ))}
            </RadioBar>
        );
    }
}

RadioComponent.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    controlOptions: PropTypes.object
};


export default RadioComponent;

