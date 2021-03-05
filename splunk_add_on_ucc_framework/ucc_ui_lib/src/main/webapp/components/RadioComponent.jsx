import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RadioBar from '@splunk/react-ui/RadioBar';

class RadioComponent extends Component {
    constructor(props) {
        super(props);
    }

    handleChange = (e) => {
        this.props.handleChange(this.props.id, e.target.value)
    };

    render() {
        return (
            <RadioBar
                onChange={this.handleChange}
                value={this.props.value}
                key={this.props.field}
                style={{ width: 200 }}
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

