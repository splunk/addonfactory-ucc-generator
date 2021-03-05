import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';

class CheckBoxComponent extends Component {
    constructor(props) {
        super(props);
    }

    handleChange = (e, {value}) => {
        this.props.handleChange(this.props.id, value);
    };

    render() {
        return (
            <Switch
                key={this.props.field}
                value={this.props.value}
                onClick={this.handleChange}
                selected={this.props.value === 1 ? true : false}
                appearance="checkbox"
            >
            </Switch>
        );
    }
}

CheckBoxComponent.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.string,
    handleClick: PropTypes.func.isRequired,
    field: PropTypes.string,
    controlOptions: PropTypes.object,
};

export default CheckBoxComponent;
